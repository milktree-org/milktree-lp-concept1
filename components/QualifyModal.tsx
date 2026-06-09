/**
 * QualifyModal — full-page Typeform-style flow, original question set.
 *
 * UX shell (kept from the previous iteration):
 *   - Full-viewport dark navy overlay, brand-yellow accents
 *   - One screen per question, big centred heading, pill OK + Enter key
 *   - Progress bar + step counter at top, close × top-right
 *   - Personalised: headings interpolate {name} once captured
 *
 * Question set (restored to the original — no turnover):
 *   1. Name + Email      (grouped text — both required)
 *   2. Role              (cards)
 *   3. Company + Website (grouped text — company required, website optional)
 *   4. Stage             (cards)
 *   5. Needs             (multi-select cards)
 *   6. Budget            (cards)             — hard-gate input (combined w/ timeline)
 *   7. Timeline          (cards)             — hard-gate input (combined w/ budget)
 *   8. Pain              (textarea, min 8)
 *
 * Disqualification (hard gate) — requires BOTH to be true:
 *   - Budget   = "Under £1,000"                  AND
 *   - Timeline = "Just exploring, no plans yet"
 *   Either one alone still QUALIFIES.
 *   Disqualified path shows a polite "not the right fit" screen with
 *   a resource link + email mailto. Posts to Formspree with qualified=no
 *   so disqualified leads are still recoverable.
 *
 * Qualified path:
 *   Cal.com inline embed (mandatory) with name/email/notes prefilled.
 *   bookingSuccessful → Meta Lead+Schedule (Pixel+CAPI), GA4 Schedule,
 *   Formspree POST with qualified=yes + booked_call=yes, redirect to
 *   the path-aware thank-you page.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@formspree/react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { trackContact, trackLead, trackSchedule, trackCustom } from '../utils/meta-tracking';
import { getCalcomTrackingMetadata, getLeadTrackingFields } from '../utils/lead-tracking';

const CAL_LINK = 'milktree-agency/free-brand-digital-presence-audit-30-minutes';
const CAL_NAMESPACE = 'qualify-modal';

// The Milktree Brand Playbook — shown on the disqualified screen so
// leads that aren't call-ready still walk away with something useful.
const BRAND_PLAYBOOK_URL = 'https://docs.google.com/document/d/1coX9VPMGNV_3N7gYlvm7A57M3sENtr1Z2bqfcgI7r04/edit?usp=drivesdk';

// ── Answers (original schema — no turnover) ───────────────────────
interface Answers {
  name: string;
  email: string;
  role: string;
  company: string;
  website: string;
  stage: string;
  needs: string[];
  budget: string;
  timeline: string;
  pain: string;
}

const EMPTY: Answers = {
  name: '', email: '', role: '',
  company: '', website: '',
  stage: '', needs: [],
  budget: '', timeline: '', pain: '',
};

// ── Disqualification rules ────────────────────────────────────────
// Hard gate requires BOTH a sub-£1k budget AND a "just exploring" timeline;
// either one alone still qualifies. (Budget lowered from £3k on May 29.)
const DQ_BUDGETS = new Set(['Under £1,000']);
const DQ_TIMELINES = new Set(['Just exploring, no plans yet']);

function isDisqualified(a: Answers): boolean {
  return DQ_BUDGETS.has(a.budget) && DQ_TIMELINES.has(a.timeline);
}

// ── Field/screen types ────────────────────────────────────────────
type CardOption = { value: string; emoji: string; label: string };

type TextField = {
  key: 'name' | 'email' | 'company' | 'website';
  label: string;
  placeholder: string;
  inputType?: 'text' | 'email';
  autoComplete?: string;
  optional?: boolean;
  validate?: (v: string) => boolean;
};

type Screen =
  | {
      type: 'cards';
      key: keyof Pick<Answers, 'role' | 'stage' | 'budget' | 'timeline'>;
      question: string;        // supports {name} interpolation
      subhead?: string;
      cols?: number;
      options: CardOption[];
    }
  | {
      type: 'multi';
      key: 'needs';
      question: string;
      subhead?: string;
      options: CardOption[];
    }
  | {
      type: 'text-group';
      question: string;
      subhead?: string;
      fields: TextField[];
    }
  | {
      type: 'textarea';
      key: 'pain';
      question: string;
      subhead?: string;
      placeholder: string;
      minLength: number;
    };

// ── Original option sets ──────────────────────────────────────────
const ROLE_OPTIONS: CardOption[] = [
  { value: 'Founder / CEO',       emoji: '👑', label: 'Founder / CEO' },
  { value: 'Marketing lead',      emoji: '🎯', label: 'Marketing lead' },
  { value: 'Brand / design lead', emoji: '🎨', label: 'Brand / design lead' },
  { value: 'Other',               emoji: '🙂', label: 'Other' },
];

const STAGE_OPTIONS: CardOption[] = [
  { value: 'Pre-launch',                emoji: '🌱', label: 'Pre-launch' },
  { value: 'Launched, under 1 year',    emoji: '🌳', label: 'Under 1 year' },
  { value: 'Scaling (1–3 years)',       emoji: '🚀', label: 'Scaling (1–3 yrs)' },
  { value: 'Established (3+ years)',    emoji: '🏛️', label: 'Established (3+ yrs)' },
];

const NEED_OPTIONS: CardOption[] = [
  { value: 'Brand identity / strategy', emoji: '🎨', label: 'Brand identity' },
  { value: 'Website / landing page',    emoji: '💻', label: 'Website' },
  { value: 'Design system',              emoji: '🔲', label: 'Design system' },
  { value: 'Content / social design',    emoji: '📱', label: 'Content / social' },
  { value: 'Generative AI visuals',      emoji: '🤖', label: 'AI visuals' },
  { value: 'Ongoing retainer',           emoji: '♾️', label: 'Retainer' },
  { value: 'Audit only',                 emoji: '📋', label: 'Audit only' },
  { value: 'Not sure yet',               emoji: '🤷', label: 'Not sure yet' },
];

// May 29: new tiers reflecting real project price points.
const BUDGET_OPTIONS: CardOption[] = [
  { value: 'Under £1,000',                emoji: '🪙', label: 'Under £1,000' },
  { value: 'Between £1,000 to £2,000',    emoji: '💷', label: 'Between £1,000 to £2,000' },
  { value: '£2,000 to £5,000',            emoji: '💵', label: '£2,000 to £5,000' },
  { value: '£5,000 to £10,000',           emoji: '💎', label: '£5,000 to £10,000' },
];

const TIMELINE_OPTIONS: CardOption[] = [
  { value: 'ASAP / urgent',                emoji: '🔥', label: 'ASAP' },
  { value: 'Within 1–3 months',            emoji: '📅', label: '1–3 months' },
  { value: '3–6 months out',               emoji: '🗓️', label: '3–6 months' },
  { value: 'Just exploring, no plans yet', emoji: '👀', label: 'Just exploring' },
];

// ── Screens (8 in flow) ───────────────────────────────────────────
const SCREENS: Screen[] = [
  // 1. Identity — name + email grouped (user feedback: bunch text fields)
  {
    type: 'text-group',
    question: "Let's start with you.",
    subhead: '⏱ Takes under 2 minutes. We use this to prep your audit.',
    fields: [
      {
        key: 'name',
        label: 'Your name',
        placeholder: 'First and last name',
        inputType: 'text',
        autoComplete: 'name',
        validate: (v) => v.trim().length >= 2,
      },
      {
        key: 'email',
        label: 'Work email',
        placeholder: 'name@company.com',
        inputType: 'email',
        autoComplete: 'email',
        validate: (v) => /\S+@\S+\.\S+/.test(v.trim()),
      },
    ],
  },
  // 2. Role
  {
    type: 'cards',
    key: 'role',
    question: "What's your role, {name}?",
    cols: 4,
    options: ROLE_OPTIONS,
  },
  // 3. Company + Website grouped (website optional)
  {
    type: 'text-group',
    question: 'About your business.',
    subhead: "We'll audit what's already out there before the call.",
    fields: [
      {
        key: 'company',
        label: 'Company name',
        placeholder: 'Acme Co.',
        inputType: 'text',
        autoComplete: 'organization',
        validate: (v) => v.trim().length >= 1,
      },
      {
        key: 'website',
        label: 'Website (optional)',
        placeholder: 'acmeco.com',
        inputType: 'text',
        autoComplete: 'url',
        optional: true,
      },
    ],
  },
  // 4. Stage
  {
    type: 'cards',
    key: 'stage',
    question: 'Where is your brand today?',
    cols: 4,
    options: STAGE_OPTIONS,
  },
  // 5. Needs
  {
    type: 'multi',
    key: 'needs',
    question: 'What do you need help with?',
    subhead: 'Pick all that apply.',
    options: NEED_OPTIONS,
  },
  // 6. Budget — primary disqualifier. 2×2 grid: 4 tiers, labels are
  //    longer than the previous "Under £3k" / "£3–6k" style so they
  //    need the wider tiles a 2-col layout gives them.
  {
    type: 'cards',
    key: 'budget',
    question: "What's your project budget, {name}?",
    subhead: 'Honesty here saves both our time — no wrong answer.',
    cols: 2,
    options: BUDGET_OPTIONS,
  },
  // 7. Timeline — secondary disqualifier
  {
    type: 'cards',
    key: 'timeline',
    question: 'When would you want to start?',
    cols: 4,
    options: TIMELINE_OPTIONS,
  },
  // 8. Pain
  {
    type: 'textarea',
    key: 'pain',
    question: "Last one — what's the #1 thing you want fixed?",
    subhead: 'One sentence is fine. This is what we focus on during the call.',
    placeholder: "e.g. Our positioning is fuzzy — prospects don't get what we do in 5 seconds.",
    minLength: 8,
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function interpolate(template: string, a: Answers): string {
  const first = a.name.trim().split(/\s+/)[0];
  return template.replace(/\{name\}/g, first || 'there');
}

function isScreenComplete(s: Screen, a: Answers): boolean {
  if (s.type === 'cards') return (a[s.key] as string) !== '';
  if (s.type === 'multi') return a.needs.length > 0;
  if (s.type === 'text-group') {
    return s.fields.every(f => {
      const v = (a[f.key] as string).trim();
      if (f.optional) return true;
      if (f.validate) return f.validate(v);
      return v !== '';
    });
  }
  if (s.type === 'textarea') return a.pain.trim().length >= s.minLength;
  return true;
}

// ── Component ─────────────────────────────────────────────────────
export interface QualifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Tracking source label, e.g. "Main LP FinalCTA" */
  source: string;
}

type Terminal = 'book' | 'disqualified';

export const QualifyModal: React.FC<QualifyModalProps> = ({ isOpen, onClose, source }) => {
  const [state, handleSubmit] = useForm('auditForm');
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [screenIdx, setScreenIdx] = useState(0);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const navigate = useNavigate();

  const update = <K extends keyof Answers>(
    key: K,
    value: Answers[K] | ((prev: Answers[K]) => Answers[K]),
  ) =>
    setAnswers(prev => ({
      ...prev,
      [key]: typeof value === 'function'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (value as any)(prev[key])
        : value,
    }));

  const currentScreen = terminal ? null : SCREENS[screenIdx];
  const totalScreens = SCREENS.length;
  const progress = terminal
    ? 100
    : (screenIdx / totalScreens) * 100;

  // Scroll-lock + Escape
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tryClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, screenIdx, terminal]);

  // Reset after fully closed
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setAnswers(EMPTY);
        setScreenIdx(0);
        setTerminal(null);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const tryClose = () => {
    if (screenIdx > 0 || terminal) {
      const ok = window.confirm('Close and lose your progress?');
      if (!ok) return;
    }
    onClose();
  };

  const advance = () => {
    if (!currentScreen) return;
    if (!isScreenComplete(currentScreen, answers)) return;

    // Last in-flow screen → evaluate qualification
    if (screenIdx === SCREENS.length - 1) {
      const dq = isDisqualified(answers);
      const nameParts = answers.name.trim().split(/\s+/);
      const userData = {
        email: answers.email,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
      };

      // Pre-booking Contact signal so we still have Meta data if they bail
      trackContact({ eventSource: `${source} — Modal last step`, userData });

      if (dq) {
        const reasons: string[] = [];
        if (DQ_BUDGETS.has(answers.budget)) reasons.push('budget');
        if (DQ_TIMELINES.has(answers.timeline)) reasons.push('timeline');
        try {
          handleSubmit({
            service: 'Brand Audit Request',
            source,
            qualified: 'no',
            disqualified_reason: reasons.join(','),
            ...answers,
            needs: answers.needs.join(', '),
            ...getLeadTrackingFields(),
          });
        } catch { /* non-blocking */ }

        trackCustom('LeadDisqualified', {
          eventSource: source,
          userData,
          customData: { budget: answers.budget, timeline: answers.timeline },
        });
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'lead_disqualified', {
            event_category: 'Qualify Modal',
            event_label: source,
            send_to: 'G-9GHX9JVN9S',
          });
        }
        setTerminal('disqualified');
        return;
      }

      setTerminal('book');
      return;
    }

    setScreenIdx(screenIdx + 1);
  };

  const goBack = () => {
    if (terminal) {
      setTerminal(null);
      setScreenIdx(SCREENS.length - 1);
      return;
    }
    if (screenIdx > 0) setScreenIdx(screenIdx - 1);
  };

  // ── Cal.com embed (book terminal) ─────────────────────────────
  const calContainerRef = useRef<HTMLDivElement | null>(null);
  const calInitialised = useRef(false);
  const bookedRef = useRef(false);
  const [calSlotReady, setCalSlotReady] = useState(false);
  const setCalNode = useCallback((node: HTMLDivElement | null) => {
    calContainerRef.current = node;
    setCalSlotReady(!!node);
  }, []);

  useEffect(() => {
    if (terminal !== 'book') return;
    if (calInitialised.current) return;
    if (!calSlotReady || !calContainerRef.current) return;
    calInitialised.current = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (function (C: any, A: string, L: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (a: any, ar: any) => a.q.push(ar);
      const d = C.document;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      C.Cal = C.Cal || function (...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cal: any = C.Cal;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (args[0] === L) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const api: any = function (...inner: any[]) { p(api, inner); };
          const ns = args[1];
          api.q = api.q || [];
          if (typeof ns === 'string') {
            cal.ns[ns] = cal.ns[ns] || api;
            p(cal.ns[ns], args);
            p(cal, ['initNamespace', ns]);
          } else {
            p(cal, args);
          }
          return;
        }
        p(cal, args);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');

    const notes = [
      `Role: ${answers.role}`,
      answers.company ? `Company: ${answers.company}` : '',
      answers.website ? `Website: ${answers.website}` : '',
      `Stage: ${answers.stage}`,
      `Needs: ${answers.needs.join(', ')}`,
      `Budget: ${answers.budget}`,
      `Timeline: ${answers.timeline}`,
      '',
      `#1 thing to fix: ${answers.pain}`,
    ].filter(Boolean).join('\n');

    const prefill = new URLSearchParams();
    prefill.set('name', answers.name.trim());
    prefill.set('email', answers.email.trim());
    prefill.set('notes', notes);
    const calLinkWithPrefill = `${CAL_LINK}?${prefill.toString()}`;

    const trackingMetadata = getCalcomTrackingMetadata();
    const Cal = window.Cal;
    Cal('init', CAL_NAMESPACE, { origin: 'https://cal.com' });
    Cal.ns[CAL_NAMESPACE]('inline', {
      elementOrSelector: '#qualify-modal-cal',
      config: {
        layout: 'month_view',
        theme: 'dark',
        metadata: {
          source: `${source} - Qualify Modal`,
          q_name: answers.name,
          q_email: answers.email,
          q_role: answers.role,
          q_company: answers.company,
          q_website: answers.website,
          q_stage: answers.stage,
          q_needs: answers.needs.join(', '),
          q_budget: answers.budget,
          q_timeline: answers.timeline,
          q_pain: answers.pain.slice(0, 500),
          ...trackingMetadata,
        },
      },
      calLink: calLinkWithPrefill,
    });
    Cal.ns[CAL_NAMESPACE]('ui', {
      hideEventTypeDetails: false,
      layout: 'month_view',
      cssVarsPerTheme: { dark: { 'cal-brand': '#FFDC04' } },
    });

    Cal.ns[CAL_NAMESPACE]('on', {
      action: 'bookingSuccessful',
      callback: async () => {
        if (bookedRef.current) return;
        bookedRef.current = true;

        const nameParts = answers.name.trim().split(/\s+/);
        const userData = {
          email: answers.email,
          firstName: nameParts[0] || undefined,
          lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
        };

        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', {
            event_category: 'Qualify Modal',
            event_label: `${source} — Qualified Booking`,
            value: 1, currency: 'GBP', send_to: 'G-9GHX9JVN9S',
          });
          window.gtag('event', 'conversion', {
            event_category: 'Schedule',
            event_label: `${source} — Cal.com Booking`,
            value: 1, currency: 'GBP', send_to: 'G-9GHX9JVN9S',
          });
        }
        trackLead({ eventSource: `${source} — Qualified Booking`, userData });
        trackSchedule({ eventSource: `${source} — Cal.com Booking`, userData });

        try {
          await handleSubmit({
            service: 'Brand Audit Request',
            source,
            qualified: 'yes',
            booked_call: 'yes',
            ...answers,
            needs: answers.needs.join(', '),
            ...getLeadTrackingFields(),
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[QualifyModal] Formspree post-booking POST failed', err);
        }

        const onAuditSubdomain = typeof window !== 'undefined' && window.location.hostname === 'audit.milktreeagency.com';
        const onAuditPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/audit');
        const tyPath = onAuditSubdomain
          ? '/thank-you?booked=1'
          : onAuditPath
            ? '/audit/thank-you?booked=1'
            : '/thank-you?booked=1';
        navigate(tyPath);
        onClose();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminal, calSlotReady]);

  // Reset Cal init flag if user backs out of booking
  useEffect(() => {
    if (terminal !== 'book') {
      calInitialised.current = false;
      bookedRef.current = false;
    }
  }, [terminal]);

  // Enter advances when current screen is complete
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if ((e.target as HTMLElement | null)?.tagName === 'TEXTAREA') return;
      if (terminal) return;
      if (currentScreen && isScreenComplete(currentScreen, answers)) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, screenIdx, answers, terminal]);

  // ── Power-user shortcut: pressing 1-9 picks card N on cards/multi
  //    screens. Ignored on text screens (the input handles digits).
  useEffect(() => {
    if (!isOpen || terminal || !currentScreen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (!/^[1-9]$/.test(e.key)) return;
      const idx = parseInt(e.key, 10) - 1;
      if (currentScreen.type === 'cards' && currentScreen.options[idx]) {
        e.preventDefault();
        update(currentScreen.key, currentScreen.options[idx].value as Answers[typeof currentScreen.key]);
      } else if (currentScreen.type === 'multi' && currentScreen.options[idx]) {
        e.preventDefault();
        const opt = currentScreen.options[idx].value;
        update('needs', (prev) =>
          prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, terminal, screenIdx]);

  // ── Auto-advance on single-select cards (CRO win + LeadTap divergence).
  //    Fires ~320ms after the user picks an option; cancelled by screen
  //    change. Doesn't run on multi-select (`needs`), text or textarea
  //    screens — those still wait for explicit Continue/Enter.
  useEffect(() => {
    if (!isOpen || terminal || !currentScreen) return;
    if (currentScreen.type !== 'cards') return;
    if (!isScreenComplete(currentScreen, answers)) return;
    const t = window.setTimeout(() => { advance(); }, 320);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, terminal, screenIdx, answers]);

  // ── Render ────────────────────────────────────────────────────
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="qm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Qualify your free brand audit"
        >
          <div className="qm-topbar">
            <div className="qm-progress" aria-hidden>
              <div className="qm-progress__bar" style={{ width: `${progress}%` }} />
            </div>
            <button type="button" className="qm-close" onClick={tryClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {!terminal && currentScreen && (
            <div className="qm-counter">
              <span>{String(screenIdx + 1).padStart(2, '0')}</span>
              <span className="qm-counter__sep" />
              <span>{String(totalScreens).padStart(2, '0')}</span>
            </div>
          )}

          <div className="qm-main">
            <AnimatePresence mode="wait">
              {terminal === 'book' ? (
                <BookTerminal key="book" setCalNode={setCalNode} />
              ) : terminal === 'disqualified' ? (
                <DisqualifiedTerminal key="dq" answers={answers} onClose={onClose} />
              ) : currentScreen ? (
                <motion.div
                  key={`s-${screenIdx}`}
                  className="qm-screen"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  <ScreenView screen={currentScreen} answers={answers} update={update} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {!terminal && currentScreen && (
            <div className="qm-footer">
              {screenIdx > 0 && (
                <button type="button" className="qm-back" onClick={goBack}>← Back</button>
              )}
              <button
                type="button"
                className="qm-ok"
                onClick={advance}
                disabled={!isScreenComplete(currentScreen, answers)}
              >
                Continue <ArrowRight size={16} />
              </button>
              <span className="qm-enter-hint">
                press <kbd>Enter ↵</kbd>
                {currentScreen.type === 'cards' || currentScreen.type === 'multi'
                  ? <> · <kbd>1–9</kbd> picks</>
                  : null}
              </span>
            </div>
          )}

          {state.errors && state.errors.getAllFieldErrors().length > 0 && (
            <div className="qm-error">
              Something went wrong saving your details. Your booking is still confirmed if you completed it.
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ── Screen renderer ───────────────────────────────────────────────
const ScreenView: React.FC<{
  screen: Screen;
  answers: Answers;
  update: <K extends keyof Answers>(
    key: K,
    value: Answers[K] | ((prev: Answers[K]) => Answers[K]),
  ) => void;
}> = ({ screen, answers, update }) => {
  const question = interpolate(screen.question, answers);
  return (
    <div className="qm-screen__inner">
      <h1 className="qm-q" dangerouslySetInnerHTML={{ __html: question }} />
      {screen.subhead && <p className="qm-sub">{screen.subhead}</p>}

      {screen.type === 'cards' && (
        <div className="qm-cards" data-cols={screen.cols ?? 4}>
          {screen.options.map((opt, idx) => {
            const selected = (answers[screen.key] as string) === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`qm-card ${selected ? 'is-selected' : ''}`}
                onClick={() => update(screen.key, opt.value as Answers[typeof screen.key])}
                aria-pressed={selected}
              >
                {/* Small index badge — doubles as a keyboard-shortcut hint
                    (press 1-9 to pick option N). Distinguishes the card
                    visually from the reference's plain tile. */}
                <span className="qm-card__num" aria-hidden>{String(idx + 1).padStart(2, '0')}</span>
                <span className="qm-card__emoji" aria-hidden>{opt.emoji}</span>
                <span className="qm-card__label">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {screen.type === 'multi' && (
        <div className="qm-cards" data-cols={4}>
          {screen.options.map((opt, idx) => {
            const selected = answers.needs.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className={`qm-card ${selected ? 'is-selected' : ''}`}
                onClick={() =>
                  update('needs', (prev) =>
                    prev.includes(opt.value) ? prev.filter(v => v !== opt.value) : [...prev, opt.value]
                  )
                }
                aria-pressed={selected}
              >
                <span className="qm-card__num" aria-hidden>{String(idx + 1).padStart(2, '0')}</span>
                <span className="qm-card__emoji" aria-hidden>{opt.emoji}</span>
                <span className="qm-card__label">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {screen.type === 'text-group' && (
        <div className="qm-fieldset">
          {screen.fields.map((f, i) => (
            <label key={f.key} className="qm-field">
              <span className="qm-field__label">{f.label}</span>
              <input
                className="qm-field__input"
                type={f.inputType ?? 'text'}
                placeholder={f.placeholder}
                value={answers[f.key] as string}
                autoFocus={i === 0}
                autoComplete={f.autoComplete}
                onChange={(e) => update(f.key, e.target.value as Answers[typeof f.key])}
              />
            </label>
          ))}
        </div>
      )}

      {screen.type === 'textarea' && (
        <>
          <textarea
            className="qm-textarea"
            rows={4}
            autoFocus
            placeholder={screen.placeholder}
            maxLength={500}
            value={answers.pain}
            onChange={(e) => update('pain', e.target.value)}
          />
          <p className="qm-hint">
            {answers.pain.trim().length < screen.minLength
              ? 'A short sentence is enough.'
              : `${answers.pain.length}/500`}
          </p>
        </>
      )}
    </div>
  );
};

// ── Terminal: Book (mandatory Cal.com embed) ──────────────────────
const BookTerminal: React.FC<{ setCalNode: (node: HTMLDivElement | null) => void }> = ({ setCalNode }) => (
  <motion.div
    key="book"
    className="qm-screen qm-screen--book"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.3 }}
  >
    <div className="qm-screen__inner">
      <h1 className="qm-q">
        <CheckCircle size={28} color="#FFDC04" style={{ verticalAlign: '-6px', marginRight: 10 }} />
        Pick a 30-minute slot.
      </h1>
      <p className="qm-sub">Your audit doesn't start until your call is booked. Pick a time below — we'll confirm instantly.</p>

      <div ref={setCalNode} id="qualify-modal-cal" className="qm-cal" />

      <p className="qm-hint qm-hint--cta">
        Trouble with the calendar?{' '}
        <a href={`https://cal.com/${CAL_LINK}`} target="_blank" rel="noopener noreferrer">
          Open it in a new tab
        </a>
      </p>
    </div>
  </motion.div>
);

// ── Terminal: Disqualified ────────────────────────────────────────
const DisqualifiedTerminal: React.FC<{ answers: Answers; onClose: () => void }> = ({ answers, onClose }) => {
  // Only reachable when BOTH budget = "Under £1,000" AND timeline = "Just exploring"
  // are true (see isDisqualified). A single trigger no longer disqualifies.
  return (
    <motion.div
      key="dq"
      className="qm-screen qm-screen--dq"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.3 }}
    >
      <div className="qm-screen__inner">
        <AlertCircle size={40} color="#FFDC04" style={{ marginBottom: 16 }} />
        <h1 className="qm-q">We may not be the right fit — yet.</h1>
        <p className="qm-sub" style={{ maxWidth: 620 }}>
          Based on your answers, the work you're after is a bigger investment than the budget you have, and you're not ready to start yet. Better to be honest than to waste your time on a call.
        </p>

        {/* Brand playbook — a useful parting gift so leads that aren't
            call-ready still walk away with something concrete. */}
        <a
          href={BRAND_PLAYBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="qm-dq-playbook"
        >
          <span className="qm-dq-playbook__icon" aria-hidden>📘</span>
          <span className="qm-dq-playbook__body">
            <span className="qm-dq-playbook__eyebrow">Free guide</span>
            <span className="qm-dq-playbook__title">The Milktree Brand Playbook</span>
            <span className="qm-dq-playbook__sub">
              What separates a brand that gets remembered from one that doesn't. Yours to keep.
            </span>
          </span>
          <ArrowRight size={18} className="qm-dq-playbook__arrow" />
        </a>

        <div className="qm-dq-actions">
          <a
            href={`mailto:hello@milktreeagency.com?subject=Brand%20audit%20question&body=${encodeURIComponent('Hi Milktree,\n\nI saw your site and wanted to get in touch.\n\n— ' + (answers.name || '') + (answers.email ? ' (' + answers.email + ')' : ''))}`}
            className="qm-dq-link"
          >
            <Mail size={16} /> Email us directly
          </a>
        </div>
        <button type="button" className="qm-ok qm-ok--dq" onClick={onClose}>Close</button>
      </div>
    </motion.div>
  );
};

// ── Hook ──────────────────────────────────────────────────────────
export function useQualifyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
}
