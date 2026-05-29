/**
 * QualifyModal — full-page Typeform-style lead qualification flow.
 *
 * UX:
 *   - One question per screen, big centred headline
 *   - Emoji answer tiles (single-select or multi-select)
 *   - Pill "OK" button to advance; Enter key advances too
 *   - Personalised — headlines use the captured first name once it's known
 *   - Subtle progress bar at the top, close (×) top-right
 *
 * Order:
 *   1. Turnover   — primary eligibility gate (`< £10k/mo` disqualifies)
 *   2. Name
 *   3. Email
 *   4. Role
 *   5. Company
 *   6. Website (optional, has Skip)
 *   7. Needs (multi-select)
 *   8. Timeline — secondary gate (`Just exploring` disqualifies)
 *   9. #1 thing to fix (textarea)
 *  10a. Disqualified → "not the right fit" + email path + insights link
 *  10b. Qualified → mandatory inline Cal.com embed; bookingSuccessful is
 *       the only forward path (Meta Lead + Schedule, GA4 Schedule, Formspree
 *       POST with the full qualification payload, redirect to thank-you).
 *
 * Why turnover instead of budget: turnover correlates with actual willingness
 * to pay (people lie about budget; revenue is verifiable later). It's also
 * the first thing the Typeform reference asks, which fits paid-traffic
 * eligibility-first UX best practice — disqualify before burning info collection.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@formspree/react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { trackContact, trackLead, trackSchedule, trackCustom } from '../utils/meta-tracking';
import { getCalcomTrackingMetadata, getLeadTrackingFields } from '../utils/lead-tracking';

declare global {
  interface Window {
    Cal?: any;
    gtag?: (...args: any[]) => void;
  }
}

const CAL_LINK = 'milktree-agency/free-brand-digital-presence-audit-30-minutes';
const CAL_NAMESPACE = 'qualify-modal';

// ── Answers ────────────────────────────────────────────────────────
interface Answers {
  turnover: string;
  name: string;
  email: string;
  role: string;
  company: string;
  website: string;
  needs: string[];
  timeline: string;
  pain: string;
}

const EMPTY: Answers = {
  turnover: '', name: '', email: '', role: '',
  company: '', website: '',
  needs: [], timeline: '', pain: '',
};

// ── Disqualification rules ────────────────────────────────────────
const DQ_TURNOVERS = new Set(['Less than £10k']);
const DQ_TIMELINES = new Set(['Just exploring, no plans yet']);

function isDisqualified(a: Answers): boolean {
  return DQ_TURNOVERS.has(a.turnover) || DQ_TIMELINES.has(a.timeline);
}

// ── Screen definitions (data-driven) ──────────────────────────────
type CardOption = { value: string; emoji: string; label: string };

type Screen =
  | {
      type: 'cards';
      key: keyof Pick<Answers, 'turnover' | 'role' | 'timeline'>;
      question: string;        // supports {name} interpolation
      subhead?: string;
      cols?: number;           // grid columns at desktop
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
      type: 'text';
      key: keyof Pick<Answers, 'name' | 'email' | 'company' | 'website'>;
      question: string;
      subhead?: string;
      placeholder: string;
      inputType?: 'text' | 'email';
      optional?: boolean;
      validate?: (v: string) => boolean;
    }
  | {
      type: 'textarea';
      key: 'pain';
      question: string;
      subhead?: string;
      placeholder: string;
      minLength: number;
    };

const SCREENS: Screen[] = [
  // 1. Turnover (eligibility gate, NO personalisation yet)
  {
    type: 'cards',
    key: 'turnover',
    question: "Let's start here — what is your <em>current</em> monthly turnover?",
    subhead: '⏱ Check eligibility in less than 2 mins',
    cols: 4,
    options: [
      { value: 'Less than £10k', emoji: '💪',  label: 'Less than £10k' },
      { value: '£10k - £20k',    emoji: '🧱',  label: '£10k - £20k' },
      { value: '£20k - £40k',    emoji: '🚗',  label: '£20k - £40k' },
      { value: '£40k - £70k',    emoji: '🚀',  label: '£40k - £70k' },
      { value: '£70k - £100k',   emoji: '🏗',  label: '£70k - £100k' },
      { value: '£100k+',         emoji: '🧨',  label: '£100k+' },
    ],
  },
  // 2. Name
  {
    type: 'text',
    key: 'name',
    question: 'Great — what should we call you?',
    subhead: 'First name is fine.',
    placeholder: 'Your name',
    inputType: 'text',
    validate: (v) => v.trim().length >= 2,
  },
  // 3. Email (personalised)
  {
    type: 'text',
    key: 'email',
    question: 'Thanks, {name} — best email for your audit?',
    subhead: "We'll only use it to send the audit and confirm your call.",
    placeholder: 'name@company.com',
    inputType: 'email',
    validate: (v) => /\S+@\S+\.\S+/.test(v.trim()),
  },
  // 4. Role
  {
    type: 'cards',
    key: 'role',
    question: "What's your role, {name}?",
    cols: 4,
    options: [
      { value: 'Founder / CEO',          emoji: '👑', label: 'Founder / CEO' },
      { value: 'Marketing lead',         emoji: '🎯', label: 'Marketing lead' },
      { value: 'Brand / design lead',    emoji: '🎨', label: 'Brand lead' },
      { value: 'Other',                  emoji: '🙂', label: 'Other' },
    ],
  },
  // 5. Company
  {
    type: 'text',
    key: 'company',
    question: "What's your company called?",
    placeholder: 'Acme Co.',
    inputType: 'text',
    validate: (v) => v.trim().length >= 1,
  },
  // 6. Website (optional)
  {
    type: 'text',
    key: 'website',
    question: 'Got a website we can look at?',
    subhead: "Optional — but it makes the audit much more useful.",
    placeholder: 'acmeco.com',
    inputType: 'text',
    optional: true,
  },
  // 7. Needs (multi)
  {
    type: 'multi',
    key: 'needs',
    question: 'What do you need help with?',
    subhead: 'Pick all that apply.',
    options: [
      { value: 'Brand identity / strategy', emoji: '🎨', label: 'Brand identity' },
      { value: 'Website / landing page',    emoji: '💻', label: 'Website' },
      { value: 'Design system',              emoji: '🔲', label: 'Design system' },
      { value: 'Content / social design',    emoji: '📱', label: 'Content / social' },
      { value: 'Generative AI visuals',      emoji: '🤖', label: 'AI visuals' },
      { value: 'Ongoing retainer',           emoji: '♾️', label: 'Retainer' },
      { value: 'Audit only',                 emoji: '📋', label: 'Audit only' },
      { value: 'Not sure yet',               emoji: '🤷', label: 'Not sure yet' },
    ],
  },
  // 8. Timeline (secondary gate)
  {
    type: 'cards',
    key: 'timeline',
    question: 'When would you want to start?',
    cols: 4,
    options: [
      { value: 'ASAP / urgent',                emoji: '🔥', label: 'ASAP' },
      { value: 'Within 1–3 months',            emoji: '📅', label: '1–3 months' },
      { value: '3–6 months out',               emoji: '🌱', label: '3–6 months' },
      { value: 'Just exploring, no plans yet', emoji: '👀', label: 'Just exploring' },
    ],
  },
  // 9. Pain
  {
    type: 'textarea',
    key: 'pain',
    question: "Last one — what's the #1 thing you want fixed?",
    subhead: 'One sentence is enough. This is what we focus on during the call.',
    placeholder: "e.g. Our positioning is fuzzy — prospects don't get what we do in 5 seconds.",
    minLength: 8,
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function interpolate(template: string, a: Answers): string {
  const first = a.name.trim().split(/\s+/)[0];
  return template.replace(/\{name\}/g, first || 'there');
}

function valueOf(a: Answers, key: Screen['key']): string | string[] {
  return a[key as keyof Answers];
}

function isScreenComplete(s: Screen, a: Answers): boolean {
  if (s.type === 'cards') return (a[s.key] as string) !== '';
  if (s.type === 'multi') return (a.needs as string[]).length > 0;
  if (s.type === 'text') {
    const v = (a[s.key] as string).trim();
    if (s.optional) return true;
    if (s.validate) return s.validate(v);
    return v !== '';
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
    : ((screenIdx) / totalScreens) * 100;

  // ── Body scroll lock + escape ────────────────────────────────
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

  // ── Reset state after fully closed ───────────────────────────
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

  // ── Advance ──────────────────────────────────────────────────
  const advance = () => {
    if (!currentScreen) return;
    if (!isScreenComplete(currentScreen, answers)) return;

    // After the LAST in-flow question (pain), evaluate qualification.
    if (screenIdx === SCREENS.length - 1) {
      const dq = isDisqualified(answers);
      const nameParts = answers.name.trim().split(/\s+/);
      const userData = {
        email: answers.email,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
      };

      // Pre-booking Contact signal (keeps Meta data on bail).
      trackContact({ eventSource: `${source} — Modal last step`, userData });

      if (dq) {
        const reasons: string[] = [];
        if (DQ_TURNOVERS.has(answers.turnover)) reasons.push('turnover');
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
          customData: { turnover: answers.turnover, timeline: answers.timeline },
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

  // Skip-button visible only for optional text screens
  const canSkip = currentScreen?.type === 'text' && currentScreen.optional;

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
      `Turnover: ${answers.turnover}`,
      `Role: ${answers.role}`,
      answers.company ? `Company: ${answers.company}` : '',
      answers.website ? `Website: ${answers.website}` : '',
      `Needs: ${answers.needs.join(', ')}`,
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
          q_turnover: answers.turnover,
          q_name: answers.name,
          q_email: answers.email,
          q_role: answers.role,
          q_company: answers.company,
          q_website: answers.website,
          q_needs: answers.needs.join(', '),
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

  // Reset Cal-init flag if user backs out of the booking terminal
  useEffect(() => {
    if (terminal !== 'book') {
      calInitialised.current = false;
      bookedRef.current = false;
    }
  }, [terminal]);

  // Enter advances when the current screen is complete
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      // Don't intercept newlines in textarea
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

  // ── Render ───────────────────────────────────────────────────
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
          {/* Top bar: progress + close */}
          <div className="qm-topbar">
            <div className="qm-progress" aria-hidden>
              <div className="qm-progress__bar" style={{ width: `${progress}%` }} />
            </div>
            <button type="button" className="qm-close" onClick={tryClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* Counter */}
          {!terminal && currentScreen && (
            <div className="qm-counter">
              <span>{String(screenIdx + 1).padStart(2, '0')}</span>
              <span className="qm-counter__sep" />
              <span>{String(totalScreens).padStart(2, '0')}</span>
            </div>
          )}

          {/* Main */}
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

          {/* Footer actions (hidden on terminal screens — they have their own) */}
          {!terminal && currentScreen && (
            <div className="qm-footer">
              {screenIdx > 0 && (
                <button type="button" className="qm-back" onClick={goBack}>← Back</button>
              )}
              {canSkip && (
                <button type="button" className="qm-skip" onClick={advance}>
                  Skip for now
                </button>
              )}
              <button
                type="button"
                className="qm-ok"
                onClick={advance}
                disabled={!isScreenComplete(currentScreen, answers)}
              >
                OK <ArrowRight size={16} />
              </button>
              <span className="qm-enter-hint">press <kbd>Enter ↵</kbd></span>
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
          {screen.options.map((opt) => {
            const selected = (answers[screen.key] as string) === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`qm-card ${selected ? 'is-selected' : ''}`}
                onClick={() => update(screen.key, opt.value as Answers[typeof screen.key])}
                aria-pressed={selected}
              >
                <span className="qm-card__emoji" aria-hidden>{opt.emoji}</span>
                <span className="qm-card__label">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {screen.type === 'multi' && (
        <div className="qm-cards" data-cols={4}>
          {screen.options.map((opt) => {
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
                <span className="qm-card__emoji" aria-hidden>{opt.emoji}</span>
                <span className="qm-card__label">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {screen.type === 'text' && (
        <input
          className="qm-input"
          type={screen.inputType ?? 'text'}
          placeholder={screen.placeholder}
          autoFocus
          autoComplete={
            screen.key === 'name' ? 'name'
            : screen.key === 'email' ? 'email'
            : screen.key === 'company' ? 'organization'
            : screen.key === 'website' ? 'url'
            : 'off'
          }
          value={answers[screen.key] as string}
          onChange={(e) => update(screen.key, e.target.value as Answers[typeof screen.key])}
        />
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

// ── Terminal: Book ────────────────────────────────────────────────
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
  const reasons: string[] = [];
  if (DQ_TURNOVERS.has(answers.turnover)) reasons.push('turnover');
  if (DQ_TIMELINES.has(answers.timeline)) reasons.push('timeline');
  const both = reasons.length === 2;
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
          {both ? (
            <>Based on your answers, the work you're after is a bigger investment than most businesses at your stage are ready for, and you're not ready to start yet. Better to be honest than to waste your time on a call.</>
          ) : reasons[0] === 'turnover' ? (
            <>Most of our brand engagements start at £3.5k+, which usually fits businesses doing £10k+/month. The work you're after may be better served by a smaller studio or freelance route at your current stage.</>
          ) : (
            <>It sounds like you're exploring. We focus on brands ready to move within ~90 days. When you're closer to starting, come back and book the call.</>
          )}
        </p>

        <div className="qm-dq-actions">
          <a href="https://milktreeagency.com/insights" target="_blank" rel="noopener noreferrer" className="qm-dq-link">
            <Mail size={16} /> Read our brand resources
          </a>
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

// ── Hook for callers ─────────────────────────────────────────────
export function useQualifyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
}
