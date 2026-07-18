"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  PenTool,
  Palette,
  Monitor,
  Clapperboard,
  Sprout,
  Zap,
  Award,
  Crown,
  BriefcaseBusiness,
  Clock,
  Laptop,
  Sparkles,
  Wand2,
  Lightbulb,
  Camera,
  AtSign,
  Users,
  Search,
  MoreHorizontal,
  ArrowRight,
  Send,
  CheckCircle2,
} from "lucide-react";
import {
  CAREERS_FORM_ENDPOINT,
  ROLE_OPTIONS,
  EXPERIENCE_OPTIONS,
  AVAILABILITY_OPTIONS,
  AI_USAGE_OPTIONS,
  HEARD_FROM_OPTIONS,
} from "@/lib/careers";
import { trackCustom } from "@/lib/analytics/meta-tracking";
import {
  ProgressBar,
  StepPanel,
  StepHeading,
  OptionCard,
  FunnelInput,
  FunnelTextarea,
  BackButton,
  PrimaryButton,
  ConsentCheckbox,
} from "@/components/funnel/ui";

/**
 * Careers application — same conversational multistep language as /start:
 * one question per screen, icon option cards, progress bar, back navigation.
 * Field names mirror the original Formspree careers form (xrejwdnk) so
 * applications keep landing in the same inbox with the same columns.
 */

type Answers = {
  role?: string;
  experienceYears?: string;
  availability?: string;
  aiUsage?: string;
  heardFrom?: string;
  portfolio: string;
  linkedin: string;
  experience: string;
  whyMilktree: string;
  location: string;
  timezone: string;
  rate: string;
  name: string;
  email: string;
  phone: string;
  references: boolean;
};

const ICONS = {
  role: {
    "graphic-designer": PenTool,
    "brand-designer": Palette,
    "web-designer": Monitor,
    "motion-designer": Clapperboard,
  },
  experience: { "0-2": Sprout, "3-5": Zap, "6-9": Award, "10+": Crown },
  availability: {
    "Full-time": BriefcaseBusiness,
    "Part-time": Clock,
    Freelance: Laptop,
  },
  ai: { "Daily user": Sparkles, Occasionally: Wand2, "Not yet": Lightbulb },
  heard: {
    Instagram: Camera,
    LinkedIn: AtSign,
    Referral: Users,
    Search: Search,
    Other: MoreHorizontal,
  },
} as const;

type PickField = "role" | "experienceYears" | "availability" | "aiUsage" | "heardFrom";
const PICK_STEP: Record<PickField, number> = {
  role: 0,
  experienceYears: 1,
  availability: 2,
  aiUsage: 3,
  heardFrom: 4,
};

const TOTAL_STEPS = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_HINT_RE = /\.[a-z]{2,}/i;

export function CareersForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    portfolio: "",
    linkedin: "",
    experience: "",
    whyMilktree: "",
    location: "",
    timezone: "",
    rate: "",
    name: "",
    email: "",
    phone: "",
    references: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  const markStarted = useCallback(() => {
    if (started.current) return;
    started.current = true;
    trackCustom("CareersFormStart");
  }, []);

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setStep(next);
    setError(null);
  }, []);

  const pick = useCallback(
    (field: PickField, value: string) => {
      markStarted();
      setAnswers((a) => ({ ...a, [field]: value }));
      // brief pause so the selected state registers before the slide
      window.setTimeout(() => goTo(PICK_STEP[field] + 1, 1), 180);
    },
    [goTo, markStarted],
  );

  const set = <K extends keyof Answers>(field: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [field]: value }));

  const submit = useCallback(async () => {
    if (submitting) return;
    setError(null);

    if (!answers.name.trim()) return setError("Add your name so we know who's applying.");
    if (!EMAIL_RE.test(answers.email.trim()))
      return setError("That email doesn't look right. Mind checking it?");

    setSubmitting(true);
    try {
      const res = await fetch(CAREERS_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          service: "Careers Application",
          _subject: `Careers application — ${answers.name.trim()} (${answers.role})`,
          role: answers.role,
          experience_years: answers.experienceYears,
          availability: answers.availability,
          ai_usage: answers.aiUsage,
          heard_from: answers.heardFrom,
          portfolio: answers.portfolio.trim(),
          linkedin: answers.linkedin.trim(),
          experience: answers.experience.trim(),
          why_milktree: answers.whyMilktree.trim(),
          location: answers.location.trim(),
          timezone: answers.timezone.trim(),
          rate: answers.rate.trim(),
          name: answers.name.trim(),
          email: answers.email.trim(),
          phone: answers.phone.trim(),
          references: answers.references ? "Yes" : "No",
        }),
      });
      if (!res.ok) {
        setError("Something went wrong sending your application. Please try again.");
        setSubmitting(false);
        return;
      }
      trackCustom("CareersFormSubmit");
      setDone(true);
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }, [answers, submitting]);

  if (done) return <SubmittedScreen name={answers.name} />;

  const onEnter = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
      e.preventDefault();
      action();
    }
  };

  const portfolioValid = URL_HINT_RE.test(answers.portfolio.trim());
  const storyValid = answers.experience.trim().length > 0 && answers.whyMilktree.trim().length > 0;

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
            <StepPanel key="role" stepKey="role" direction={direction}>
              <StepHeading title="What kind of designer are you?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLE_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.role[o.value]}
                    label={o.label}
                    selected={answers.role === o.value}
                    onSelect={() => pick("role", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 1 && (
            <StepPanel key="experience" stepKey="experience" direction={direction}>
              <StepHeading title="How many years have you been designing?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {EXPERIENCE_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.experience[o.value]}
                    label={o.label}
                    selected={answers.experienceYears === o.value}
                    onSelect={() => pick("experienceYears", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 2 && (
            <StepPanel key="availability" stepKey="availability" direction={direction}>
              <StepHeading title="What availability are you looking for?" />
              <div className="grid gap-3">
                {AVAILABILITY_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.availability[o.value]}
                    label={o.label}
                    selected={answers.availability === o.value}
                    onSelect={() => pick("availability", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 3 && (
            <StepPanel key="ai" stepKey="ai" direction={direction}>
              <StepHeading
                title="How do you use AI in your design work?"
                sub="No wrong answer. We're an AI-native studio and want to know where you're at."
              />
              <div className="grid gap-3">
                {AI_USAGE_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.ai[o.value]}
                    label={o.label}
                    selected={answers.aiUsage === o.value}
                    onSelect={() => pick("aiUsage", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 4 && (
            <StepPanel key="heard" stepKey="heard" direction={direction}>
              <StepHeading title="Where did you hear about Milktree?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {HEARD_FROM_OPTIONS.map((o) => (
                  <OptionCard
                    key={o.value}
                    icon={ICONS.heard[o.value]}
                    label={o.label}
                    selected={answers.heardFrom === o.value}
                    onSelect={() => pick("heardFrom", o.value)}
                  />
                ))}
              </div>
            </StepPanel>
          )}

          {step === 5 && (
            <StepPanel key="work" stepKey="work" direction={direction}>
              <StepHeading
                title="Show us the work."
                sub="Your portfolio is the application. Behance, Dribbble, a personal site, whatever shows your best."
              />
              <div className="grid gap-5">
                <FunnelInput
                  label="Portfolio link"
                  placeholder="yoursite.com or behance.net/you"
                  inputMode="url"
                  autoFocus
                  value={answers.portfolio}
                  onChange={(e) => set("portfolio", e.target.value)}
                  onKeyDown={(e) => onEnter(e, () => portfolioValid && goTo(6, 1))}
                />
                <FunnelInput
                  label="LinkedIn"
                  optional
                  placeholder="linkedin.com/in/you"
                  inputMode="url"
                  value={answers.linkedin}
                  onChange={(e) => set("linkedin", e.target.value)}
                  onKeyDown={(e) => onEnter(e, () => portfolioValid && goTo(6, 1))}
                />
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <PrimaryButton
                className="mt-8 w-full sm:w-auto"
                disabled={!portfolioValid}
                onClick={() => goTo(6, 1)}
              >
                Continue
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </StepPanel>
          )}

          {step === 6 && (
            <StepPanel key="story" stepKey="story" direction={direction}>
              <StepHeading title="Two quick questions." />
              <div className="grid gap-5">
                <FunnelTextarea
                  label="Where do you do your best work?"
                  placeholder="The kinds of projects you thrive on, and one or two you're proudest of."
                  autoFocus
                  value={answers.experience}
                  onChange={(e) => set("experience", e.target.value)}
                />
                <FunnelTextarea
                  label="Why Milktree?"
                  placeholder="What made you apply here, specifically?"
                  rows={3}
                  value={answers.whyMilktree}
                  onChange={(e) => set("whyMilktree", e.target.value)}
                />
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <PrimaryButton
                className="mt-8 w-full sm:w-auto"
                disabled={!storyValid}
                onClick={() => goTo(7, 1)}
              >
                Continue
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </StepPanel>
          )}

          {step === 7 && (
            <StepPanel key="you" stepKey="you" direction={direction}>
              <StepHeading
                title="Last step. The practical bits."
                sub="We hire worldwide. Location and rate just help us make a fair offer."
              />
              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FunnelInput
                    label="Your name"
                    placeholder="Alex Taylor"
                    autoComplete="name"
                    autoFocus
                    value={answers.name}
                    onChange={(e) => set("name", e.target.value)}
                    onKeyDown={(e) => onEnter(e, submit)}
                  />
                  <FunnelInput
                    label="Email"
                    placeholder="alex@email.com"
                    type="email"
                    autoComplete="email"
                    value={answers.email}
                    onChange={(e) => set("email", e.target.value)}
                    onKeyDown={(e) => onEnter(e, submit)}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FunnelInput
                    label="Where are you based?"
                    placeholder="Lisbon, Portugal"
                    value={answers.location}
                    onChange={(e) => set("location", e.target.value)}
                    onKeyDown={(e) => onEnter(e, submit)}
                  />
                  <FunnelInput
                    label="Timezone"
                    optional
                    placeholder="GMT+1"
                    value={answers.timezone}
                    onChange={(e) => set("timezone", e.target.value)}
                    onKeyDown={(e) => onEnter(e, submit)}
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FunnelInput
                    label="Expected rate"
                    optional
                    placeholder="£X/month or £X/day"
                    value={answers.rate}
                    onChange={(e) => set("rate", e.target.value)}
                    onKeyDown={(e) => onEnter(e, submit)}
                  />
                  <FunnelInput
                    label="Phone"
                    optional
                    placeholder="+44 7000 000000"
                    type="tel"
                    autoComplete="tel"
                    value={answers.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    onKeyDown={(e) => onEnter(e, submit)}
                  />
                </div>
                <ConsentCheckbox
                  checked={answers.references}
                  onChange={(v) => set("references", v)}
                  label="I can provide references from previous clients or employers."
                />
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <PrimaryButton
                className="mt-8 w-full sm:w-auto"
                loading={submitting}
                disabled={submitting || !answers.name.trim() || !answers.email.trim() || !answers.location.trim()}
                onClick={submit}
              >
                Send my application
                <Send className="size-4" />
              </PrimaryButton>
            </StepPanel>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SubmittedScreen({ name }: { name: string }) {
  const firstName = name.trim().split(" ")[0] || "there";
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand/10">
        <CheckCircle2 className="size-7 text-brand" />
      </span>
      <h2 className="mx-auto mt-6 max-w-[18ch] text-balance text-[clamp(1.8rem,4.5vw,3rem)] font-bold leading-[1.05] tracking-[-0.025em]">
        Application sent. Nice one, {firstName}.
      </h2>
      <p className="text-body mx-auto mt-5 max-w-md">
        We read every application personally and reply to the ones that feel
        like a fit, usually within a week. Your portfolio does the talking
        from here.
      </p>
    </div>
  );
}
