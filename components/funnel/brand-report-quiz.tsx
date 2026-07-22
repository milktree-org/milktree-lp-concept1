"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Layers,
  CalendarClock,
  PenTool,
  Share2,
  Globe,
  Search,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  QUIZ_QUESTIONS,
  SECTORS,
  CATEGORY_LABELS,
  type QuizAnswers,
  type QuizCategory,
  type QuizResults,
  type BenchmarkResult,
} from "@/lib/quiz";
import { trackCustom } from "@/lib/analytics/meta-tracking";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
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
 * Brand Ranking Quiz (§5). Intake (email = the capture gate) → six icon
 * questions → results: animated Brand Score gauge, live "you vs the top 3"
 * benchmark, and the top 3 fixes (7 more in the emailed report).
 *
 * Benchmarks kick off server-side at quiz start; if they're still running
 * when results render, the screen upgrades in place — and degrades to
 * self-assessment-only if the lookups fail. Estimates are always labelled.
 */

const QUESTION_ICONS: Record<QuizCategory, React.ComponentType<{ className?: string }>> = {
  consistency: Layers,
  freshness: CalendarClock,
  resource: PenTool,
  social: Share2,
  website: Globe,
  search: Search,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_STEPS = QUIZ_QUESTIONS.length + 1;

type Intake = {
  company: string;
  website: string;
  sector: string;
  region: string;
  email: string;
  consent: boolean;
};

export function BrandReportQuiz() {
  const params = useSearchParams();
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [intake, setIntake] = useState<Intake>({
    company: params.get("company") ?? "",
    website: params.get("website") ?? "",
    sector: "",
    region: "",
    email: params.get("email") ?? "",
    consent: false,
  });
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setStep(next);
    setError(null);
  }, []);

  /* Step 0 — intake: creates the session and kicks off async benchmarks. */
  const start = useCallback(async () => {
    if (busy) return;
    setError(null);
    if (!intake.company.trim()) return setError("Add your company name.");
    if (!intake.sector) return setError("Pick the sector closest to what you do.");
    if (!EMAIL_RE.test(intake.email.trim()))
      return setError("A valid email is needed. It's where your report goes.");

    setBusy(true);
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: intake.company.trim(),
          website: intake.website.trim(),
          sector: intake.sector,
          region: intake.region.trim(),
          email: intake.email.trim(),
          consent: intake.consent,
          leadId: params.get("lead") ?? undefined,
          source: params.get("src") === "form" ? "start-form" : "direct",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        sessionId?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      setSessionId(data.sessionId ?? null);
      trackCustom("BrandQuizStart");
      setBusy(false);
      goTo(1, 1);
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setBusy(false);
    }
  }, [busy, goTo, intake, params]);

  const complete = useCallback(
    async (finalAnswers: QuizAnswers) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/quiz/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, answers: finalAnswers }),
        });
        const data = (await res.json().catch(() => ({}))) as
          | QuizResults
          | { error?: string };
        if (!res.ok || !("score" in data)) {
          setError(
            ("error" in data && data.error) ||
              "Something went wrong computing your score. Please try again.",
          );
          setBusy(false);
          return;
        }
        trackCustom("BrandQuizComplete", {
          customData: { score: data.score },
        });
        setResults(data);
        setBusy(false);
      } catch {
        setError("We couldn't reach the server. Please try again.");
        setBusy(false);
      }
    },
    [sessionId],
  );

  /* Question steps — auto-advance; final answer submits. */
  const answer = useCallback(
    (category: QuizCategory, value: string, index: number) => {
      const next = { ...answers, [category]: value };
      setAnswers(next);
      window.setTimeout(() => {
        if (index + 1 < QUIZ_QUESTIONS.length) {
          goTo(index + 2, 1);
        } else {
          void complete(next);
        }
      }, 180);
    },
    [answers, complete, goTo],
  );

  if (results) {
    return (
      <ResultsScreen
        results={results}
        company={intake.company.trim() || "Your brand"}
        email={intake.email.trim()}
      />
    );
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void start();
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-3 flex items-center justify-between">
        <BackButton onClick={() => goTo(step - 1, -1)} disabled={step === 0 || busy} />
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-faint">
          {step + 1} / {TOTAL_STEPS}
        </span>
      </div>
      <ProgressBar value={(step + 1) / TOTAL_STEPS} />

      <div className="mt-10 min-h-[440px]">
        <AnimatePresence mode="wait" custom={reduce ? 0 : direction}>
          {step === 0 && (
            <StepPanel key="intake" stepKey="intake" direction={direction}>
              <StepHeading
                title="First, the basics."
                sub="Real search data needs real details. Your report lands in your inbox."
              />
              <div className="grid gap-4">
                <FunnelInput
                  label="Company name"
                  placeholder="Acme Ltd"
                  value={intake.company}
                  onChange={(e) => setIntake((s) => ({ ...s, company: e.target.value }))}
                  onKeyDown={onEnter}
                />
                <FunnelInput
                  label="Website"
                  optional
                  placeholder="acme.co.uk"
                  inputMode="url"
                  value={intake.website}
                  onChange={(e) => setIntake((s) => ({ ...s, website: e.target.value }))}
                  onKeyDown={onEnter}
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-foreground">Sector</span>
                  <select
                    value={intake.sector}
                    onChange={(e) => setIntake((s) => ({ ...s, sector: e.target.value }))}
                    className="h-13 w-full appearance-none rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-4 text-base text-foreground transition-colors focus:border-brand/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <option value="" disabled>
                      Pick the closest fit
                    </option>
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <FunnelInput
                  label="Area or region"
                  optional
                  placeholder="e.g. Hampshire"
                  value={intake.region}
                  onChange={(e) => setIntake((s) => ({ ...s, region: e.target.value }))}
                  onKeyDown={onEnter}
                />
                <FunnelInput
                  label="Email"
                  placeholder="you@acme.co.uk"
                  type="email"
                  autoComplete="email"
                  value={intake.email}
                  onChange={(e) => setIntake((s) => ({ ...s, email: e.target.value }))}
                  onKeyDown={onEnter}
                />
                <ConsentCheckbox
                  checked={intake.consent}
                  onChange={(v) => setIntake((s) => ({ ...s, consent: v }))}
                  label="Send me my report and occasional brand tips from Milktree."
                />
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
              <PrimaryButton
                className="mt-7 w-full sm:w-auto"
                loading={busy}
                disabled={busy}
                onClick={() => void start()}
              >
                Start my brand check
                <ArrowRight className="size-4" />
              </PrimaryButton>
            </StepPanel>
          )}

          {step >= 1 &&
            step <= QUIZ_QUESTIONS.length &&
            (() => {
              const index = step - 1;
              const q = QUIZ_QUESTIONS[index];
              const Icon = QUESTION_ICONS[q.id];
              return (
                <StepPanel key={q.id} stepKey={q.id} direction={direction}>
                  <span className="mb-5 grid size-11 place-items-center rounded-xl bg-white/5 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <StepHeading title={q.question} />
                  <div className="grid gap-3">
                    {q.options.map((o) => (
                      <OptionCard
                        key={o.value}
                        label={o.label}
                        selected={answers[q.id] === o.value}
                        onSelect={() => answer(q.id, o.value, index)}
                      />
                    ))}
                  </div>
                  {busy && index === QUIZ_QUESTIONS.length - 1 && (
                    <p className="mt-6 text-sm text-faint">
                      Checking live search results for your market…
                    </p>
                  )}
                  {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                </StepPanel>
              );
            })()}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------ Results screen ---------------------------- */

function ResultsScreen({
  results,
  company,
  email,
}: {
  results: QuizResults;
  company: string;
  email: string;
}) {
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(results.benchmark);
  const polled = useRef(0);

  // If the benchmark was still running when results were computed, poll for
  // up to ~21s and upgrade the screen in place (same 50/50 merge the server
  // and the emailed report use).
  useEffect(() => {
    if (benchmark || results.sessionId === "local") return;
    const timer = window.setInterval(async () => {
      polled.current += 1;
      if (polled.current > 7) {
        window.clearInterval(timer);
        return;
      }
      try {
        const res = await fetch(`/api/quiz/benchmark?session=${results.sessionId}`);
        const data = (await res.json()) as {
          status?: string;
          benchmark?: BenchmarkResult | null;
        };
        if (data.status === "complete" || data.status === "failed") {
          window.clearInterval(timer);
          if (data.benchmark) setBenchmark(data.benchmark);
        }
      } catch {
        window.clearInterval(timer);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [benchmark, results.sessionId]);

  const score =
    benchmark?.benchmarkScore != null
      ? Math.round(results.selfScore * 0.5 + benchmark.benchmarkScore * 0.5)
      : results.score;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-faint">
          Brand Ranking Report · {company}
        </p>
        <ScoreGauge score={score} />
        <p className="text-body mx-auto mt-2 max-w-md text-[0.95rem]">
          {benchmark?.benchmarkScore != null
            ? "Weighted 50% self-assessment, 50% live market benchmark."
            : "Based on your self-assessment. Live market data is still being checked, and your emailed report will include it if available."}
        </p>
      </div>

      {/* Category breakdown */}
      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {(Object.entries(results.categoryScores) as [QuizCategory, number][]).map(
          ([category, value]) => (
            <div
              key={category}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] px-5 py-4"
            >
              <span className="text-sm font-bold text-foreground">
                {CATEGORY_LABELS[category]}
              </span>
              <span className="flex items-center gap-3">
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className={cn(
                      "block h-full rounded-full",
                      value >= 7 ? "bg-brand" : value >= 4 ? "bg-brand/60" : "bg-white/25",
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 10}%` }}
                    transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.3 }}
                  />
                </span>
                <span className="w-9 text-right text-sm font-bold text-foreground">
                  {value}/10
                </span>
              </span>
            </div>
          ),
        )}
      </div>

      {/* Benchmark — you vs the top 3 */}
      {benchmark && benchmark.competitors.length > 0 && (
        <BenchmarkTable benchmark={benchmark} company={company} />
      )}

      {/* Top 3 fixes */}
      <div className="mt-14">
        <h3 className="text-h3">Your top 3 fixes</h3>
        <p className="text-body mt-2 text-[0.95rem]">
          Picked for your weakest areas. Actionable this week.
        </p>
        <div className="mt-6 grid gap-3">
          {results.actions.map((action, i) => (
            <div
              key={action}
              className="flex gap-4 rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-5"
            >
              <span className="text-lg font-bold text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[0.98rem] leading-relaxed text-muted-foreground">
                {action}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/[0.06] p-5">
          <Check className="size-5 shrink-0 text-brand" />
          <p className="text-sm text-foreground">
            <strong>7 more fixes</strong> plus your full score breakdown are on
            their way to <strong>{email}</strong>.
          </p>
        </div>
      </div>

      {/* Soft CTA */}
      <div className="mt-16 rounded-[2rem] border border-border bg-card p-8 text-center md:p-10">
        <h3 className="mx-auto max-w-[22ch] text-balance text-2xl font-bold tracking-tight">
          Want a team to do all of this for you?
        </h3>
        <p className="text-body mx-auto mt-3 max-w-md text-[0.95rem]">
          Milktree starts at £1,999/mo. Unlimited requests, senior work back
          in ~48 hours, cancel any month.
        </p>
        <Link
          href="/#plans"
          data-cursor="hover"
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-[44px] bg-brand px-7 text-[0.95rem] font-bold text-brand-ink transition-all hover:brightness-105"
        >
          See how Milktree works
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const reduce = useReducedMotion();
  const radius = 84;
  const circumference = Math.PI * radius; // semicircle
  const [display, setDisplay] = useState(reduce ? score : 0);

  useEffect(() => {
    const start = performance.now();
    const duration = reduce ? 0 : 1400;
    let frame: number;
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, reduce]);

  return (
    <div className="relative mx-auto mt-8 h-[120px] w-[220px]">
      <svg viewBox="0 0 220 120" className="h-full w-full">
        <path
          d="M 26 110 A 84 84 0 0 1 194 110"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d="M 26 110 A 84 84 0 0 1 194 110"
          fill="none"
          stroke="#FFEE02"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference * (1 - Math.max(0.02, score / 100)),
          }}
          transition={{ duration: reduce ? 0 : 1.4, ease: EASE_OUT_EXPO }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-5xl font-bold tracking-tight text-foreground">
          {display}
        </span>
        <span className="text-lg font-bold text-faint">/100</span>
      </div>
    </div>
  );
}

function BenchmarkTable({
  benchmark,
  company,
}: {
  benchmark: BenchmarkResult;
  company: string;
}) {
  return (
    <div className="mt-14">
      <h3 className="text-h3">You vs the top 3 in your market</h3>
      <p className="text-body mt-2 text-[0.95rem]">
        Live Google results for{" "}
        {benchmark.terms.map((t, i) => (
          <span key={t}>
            {i > 0 && ", "}
            <em>&ldquo;{t}&rdquo;</em>
          </span>
        ))}
        . The terms your customers actually type.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#1A1A1A]">
        {benchmark.competitors.map((c) => (
          <div
            key={c.domain}
            className="flex items-center justify-between gap-4 border-b border-[#1A1A1A] bg-[#0A0A0A] px-5 py-4"
          >
            <div className="min-w-0">
              <p className="truncate text-[0.95rem] font-bold text-foreground">
                {c.name || c.domain}
              </p>
              <p className="truncate text-xs text-faint">{c.domain}</p>
            </div>
            <div className="flex items-center gap-4">
              {c.brand?.colors && c.brand.colors.length > 0 && (
                <span className="hidden gap-1 sm:flex">
                  {c.brand.colors.slice(0, 4).map((color) => (
                    <span
                      key={color}
                      className="size-3.5 rounded border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
              )}
              <span className="whitespace-nowrap text-sm font-bold text-foreground">
                #{c.bestPosition}
              </span>
            </div>
          </div>
        ))}
        {/* User row — highlighted */}
        <div className="flex items-center justify-between gap-4 border-l-2 border-brand bg-brand/[0.07] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-[0.95rem] font-bold text-brand">
              {company} (you)
            </p>
            {benchmark.userBrand?.domain && (
              <p className="truncate text-xs text-faint">{benchmark.userBrand.domain}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {benchmark.userBrand?.colors && benchmark.userBrand.colors.length > 0 && (
              <span className="hidden gap-1 sm:flex">
                {benchmark.userBrand.colors.slice(0, 4).map((color) => (
                  <span
                    key={color}
                    className="size-3.5 rounded border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
            )}
            <span className="whitespace-nowrap text-sm font-bold text-foreground">
              {benchmark.userBestPosition !== null
                ? `#${benchmark.userBestPosition}`
                : "Not in top 20"}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[0.95rem] font-semibold text-foreground">
        {benchmark.userBestPosition !== null ? (
          <>
            You rank <span className="text-brand">#{benchmark.userBestPosition}</span> for
            &ldquo;{benchmark.userBestTerm}&rdquo;. These three own page 1.
          </>
        ) : (
          <>
            You don&apos;t appear in the top 20 for these terms.{" "}
            <span className="text-brand">These three own page 1.</span>
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-faint">
        Positions from live Google search results. Brand palettes extracted
        from each site. Traffic figures are omitted rather than estimated.
      </p>
    </div>
  );
}
