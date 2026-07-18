"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Repeat,
  Sparkles,
  HelpCircle,
  User,
  Users,
  Building2,
  Landmark,
  Megaphone,
  UserCheck,
  Rocket,
  Coins,
  Banknote,
  Wallet,
  Gem,
  ArrowRight,
} from "lucide-react";
import {
  NEED_OPTIONS,
  TEAM_OPTIONS,
  MARKETING_OPTIONS,
  BUDGET_OPTIONS,
  optionLabel,
  type LeadRoute,
} from "@/lib/funnel";
import { getLeadTrackingFields } from "@/lib/analytics/lead-tracking";
import { trackCustom, trackLead } from "@/lib/analytics/meta-tracking";
import { BookingEmbed } from "@/components/booking/booking-embed";
import {
  ProgressBar,
  StepPanel,
  StepHeading,
  OptionCard,
  FunnelInput,
  BackButton,
  PrimaryButton,
  ConsentCheckbox,
} from "@/components/funnel/ui";

/**
 * The multistep qualification form (§4). One question per screen, icon option
 * cards, progress bar, back navigation, Enter-to-advance — a conversation,
 * not a form. Qualification is recomputed server-side in /api/lead; the route
 * returned by the API is the only routing decision this component trusts.
 */

type Answers = {
  need?: string;
  teamSize?: string;
  marketing?: string;
  budget?: string;
  company: string;
  website: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const ICONS = {
  need: { ongoing: Repeat, "brand-build": Sparkles, "not-sure": HelpCircle },
  team: {
    "just-me": User,
    "2-9": Users,
    "10-50": Building2,
    "51-100": Landmark,
    "100+": Landmark,
  },
  marketing: { team: Megaphone, one: UserCheck, founder: Rocket },
  budget: { "under-1k": Coins, "1k-2k": Banknote, "2k-4k": Wallet, "4k+": Gem },
} as const;

const TOTAL_STEPS = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function QualificationForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    company: "",
    website: "",
    name: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ route: LeadRoute; leadId: string | null } | null>(null);
  const started = useRef(false);

  const markStarted = useCallback(() => {
    if (started.current) return;
    started.current = true;
    trackCustom("QualificationFormStart");
  }, []);

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setStep(next);
    setError(null);
  }, []);

  const pick = useCallback(
    (field: "need" | "teamSize" | "marketing" | "budget", value: string) => {
      markStarted();
      setAnswers((a) => ({ ...a, [field]: value }));
      // brief pause so the selected state registers before the slide
      window.setTimeout(() => goTo(stepForField(field) + 1, 1), 180);
    },
    [goTo, markStarted],
  );

  const submit = useCallback(async () => {
    if (submitting) return;
    setError(null);

    if (!answers.name.trim()) return setError("Add your name so we know who to reply to.");
    if (!EMAIL_RE.test(answers.email.trim()))
      return setError("That email doesn't look right. Mind checking it?");

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          need: answers.need,
          teamSize: answers.teamSize,
          marketing: answers.marketing,
          budget: answers.budget,
          company: answers.company.trim(),
          website: answers.website.trim(),
          name: answers.name.trim(),
          email: answers.email.trim(),
          phone: answers.phone.trim() || undefined,
          consent: answers.consent,
          attribution: getLeadTrackingFields(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        route?: LeadRoute;
        leadId?: string | null;
        error?: string;
      };
      if (!res.ok || !data.route) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      if (data.route === "qualified") {
        trackLead({
          eventSource: "Start Form — Qualified",
          userData: { email: answers.email.trim(), phone: answers.phone.trim() || undefined },
        });
      } else {
        trackCustom("QualificationFormUnqualified");
      }
      setResult({ route: data.route, leadId: data.leadId ?? null });
      setSubmitting(false);
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }, [answers, submitting]);

  const quizUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (answers.company.trim()) params.set("company", answers.company.trim());
    if (answers.website.trim()) params.set("website", answers.website.trim());
    if (answers.email.trim()) params.set("email", answers.email.trim());
    if (result?.leadId) params.set("lead", result.leadId);
    params.set("src", "form");
    return `/brand-report?${params.toString()}`;
  }, [answers, result]);

  if (result) {
    return result.route === "qualified" ? (
      <QualifiedScreen answers={answers} />
    ) : (
      <UnqualifiedScreen quizUrl={quizUrl} />
    );
  }

  const onEnter = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-3 flex items-center justify-between">
        <BackButton onClick={() => goTo(step - 1, -1)} disabled={step === 0} />
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-faint">
          {step + 1} / {TOTAL_STEPS}
        </span>
      </div>
      <ProgressBar value={(step + 1) / TOTAL_STEPS} />

      <div className="mt-10 min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <StepPanel key="need" stepKey="need" direction={direction}>
              <StepHeading title="What do you need?" />
              <div className="grid gap-3">
                {NEED_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.need[o.value]}
                    label={o.label}
                    selected={answers.need === o.value}
                    onSelect={() => pick("need", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 1 && (
            <StepPanel key="team" stepKey="team" direction={direction}>
              <StepHeading title="How big is your team?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {TEAM_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.team[o.value]}
                    label={o.label}
                    selected={answers.teamSize === o.value}
                    onSelect={() => pick("teamSize", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 2 && (
            <StepPanel key="marketing" stepKey="marketing" direction={direction}>
              <StepHeading title="Do you have a marketing function?" />
              <div className="grid gap-3">
                {MARKETING_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.marketing[o.value]}
                    label={o.label}
                    selected={answers.marketing === o.value}
                    onSelect={() => pick("marketing", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 3 && (
            <StepPanel key="budget" stepKey="budget" direction={direction}>
              <StepHeading
                title="What's your monthly design budget?"
                sub="A rough band is fine. This just helps us point you at the right thing."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {BUDGET_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.budget[o.value]}
                    label={o.label}
                    selected={answers.budget === o.value}
                    onSelect={() => pick("budget", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 4 && (
            <StepPanel key="company" stepKey="company" direction={direction}>
              <StepHeading title="Tell us about the company." />
              <div className="grid gap-5">
                <FunnelInput
                  label="Company name"
                  placeholder="Acme Ltd"
                  value={answers.company}
                  autoFocus
                  onChange={(e) => setAnswers((a) => ({ ...a, company: e.target.value }))}
                  onKeyDown={(e) =>
                    onEnter(e, () => answers.company.trim() && goTo(5, 1))
                  }
                />
                <FunnelInput
                  label="Website"
                  optional
                  placeholder="acme.co.uk"
                  inputMode="url"
                  value={answers.website}
                  onChange={(e) => setAnswers((a) => ({ ...a, website: e.target.value }))}
                  onKeyDown={(e) =>
                    onEnter(e, () => answers.company.trim() && goTo(5, 1))
                  }
                />
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <PrimaryButton
                className="mt-8 w-full sm:w-auto"
                disabled={!answers.company.trim()}
                onClick={() => goTo(5, 1)}
              >
                Continue
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </StepPanel>
          )}

          {step === 5 && (
            <StepPanel key="you" stepKey="you" direction={direction}>
              <StepHeading title="Last one. Where do we send things?" />
              <div className="grid gap-5">
                <FunnelInput
                  label="Your name"
                  placeholder="Alex Taylor"
                  autoComplete="name"
                  value={answers.name}
                  autoFocus
                  onChange={(e) => setAnswers((a) => ({ ...a, name: e.target.value }))}
                  onKeyDown={(e) => onEnter(e, submit)}
                />
                <FunnelInput
                  label="Work email"
                  placeholder="alex@acme.co.uk"
                  type="email"
                  autoComplete="email"
                  value={answers.email}
                  onChange={(e) => setAnswers((a) => ({ ...a, email: e.target.value }))}
                  onKeyDown={(e) => onEnter(e, submit)}
                />
                <FunnelInput
                  label="Phone"
                  optional
                  placeholder="07000 000000"
                  type="tel"
                  autoComplete="tel"
                  value={answers.phone}
                  onChange={(e) => setAnswers((a) => ({ ...a, phone: e.target.value }))}
                  onKeyDown={(e) => onEnter(e, submit)}
                />
                <ConsentCheckbox
                  checked={answers.consent}
                  onChange={(v) => setAnswers((a) => ({ ...a, consent: v }))}
                  label="Send me occasional brand tips from Milktree. No spam, unsubscribe anytime."
                />
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <PrimaryButton
                className="mt-8 w-full sm:w-auto"
                loading={submitting}
                disabled={submitting}
                onClick={submit}
              >
                See what fits
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </StepPanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function stepForField(field: "need" | "teamSize" | "marketing" | "budget") {
  return { need: 0, teamSize: 1, marketing: 2, budget: 3 }[field];
}

/* ------------------------------ Result screens ---------------------------- */

function QualifiedScreen({ answers }: { answers: Answers }) {
  const prefill = useMemo(() => {
    const summary = [
      answers.company.trim() && `Company: ${answers.company.trim()}`,
      answers.website.trim() && `Website: ${answers.website.trim()}`,
      answers.need && `Looking for: ${optionLabel(NEED_OPTIONS, answers.need)}`,
      answers.teamSize && `Team size: ${optionLabel(TEAM_OPTIONS, answers.teamSize)}`,
      answers.marketing &&
        `Marketing: ${optionLabel(MARKETING_OPTIONS, answers.marketing)}`,
      answers.budget && `Budget: ${optionLabel(BUDGET_OPTIONS, answers.budget)}`,
    ].filter(Boolean) as string[];

    return {
      name: answers.name.trim() || undefined,
      email: answers.email.trim() || undefined,
      phone: answers.phone.trim() || undefined,
      company: answers.company.trim() || undefined,
      website: answers.website.trim() || undefined,
      notes: summary.length ? summary.join("\n") : undefined,
    };
  }, [answers]);

  return (
    <div className="mx-auto w-full max-w-4xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
        You&apos;re a fit
      </p>
      <h2 className="mx-auto mt-4 max-w-[18ch] text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.025em]">
        Book your intro call.
      </h2>
      <p className="text-body mx-auto mt-4 max-w-lg">
        30 minutes, no commitment. We&apos;ve also sent the plans and how it
        all works to your inbox.
      </p>
      <div className="mt-10 overflow-hidden rounded-[2rem] border border-border bg-surface p-2 text-left sm:p-4">
        <BookingEmbed source="Website — /start Qualified" prefill={prefill} />
      </div>
    </div>
  );
}

function UnqualifiedScreen({ quizUrl }: { quizUrl: string }) {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
        An honest read
      </p>
      <h2 className="mx-auto mt-4 max-w-[20ch] text-balance text-[clamp(1.8rem,4.5vw,3rem)] font-bold leading-[1.05] tracking-[-0.025em]">
        Now might not be the right time.
      </h2>
      <p className="text-body mx-auto mt-5 max-w-lg">
        Milktree starts at £1,999/mo, and it sounds like that&apos;s beyond
        the budget right now. No hard feelings — timing matters. In the
        meantime, get your{" "}
        <strong className="text-foreground">free Brand Score</strong>: see how
        your brand stacks up against the top three players in your market,
        with fixes you can action this week.
      </p>
      <a
        href={quizUrl}
        data-cursor="hover"
        className="mt-9 inline-flex h-13 items-center justify-center gap-2 rounded-[44px] bg-brand px-8 text-[0.98rem] font-bold text-brand-ink transition-all hover:brightness-105 hover:shadow-[0_10px_40px_-8px_rgba(255,220,4,0.55)]"
      >
        Get my free brand score
        <ArrowRight className="size-4" />
      </a>
      <p className="mt-5 text-sm text-faint">
        Takes about two minutes. Real search data, not fluff.
      </p>
    </div>
  );
}
