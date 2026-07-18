"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import {
  ROLE_OPTIONS,
  LOCATION_OPTIONS,
  HIRING_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
  SALARY_STEP,
  PLAN_COSTS,
  calculateHireCost,
  defaultSalary,
  formatGBP,
  type RoleValue,
  type LocationValue,
  type HiringValue,
} from "@/lib/calculator";
import { getLeadTrackingFields } from "@/lib/analytics/lead-tracking";
import { trackCustom } from "@/lib/analytics/meta-tracking";
import {
  FunnelInput,
  PrimaryButton,
  ConsentCheckbox,
} from "@/components/funnel/ui";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Springs the receipt total so it rolls when inputs change. */
function AnimatedAmount({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 120, damping: 24 });
  const display = useTransform(spring, (v) => formatGBP(v));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  if (reduce) return <span className={className}>{formatGBP(value)}</span>;
  return <motion.span className={className}>{display}</motion.span>;
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-foreground">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-2 gap-2"
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            data-cursor="hover"
            className={cn(
              "min-h-11 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
              value === o.value
                ? "border-brand bg-brand/[0.08] text-foreground"
                : "border-[#1A1A1A] bg-[#0A0A0A] text-muted-foreground hover:border-white/25 hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HireCalculator() {
  const [role, setRole] = useState<RoleValue>("lead");
  const [location, setLocation] = useState<LocationValue>("uk");
  const [hiring, setHiring] = useState<HiringValue>("agency");
  const [salary, setSalary] = useState(() => defaultSalary("lead", "uk"));
  const salaryTouched = useRef(false);

  // Role/location presets drive the slider until the user drags it themselves.
  const applyPreset = (nextRole: RoleValue, nextLocation: LocationValue) => {
    if (!salaryTouched.current) {
      setSalary(defaultSalary(nextRole, nextLocation));
    }
  };

  const breakdown = useMemo(
    () => calculateHireCost({ salary, hiring }),
    [salary, hiring],
  );

  const designLead = PLAN_COSTS.designLead;
  const saving = breakdown.total - designLead.annual;

  /* ------------------------------ email gate ------------------------------ */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    trackCustom("HireCalculatorStart");
  };

  const submit = async () => {
    if (submitting) return;
    setError(null);
    if (!EMAIL_RE.test(email.trim()))
      return setError("That email doesn't look right. Mind checking it?");

    setSubmitting(true);
    try {
      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          role,
          location,
          hiring,
          salary,
          consent,
          attribution: getLeadTrackingFields(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      trackCustom("HireCalculatorLead", {
        customData: { event_source: "Hire Calculator" },
        userData: { email: email.trim() },
      });
      setSent(true);
      setSubmitting(false);
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      {/* ------------------------------ Controls ----------------------------- */}
      <div className="flex flex-col gap-8">
        <div>
          <p className="mb-2 text-sm font-bold text-foreground">
            Who are you hiring?
          </p>
          <div className="grid gap-2">
            {ROLE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={role === o.value}
                data-cursor="hover"
                onClick={() => {
                  markStarted();
                  setRole(o.value);
                  applyPreset(o.value, location);
                }}
                className={cn(
                  "flex min-h-[56px] w-full items-center justify-between rounded-2xl border bg-[#0A0A0A] px-5 py-3.5 text-left transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
                  role === o.value
                    ? "border-brand bg-brand/[0.08]"
                    : "border-[#1A1A1A] hover:border-white/25 hover:bg-white/[0.03]",
                )}
              >
                <span className="text-[1rem] font-bold tracking-tight text-foreground">
                  {o.label}
                </span>
                <span className="text-sm font-medium text-faint">
                  ~{formatGBP(o.salary)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <SegmentedControl
          label="Where are they based?"
          options={LOCATION_OPTIONS}
          value={location}
          onChange={(v) => {
            markStarted();
            setLocation(v);
            applyPreset(role, v);
          }}
        />

        <SegmentedControl
          label="How would you recruit?"
          options={HIRING_OPTIONS}
          value={hiring}
          onChange={(v) => {
            markStarted();
            setHiring(v);
          }}
        />

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-sm font-bold text-foreground">Base salary</p>
            <p className="text-sm font-bold tabular-nums text-brand">
              {formatGBP(salary)}
            </p>
          </div>
          <input
            type="range"
            min={SALARY_MIN}
            max={SALARY_MAX}
            step={SALARY_STEP}
            value={salary}
            aria-label="Base salary"
            onChange={(e) => {
              markStarted();
              salaryTouched.current = true;
              setSalary(Number(e.target.value));
            }}
            className="h-11 w-full cursor-pointer accent-[#FFDC04]"
          />
          <div className="flex justify-between text-xs font-medium text-faint">
            <span>{formatGBP(SALARY_MIN)}</span>
            <span>{formatGBP(SALARY_MAX)}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------ Receipt ------------------------------ */}
      <div className="flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="rounded-[2rem] border border-border bg-surface p-6 sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-faint">
            True first-year cost
          </p>

          <div className="mt-5 flex flex-col divide-y divide-white/[0.06]">
            {breakdown.lines.map((line) => (
              <div
                key={line.label}
                className="flex items-baseline justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-bold text-foreground">
                    {line.label}
                  </p>
                  <p className="text-[0.8rem] text-faint">{line.detail}</p>
                </div>
                <AnimatedAmount
                  value={line.amount}
                  className="shrink-0 text-[0.95rem] font-bold tabular-nums text-foreground"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 border-t border-white/15 pt-5">
            <div>
              <p className="text-sm font-bold text-foreground">
                Real cost, year one
              </p>
              <p className="text-[0.8rem] text-faint">
                <AnimatedAmount value={breakdown.monthly} className="tabular-nums" />
                /month, before they've shipped anything
              </p>
            </div>
            <AnimatedAmount
              value={breakdown.total}
              className="text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-none tracking-[-0.03em] tabular-nums text-brand"
            />
          </div>
        </motion.div>

        {/* ---------------------------- Comparison --------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.08 }}
          className="rounded-[2rem] border border-border bg-card p-6 sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-faint">
            The same money at Milktree
          </p>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[1.05rem] font-bold text-foreground">
                {designLead.name} plan
              </p>
              <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
                A dedicated senior designer on your Slack, backed by a full
                team across brand, ads, decks, packaging and web. Starts this
                week. Cancel any month.
              </p>
            </div>
            <p className="shrink-0 text-[1.4rem] font-black tabular-nums tracking-[-0.02em] text-foreground">
              {formatGBP(designLead.annual)}
              <span className="text-sm font-medium text-faint">/yr</span>
            </p>
          </div>
          {saving > 0 && (
            <p className="mt-4 border-t border-white/[0.08] pt-4 text-[0.95rem] font-bold text-foreground">
              That hire costs{" "}
              <AnimatedAmount
                value={saving}
                className="tabular-nums text-brand"
              />{" "}
              more in year one — for one skill set instead of a whole team.
            </p>
          )}
        </motion.div>

        {/* ---------------------------- Email gate ---------------------------- */}
        {sent ? (
          <div className="rounded-[2rem] border border-brand/40 bg-brand/[0.06] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-brand-ink">
                <Check className="size-5" />
              </span>
              <p className="text-[1.05rem] font-bold text-foreground">
                Your breakdown is on its way.
              </p>
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              Check your inbox for the full numbers, plus exactly what the
              subscription covers. Want to skip the reading?
            </p>
            <a
              href="/start"
              data-cursor="hover"
              className="mt-5 inline-flex h-13 items-center justify-center gap-2 rounded-[44px] bg-brand px-8 text-[0.98rem] font-bold text-brand-ink transition-all hover:brightness-105 hover:shadow-[0_10px_40px_-8px_rgba(255,220,4,0.55)]"
            >
              See if Milktree fits
              <ArrowRight className="size-4" />
            </a>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
            <p className="text-[1.05rem] font-bold text-foreground">
              Email me this breakdown
            </p>
            <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted-foreground">
              Your personalised numbers as a keepable one-pager, plus the
              side-by-side with both Milktree plans. Send it to your CFO.
            </p>
            <div className="mt-5 grid gap-4">
              <FunnelInput
                label="Your name"
                optional
                placeholder="Alex Taylor"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FunnelInput
                label="Work email"
                placeholder="alex@acme.co.uk"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
              <ConsentCheckbox
                checked={consent}
                onChange={setConsent}
                label="Send me occasional brand tips from Milktree. No spam, unsubscribe anytime."
              />
            </div>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            <PrimaryButton
              className="mt-6 w-full sm:w-auto"
              loading={submitting}
              disabled={submitting}
              onClick={submit}
            >
              Send my breakdown
              <ArrowRight className="size-4" />
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
