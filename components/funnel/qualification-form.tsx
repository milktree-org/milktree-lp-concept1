"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  Repeat,
  HelpCircle,
  UtensilsCrossed,
  Landmark,
  HardHat,
  ShoppingBag,
  Car,
  HeartPulse,
  Shapes,
  User,
  Users,
  Building2,
  Building,
  CalendarCheck,
  CalendarClock,
  Eye,
  ArrowRight,
} from "lucide-react";
import {
  NEED_OPTIONS,
  SECTOR_OPTIONS,
  TEAM_OPTIONS,
  TIMING_OPTIONS,
  optionLabel,
  type LeadRoute,
} from "@/lib/funnel";
import { isStartProduct, getProduct, type ProductId } from "@/lib/offer";
import { getLeadTrackingFields } from "@/lib/analytics/lead-tracking";
import { writeFunnelHandoff } from "@/lib/analytics/funnel-handoff";
import { trackCustom, trackLead } from "@/lib/analytics/meta-tracking";
import { trackGA } from "@/lib/analytics/ga";
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
 * The start form (MILKTREE-STUDIO.md §6.10). One question per screen, icon
 * option cards, progress bar, back navigation, Enter-to-advance. Routing is
 * decided server-side in /api/lead by product, never by budget; every
 * submission is a lead. `?product=` pre-answers the first question so a
 * product page's CTA lands on step two.
 */

type Answers = {
  need?: string;
  sector?: string;
  teamSize?: string;
  timing?: string;
  company: string;
  website: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const ICONS = {
  need: { sprint: Zap, build: Sparkles, subscription: Repeat, "not-sure": HelpCircle },
  sector: {
    hospitality: UtensilsCrossed,
    "property-finance": Landmark,
    trades: HardHat,
    retail: ShoppingBag,
    automotive: Car,
    health: HeartPulse,
    other: Shapes,
  },
  team: {
    "just-me": User,
    "2-9": Users,
    "10-50": Building2,
    "51-100": Building,
    "100+": Building,
  },
  timing: { "this-month": CalendarCheck, "next-month": CalendarClock, looking: Eye },
} as const;

type Field = "need" | "sector" | "teamSize" | "timing";
const STEP_FOR_FIELD: Record<Field, number> = { need: 0, sector: 1, teamSize: 2, timing: 3 };
const TOTAL_STEPS = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function QualificationForm() {
  const params = useSearchParams();
  const preselected = params.get("product");
  const startOnProduct = isStartProduct(preselected) ? preselected : undefined;

  const [step, setStep] = useState(startOnProduct ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    need: startOnProduct,
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
    trackCustom("StartFormStart", { eventSource: startOnProduct ? `/start?product=${startOnProduct}` : "/start" });
  }, [startOnProduct]);

  // A product-page CTA counts as starting the form.
  useEffect(() => {
    if (startOnProduct) markStarted();
  }, [startOnProduct, markStarted]);

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setStep(next);
    setError(null);
  }, []);

  const pick = useCallback(
    (field: Field, value: string) => {
      markStarted();
      setAnswers((a) => ({ ...a, [field]: value }));
      // brief pause so the selected state registers before the slide
      window.setTimeout(() => goTo(STEP_FOR_FIELD[field] + 1, 1), 180);
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
          sector: answers.sector,
          teamSize: answers.teamSize,
          timing: answers.timing,
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

      // The submission IS the lead (spec §9): one Meta `Lead` per person, fired
      // here and nowhere else. The booking that may follow fires `Schedule`.
      const [firstName, ...rest] = answers.name.trim().split(/\s+/).filter(Boolean);
      const userData = {
        email: answers.email.trim(),
        phone: answers.phone.trim() || undefined,
        firstName,
        lastName: rest.length ? rest.join(" ") : undefined,
      };
      trackLead({
        eventSource: `Start Form — ${data.route}`,
        userData,
        eventId: data.leadId ? `start-lead-${data.leadId}` : undefined,
      });
      trackGA("generate_lead", {
        lead_source: "Website — /start",
        lead_type: "start_form",
        product: answers.need,
        route: data.route,
      });
      trackCustom("StartFormSubmitted", {
        eventSource: `Start Form — ${data.route}`,
        userData,
      });

      setResult({ route: data.route, leadId: data.leadId ?? null });
      setSubmitting(false);
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }, [answers, submitting]);

  const quizUrl = useMemo(() => {
    // Name/company/website/email are handed over in sessionStorage, NOT the
    // query string — Clarity records URLs verbatim and Meta receives the full
    // href as event_source_url. Only non-identifying params travel in the URL.
    writeFunnelHandoff({
      name: answers.name,
      company: answers.company,
      website: answers.website,
      email: answers.email,
    });
    const p = new URLSearchParams();
    if (result?.leadId) p.set("lead", result.leadId);
    p.set("src", "form");
    return `/brand-report?${p.toString()}`;
  }, [answers, result]);

  if (result) {
    return result.route === "nurture" ? (
      <NurtureScreen quizUrl={quizUrl} />
    ) : (
      <BookingScreen answers={answers} route={result.route} />
    );
  }

  const onEnter = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  const needLabel = answers.need ? optionLabel(NEED_OPTIONS, answers.need) : null;

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
              <StepHeading as="h1" title="What do you need?" sub="Pick the closest. You can change your mind on the call." />
              <div className="grid gap-3">
                {NEED_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.need[o.value]}
                    label={o.label}
                    hint={o.hint}
                    selected={answers.need === o.value}
                    onSelect={() => pick("need", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 1 && (
            <StepPanel key="sector" stepKey="sector" direction={direction}>
              <StepHeading
                as="h1"
                title="What kind of business?"
                sub={needLabel ? `${needLabel}. Good. This helps us match the right designer.` : "This helps us match the right designer."}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {SECTOR_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.sector[o.value]}
                    label={o.label}
                    selected={answers.sector === o.value}
                    onSelect={() => pick("sector", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 2 && (
            <StepPanel key="team" stepKey="team" direction={direction}>
              <StepHeading as="h1" title="How big is the team?" />
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

          {step === 3 && (
            <StepPanel key="timing" stepKey="timing" direction={direction}>
              <StepHeading as="h1" title="When do you want to start?" sub="Honest answer. Just looking is fine." />
              <div className="grid gap-3">
                {TIMING_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.timing[o.value]}
                    label={o.label}
                    selected={answers.timing === o.value}
                    onSelect={() => pick("timing", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 4 && (
            <StepPanel key="company" stepKey="company" direction={direction}>
              <StepHeading as="h1" title="Tell us about the business." />
              <div className="grid gap-5">
                <FunnelInput
                  label="Business name"
                  placeholder="Acme Ltd"
                  value={answers.company}
                  autoFocus
                  onChange={(e) => setAnswers((a) => ({ ...a, company: e.target.value }))}
                  onKeyDown={(e) => onEnter(e, () => answers.company.trim() && goTo(5, 1))}
                />
                <FunnelInput
                  label="Website"
                  optional
                  placeholder="acme.co.uk"
                  inputMode="url"
                  value={answers.website}
                  onChange={(e) => setAnswers((a) => ({ ...a, website: e.target.value }))}
                  onKeyDown={(e) => onEnter(e, () => answers.company.trim() && goTo(5, 1))}
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
              <StepHeading as="h1" title="Last one. Where do we send things?" />
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
                Send it
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </StepPanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------ Result screens ---------------------------- */

const ROUTE_COPY: Record<Exclude<LeadRoute, "nurture">, { eyebrow: string; title: string; body: string; productId: ProductId }> = {
  sprint: {
    eyebrow: "Brand Reset Sprint",
    title: "Book your sprint call.",
    body: "Fifteen minutes to agree exactly what's being fixed. The sprint details are on their way to your inbox.",
    productId: "sprint",
  },
  build: {
    eyebrow: "Brand Build",
    title: "Book your intro call.",
    body: "Thirty minutes, no commitment. We'll walk through the six weeks and pick a start date. The details are on their way to your inbox.",
    productId: "build",
  },
  subscription: {
    eyebrow: "Subscription",
    title: "Book your intro call.",
    body: "Thirty minutes, no commitment. We'll pick the plan and get your first request in the queue. The plans are on their way to your inbox.",
    productId: "essentials",
  },
};

function BookingScreen({ answers, route }: { answers: Answers; route: Exclude<LeadRoute, "nurture"> }) {
  const copy = ROUTE_COPY[route];
  const product = getProduct(copy.productId, "GBP");
  const prefill = useMemo(() => {
    const summary = [
      answers.company.trim() && `Company: ${answers.company.trim()}`,
      answers.website.trim() && `Website: ${answers.website.trim()}`,
      answers.need && `Wants: ${optionLabel(NEED_OPTIONS, answers.need)}`,
      answers.sector && `Sector: ${optionLabel(SECTOR_OPTIONS, answers.sector)}`,
      answers.teamSize && `Team size: ${optionLabel(TEAM_OPTIONS, answers.teamSize)}`,
      answers.timing && `Timing: ${optionLabel(TIMING_OPTIONS, answers.timing)}`,
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
        {copy.eyebrow} · {product.price}
        {product.cadence === "/mo" ? "/mo" : ""}
      </p>
      <h1 className="mx-auto mt-4 max-w-[18ch] text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.025em]">
        {copy.title}
      </h1>
      <p className="text-body mx-auto mt-4 max-w-lg">{copy.body}</p>
      <div className="mt-10 overflow-hidden rounded-[2rem] border border-border bg-surface p-2 text-left sm:p-4">
        <BookingEmbed source={`Website — /start ${route}`} prefill={prefill} />
      </div>
    </div>
  );
}

function NurtureScreen({ quizUrl }: { quizUrl: string }) {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
        No rush
      </p>
      <h1 className="mx-auto mt-4 max-w-[20ch] text-balance text-[clamp(1.8rem,4.5vw,3rem)] font-bold leading-[1.05] tracking-[-0.025em]">
        Start with a straight read on your brand.
      </h1>
      <p className="text-body mx-auto mt-5 max-w-lg">
        Three minutes, real search data, and an honest score for how your brand
        stacks up against the top players in your market, with fixes you can
        action this week. We&apos;ve sent a short note to your inbox too, and a
        real person will follow up in a few days.
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
        Or, if one thing is bothering you, the{" "}
        <a href="/sprint" className="font-bold text-foreground underline underline-offset-4 hover:text-brand">
          two-week sprint
        </a>{" "}
        is the easy first step.
      </p>
    </div>
  );
}
