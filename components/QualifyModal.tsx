/**
 * QualifyModal — multi-step lead qualification + mandatory Cal.com booking.
 *
 * Flow:
 *   1. Identity        (name, email, role)
 *   2. Company         (company name, website)
 *   3. Project         (stage, needs)
 *   4. Investment      (budget, timeline)
 *   5. Pain            (#1 thing to fix — open text)
 *   6a. If disqualified (budget < £3k OR timeline = "just exploring"):
 *       → polite "not the right fit" screen + resource + email
 *   6b. Else → Cal.com inline embed (prefilled with name/email/notes
 *       containing the full qualification payload). Booking is the conversion;
 *       on bookingSuccessful we POST to Formspree, fire all tracking, and
 *       redirect to /thank-you?booked=1.
 *
 * Why a modal: the campaign objective is moving from "form filled" to "call
 * booked." We need qualification before the calendar so we don't waste slots,
 * and we need it inside a focused overlay so the prospect can't bail back
 * into page distractions.
 *
 * Important UX/perf notes:
 *   - Body scroll-locked while open (overflow:hidden on <html>).
 *   - Escape + click-outside close, but require confirmation if past step 1.
 *   - Cal.com embed.js (~400KB) is only injected when the qualified step is
 *     reached, per CLAUDE.md Rule 3.
 *   - Cal embed uses callback ref + ready flag to survive AnimatePresence
 *     mode="wait" mount timing (the bug we fixed in FinalCTA last round).
 *   - Prefill goes via URL params on calLink — the version-stable method.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '@formspree/react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, CalendarCheck, Mail } from 'lucide-react';
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

// ── Option lists ──────────────────────────────────────────────────
const ROLE_OPTIONS = [
  'Founder / CEO',
  'Marketing lead',
  'Brand / design lead',
  'Other',
];

const STAGE_OPTIONS = [
  'Pre-launch',
  'Launched, under 1 year',
  'Scaling (1–3 years)',
  'Established (3+ years)',
];

const NEED_OPTIONS = [
  'Brand identity / strategy',
  'Website / landing page',
  'Design system',
  'Content / social design',
  'Generative AI visuals',
  'Ongoing retainer',
  'Audit only',
  'Not sure yet',
];

const BUDGET_OPTIONS = [
  { value: 'Under £3k',  disqualifies: true  },
  { value: '£3–6k',      disqualifies: false },
  { value: '£6–15k',     disqualifies: false },
  { value: '£15k+',      disqualifies: false },
  { value: 'Not sure yet', disqualifies: false },
];

const TIMELINE_OPTIONS = [
  { value: 'ASAP / urgent',              disqualifies: false },
  { value: 'Within 1–3 months',          disqualifies: false },
  { value: '3–6 months out',             disqualifies: false },
  { value: 'Just exploring, no plans yet', disqualifies: true  },
];

// ── Types ─────────────────────────────────────────────────────────
export interface QualifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Used as the tracking source label, e.g. "Main LP FinalCTA" */
  source: string;
}

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

const EMPTY_ANSWERS: Answers = {
  name: '', email: '', role: '',
  company: '', website: '',
  stage: '', needs: [],
  budget: '', timeline: '',
  pain: '',
};

type StepId = 'identity' | 'company' | 'project' | 'investment' | 'pain' | 'book' | 'disqualified';
const FLOW: StepId[] = ['identity', 'company', 'project', 'investment', 'pain'];
// Step indices used to drive the progress bar. The terminal screens
// (book/disqualified) sit outside the progress.

// ── Validation per step ──────────────────────────────────────────
function isStepComplete(step: StepId, a: Answers): boolean {
  switch (step) {
    case 'identity':   return a.name.trim() !== '' && /\S+@\S+\.\S+/.test(a.email) && a.role !== '';
    case 'company':    return a.company.trim() !== '';  // website optional but recommended
    case 'project':    return a.stage !== '' && a.needs.length > 0;
    case 'investment': return a.budget !== '' && a.timeline !== '';
    case 'pain':       return a.pain.trim().length >= 8; // minimum signal
    default:           return true;
  }
}

function isDisqualified(a: Answers): boolean {
  const budget = BUDGET_OPTIONS.find(o => o.value === a.budget);
  const timeline = TIMELINE_OPTIONS.find(o => o.value === a.timeline);
  return !!(budget?.disqualifies || timeline?.disqualifies);
}

// ── Main component ───────────────────────────────────────────────
export const QualifyModal: React.FC<QualifyModalProps> = ({ isOpen, onClose, source }) => {
  const [state, handleSubmit] = useForm('auditForm');
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [stepId, setStepId] = useState<StepId>('identity');
  const navigate = useNavigate();

  // `value` may be either a direct value or a functional updater so that
  // multi-select toggles can be applied in tight sequence without losing
  // intermediate state (closure-stale issue when two chips are clicked
  // before React re-renders).
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

  const flowIdx = FLOW.indexOf(stepId); // -1 for book/disqualified
  const progress = flowIdx >= 0 ? ((flowIdx + 1) / FLOW.length) * 100 : 100;

  // ── Body scroll lock + escape-to-close ─────────────────────────
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
  }, [isOpen, stepId]);

  // ── Reset when fully closed ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      // Defer so exit animation doesn't visibly flash empty state
      const t = setTimeout(() => {
        setAnswers(EMPTY_ANSWERS);
        setStepId('identity');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const tryClose = () => {
    if (flowIdx > 0 || stepId === 'book' || stepId === 'disqualified') {
      const ok = window.confirm('Close and lose your progress?');
      if (!ok) return;
    }
    onClose();
  };

  // ── Advance step ──────────────────────────────────────────────
  const advance = () => {
    if (flowIdx < 0) return;
    if (!isStepComplete(stepId, answers)) return;

    // After the last in-flow step (pain), branch on qualification.
    if (stepId === 'pain') {
      const dq = isDisqualified(answers);

      // Fire Contact on Meta regardless — we have email at this point.
      // (The leak we patched in the previous round: capture an intent
      // signal pre-booking so we still see Meta data if they bail.)
      const nameParts = answers.name.trim().split(/\s+/);
      trackContact({
        eventSource: `${source} — Modal step 5`,
        userData: {
          email: answers.email,
          firstName: nameParts[0] || undefined,
          lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
        },
      });

      if (dq) {
        // POST disqualified lead to Formspree so Levi sees it — these are
        // real humans too, just not call-ready right now.
        try {
          handleSubmit({
            service: 'Brand Audit Request',
            source,
            qualified: 'no',
            disqualified_reason: [
              BUDGET_OPTIONS.find(o => o.value === answers.budget)?.disqualifies ? 'budget' : '',
              TIMELINE_OPTIONS.find(o => o.value === answers.timeline)?.disqualifies ? 'timeline' : '',
            ].filter(Boolean).join(','),
            ...answers,
            needs: answers.needs.join(', '),
            ...getLeadTrackingFields(),
          });
        } catch { /* non-blocking */ }

        // Soft conversion: Meta CustomEvent so we can analyse fit-rate.
        trackCustom('LeadDisqualified', {
          eventSource: source,
          userData: {
            email: answers.email,
            firstName: nameParts[0] || undefined,
            lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
          },
          customData: { budget: answers.budget, timeline: answers.timeline },
        });

        if (typeof window.gtag === 'function') {
          window.gtag('event', 'lead_disqualified', {
            event_category: 'Qualify Modal',
            event_label: source,
            send_to: 'G-9GHX9JVN9S',
          });
        }

        setStepId('disqualified');
        return;
      }

      setStepId('book');
      return;
    }

    setStepId(FLOW[flowIdx + 1]);
  };

  const goBack = () => {
    if (stepId === 'disqualified' || stepId === 'book') {
      setStepId('pain');
      return;
    }
    if (flowIdx > 0) setStepId(FLOW[flowIdx - 1]);
  };

  // ── Cal.com inline embed (book step only) ─────────────────────
  const calContainerRef = useRef<HTMLDivElement | null>(null);
  const calInitialised = useRef(false);
  const bookedRef = useRef(false);
  const [calSlotReady, setCalSlotReady] = useState(false);
  const setCalNode = useCallback((node: HTMLDivElement | null) => {
    calContainerRef.current = node;
    setCalSlotReady(!!node);
  }, []);

  useEffect(() => {
    if (stepId !== 'book') return;
    if (calInitialised.current) return;
    if (!calSlotReady || !calContainerRef.current) return;
    calInitialised.current = true;

    // Bootstrap (lazy-loads embed.js the first time Cal(...) is called).
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

    // Build calLink with prefill query params. The notes field carries the
    // FULL qualification summary so the call starts with context, not
    // discovery.
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

    const prefillParams = new URLSearchParams();
    prefillParams.set('name', answers.name.trim());
    prefillParams.set('email', answers.email.trim());
    prefillParams.set('notes', notes);
    const calLinkWithPrefill = `${CAL_LINK}?${prefillParams.toString()}`;

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

        // ── Primary conversions (call booked) ────────────────
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', {
            event_category: 'Qualify Modal',
            event_label: `${source} — Qualified Booking`,
            value: 1, currency: 'GBP',
            send_to: 'G-9GHX9JVN9S',
          });
          window.gtag('event', 'conversion', {
            event_category: 'Schedule',
            event_label: `${source} — Cal.com Booking`,
            value: 1, currency: 'GBP',
            send_to: 'G-9GHX9JVN9S',
          });
        }
        trackLead({ eventSource: `${source} — Qualified Booking`, userData });
        trackSchedule({ eventSource: `${source} — Cal.com Booking`, userData });

        // ── Persist full qualification to Formspree ──────────
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

        // Route to the correct thank-you page based on where the modal was opened.
        // On the audit subdomain, /thank-you IS the audit TY page.
        // On the main domain at /audit/*, the audit TY page is /audit/thank-you.
        // Everywhere else, /thank-you is the main TY page.
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
  }, [stepId, calSlotReady]);

  // Reset Cal-init guard if user goes back from book step
  useEffect(() => {
    if (stepId !== 'book') {
      calInitialised.current = false;
      bookedRef.current = false;
    }
  }, [stepId]);

  // ── Render ───────────────────────────────────────────────────
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="qualify-modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) tryClose(); }}
        >
          <motion.div
            className="qualify-modal__container"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            role="dialog"
            aria-modal="true"
            aria-label="Qualify your free brand audit"
          >
            {/* Header: progress + close */}
            <div className="qualify-modal__header">
              <div className="qualify-modal__progress">
                <div className="qualify-modal__progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <button
                type="button"
                className="qualify-modal__close"
                onClick={tryClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step label */}
            {flowIdx >= 0 && (
              <div className="qualify-modal__step-label">
                Step {flowIdx + 1} of {FLOW.length}
              </div>
            )}

            {/* Body */}
            <div className="qualify-modal__body">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepId}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="qualify-modal__step"
                >
                  {stepId === 'identity'   && <IdentityStep   a={answers} update={update} />}
                  {stepId === 'company'    && <CompanyStep    a={answers} update={update} />}
                  {stepId === 'project'    && <ProjectStep    a={answers} update={update} />}
                  {stepId === 'investment' && <InvestmentStep a={answers} update={update} />}
                  {stepId === 'pain'       && <PainStep       a={answers} update={update} />}
                  {stepId === 'book'       && <BookStep setCalNode={setCalNode} />}
                  {stepId === 'disqualified' && <DisqualifiedStep a={answers} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer actions — hidden on the terminal screens */}
            {flowIdx >= 0 && (
              <div className="qualify-modal__footer">
                {flowIdx > 0 ? (
                  <button type="button" className="qualify-modal__back" onClick={goBack}>
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <span />}
                <button
                  type="button"
                  className="qualify-modal__primary"
                  onClick={advance}
                  disabled={!isStepComplete(stepId, answers)}
                >
                  {stepId === 'pain' ? 'Continue to booking' : 'Continue'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Disqualified screen has its own footer with email + close */}
            {stepId === 'disqualified' && (
              <div className="qualify-modal__footer">
                <button type="button" className="qualify-modal__back" onClick={goBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" className="qualify-modal__primary" onClick={onClose}>
                  Close
                </button>
              </div>
            )}

            {/* Formspree submit error surfaces (rare; non-blocking for booking flow) */}
            {state.errors && state.errors.getAllFieldErrors().length > 0 && (
              <div className="qualify-modal__error">
                Something went wrong saving your details. Your booking is still confirmed if you completed it.
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ── Step components ─────────────────────────────────────────────
interface StepProps {
  a: Answers;
  update: <K extends keyof Answers>(
    key: K,
    value: Answers[K] | ((prev: Answers[K]) => Answers[K]),
  ) => void;
}

const IdentityStep: React.FC<StepProps> = ({ a, update }) => (
  <>
    <h2 className="qualify-modal__heading">Let's start with you.</h2>
    <p className="qualify-modal__sub">Takes 90 seconds. We'll use this to prep before your call.</p>
    <div className="qualify-modal__fields">
      <Field label="Your name *" value={a.name} onChange={v => update('name', v)} autoComplete="name" placeholder="First and last name" />
      <Field label="Work email *" value={a.email} onChange={v => update('email', v)} type="email" autoComplete="email" placeholder="name@company.com" />
      <RadioGroup label="Your role *" value={a.role} onChange={v => update('role', v)} options={ROLE_OPTIONS} name="role" />
    </div>
  </>
);

const CompanyStep: React.FC<StepProps> = ({ a, update }) => (
  <>
    <h2 className="qualify-modal__heading">About your business.</h2>
    <p className="qualify-modal__sub">We'll audit your brand presence before the call.</p>
    <div className="qualify-modal__fields">
      <Field label="Company name *" value={a.company} onChange={v => update('company', v)} autoComplete="organization" placeholder="Acme Co." />
      <Field label="Website" value={a.website} onChange={v => update('website', v)} autoComplete="url" placeholder="acmeco.com (optional but useful)" />
    </div>
  </>
);

const ProjectStep: React.FC<StepProps> = ({ a, update }) => (
  <>
    <h2 className="qualify-modal__heading">Where are you, and what do you need?</h2>
    <p className="qualify-modal__sub">Pick all that apply — we tailor the audit to your situation.</p>
    <div className="qualify-modal__fields">
      <RadioGroup label="Current stage *" value={a.stage} onChange={v => update('stage', v)} options={STAGE_OPTIONS} name="stage" />
      <ChipMulti
        label="What do you need? *"
        values={a.needs}
        // Functional updater — prevents stale-closure overwrite when two
        // chips are clicked in tight sequence.
        onToggle={(opt) => update('needs', (prev) => prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt])}
        options={NEED_OPTIONS}
      />
    </div>
  </>
);

const InvestmentStep: React.FC<StepProps> = ({ a, update }) => (
  <>
    <h2 className="qualify-modal__heading">Budget &amp; timing.</h2>
    <p className="qualify-modal__sub">Honesty here saves both our time. There's no wrong answer.</p>
    <div className="qualify-modal__fields">
      <RadioGroup label="Project budget *" value={a.budget} onChange={v => update('budget', v)} options={BUDGET_OPTIONS.map(o => o.value)} name="budget" />
      <RadioGroup label="When would you start? *" value={a.timeline} onChange={v => update('timeline', v)} options={TIMELINE_OPTIONS.map(o => o.value)} name="timeline" />
    </div>
  </>
);

const PainStep: React.FC<StepProps> = ({ a, update }) => (
  <>
    <h2 className="qualify-modal__heading">What's the #1 thing you want fixed?</h2>
    <p className="qualify-modal__sub">One sentence is fine. This is what we'll focus on during the call.</p>
    <div className="qualify-modal__fields">
      <textarea
        className="qualify-modal__textarea"
        rows={5}
        placeholder="e.g. Our positioning is fuzzy — prospects don't get what we do in 5 seconds."
        value={a.pain}
        onChange={(e) => update('pain', e.target.value)}
        maxLength={500}
      />
      <div className="qualify-modal__hint">
        {a.pain.trim().length < 8
          ? 'A short sentence is enough.'
          : `${a.pain.length}/500`}
      </div>
    </div>
  </>
);

const BookStep: React.FC<{ setCalNode: (node: HTMLDivElement | null) => void }> = ({ setCalNode }) => (
  <>
    <h2 className="qualify-modal__heading">
      <CheckCircle size={22} color="#FFDC04" style={{ verticalAlign: '-4px', marginRight: 8 }} />
      Pick a 30-minute slot.
    </h2>
    <p className="qualify-modal__sub">
      Your audit doesn't start until your call is booked. Pick a time below — we'll confirm instantly.
    </p>
    <div
      ref={setCalNode}
      id="qualify-modal-cal"
      className="qualify-modal__cal"
    />
    <p className="qualify-modal__hint" style={{ marginTop: 12 }}>
      Trouble with the calendar?{' '}
      <a
        href={`https://cal.com/${CAL_LINK}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#FFDC04', textDecoration: 'underline' }}
      >
        Open it in a new tab
      </a>
    </p>
  </>
);

const DisqualifiedStep: React.FC<{ a: Answers }> = ({ a }) => {
  const reasons: string[] = [];
  if (BUDGET_OPTIONS.find(o => o.value === a.budget)?.disqualifies) reasons.push('budget');
  if (TIMELINE_OPTIONS.find(o => o.value === a.timeline)?.disqualifies) reasons.push('timeline');

  return (
    <div className="qualify-modal__disqualified">
      <AlertCircle size={36} color="#FFDC04" style={{ marginBottom: 12 }} />
      <h2 className="qualify-modal__heading">We may not be the right fit — yet.</h2>
      <p className="qualify-modal__sub" style={{ maxWidth: 540 }}>
        {reasons.includes('budget') && reasons.includes('timeline') ? (
          <>Based on your answers, the work you're after is a bigger investment than the budget you have, and you're not ready to start yet. That's totally fine — we'd rather be honest than waste your time on a call.</>
        ) : reasons.includes('budget') ? (
          <>Most of our brand engagements start at £3.5k+. The work you're after may be better served by a smaller studio or freelance route at this budget.</>
        ) : (
          <>It sounds like you're exploring. We focus on brands that are ready to move within 90 days. When you're closer to starting, come back and book a call.</>
        )}
      </p>

      <div className="qualify-modal__dq-actions">
        <a
          href="https://milktreeagency.com/insights"
          target="_blank"
          rel="noopener noreferrer"
          className="qualify-modal__dq-link"
        >
          <Mail size={16} /> Read our brand resources
        </a>
        <a
          href={`mailto:hello@milktreeagency.com?subject=Brand%20audit%20question&body=Hi%20Milktree%2C%0A%0AI%20saw%20your%20site%20and%20wanted%20to%20get%20in%20touch.%0A%0A${encodeURIComponent('— ' + a.name + ' (' + a.email + ')')}`}
          className="qualify-modal__dq-link"
        >
          <Mail size={16} /> Email us directly
        </a>
      </div>
      <p className="qualify-modal__hint" style={{ marginTop: 16 }}>
        We'll keep your details on file. When the timing is right, reply to our follow-up email and we'll pick it up there.
      </p>
    </div>
  );
};

// ── Field primitives ─────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', autoComplete, placeholder }) => (
  <label className="qualify-modal__label-wrap">
    <span className="qualify-modal__label">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className="qualify-modal__input"
    />
  </label>
);

const RadioGroup: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  name: string;
}> = ({ label, value, onChange, options, name }) => (
  <div className="qualify-modal__label-wrap">
    <span className="qualify-modal__label">{label}</span>
    <div className="qualify-modal__radio-group">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          className={`qualify-modal__radio ${value === opt ? 'is-selected' : ''}`}
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          data-name={name}
        >
          <span className="qualify-modal__radio-dot" />
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const ChipMulti: React.FC<{
  label: string;
  values: string[];
  /** Toggle a single option. Implemented as a functional update by the
   *  parent so two rapid clicks don't clobber each other. */
  onToggle: (opt: string) => void;
  options: string[];
}> = ({ label, values, onToggle, options }) => (
  <div className="qualify-modal__label-wrap">
    <span className="qualify-modal__label">{label}</span>
    <div className="qualify-modal__chip-group">
      {options.map((opt) => (
        <button
          type="button"
          key={opt}
          className={`qualify-modal__chip ${values.includes(opt) ? 'is-selected' : ''}`}
          onClick={() => onToggle(opt)}
          aria-pressed={values.includes(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

// ── Hook for callers to control the modal cleanly ──────────────
export function useQualifyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
}
