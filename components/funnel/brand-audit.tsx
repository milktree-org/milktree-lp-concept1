"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Search, Globe, Palette, FileText } from "lucide-react";
import { SECTORS, type BenchmarkResult } from "@/lib/quiz";
import { SEVERITY_LABELS, type AuditResults, type AuditSeverity } from "@/lib/audit";
import { trackCustom } from "@/lib/analytics/meta-tracking";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  FunnelInput,
  PrimaryButton,
  ConsentCheckbox,
} from "@/components/funnel/ui";

/**
 * Automated Brand Audit (§lead magnets). One short form, then the machine
 * does the work: live SERP benchmark + brand extraction on the user's own
 * site, rendered as a findings-led audit. No self-assessment questions —
 * the pitch is "we looked at your brand", so we only report what we found.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 18; // ~54s ceiling before we hand over to the email

type Phase = "form" | "analysing" | "results" | "failed";

const ANALYSIS_STEPS = [
  { icon: Search, label: "Searching Google for your market" },
  { icon: Globe, label: "Reading your website" },
  { icon: Palette, label: "Extracting competitor brands" },
  { icon: FileText, label: "Compiling your audit" },
];

const SEVERITY_STYLES: Record<AuditSeverity, string> = {
  critical: "text-red-400",
  warning: "text-brand",
  good: "text-faint",
};

export function BrandAudit() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("form");
  const [intake, setIntake] = useState({
    company: params.get("company") ?? "",
    website: params.get("website") ?? "",
    sector: "",
    region: "",
    email: params.get("email") ?? "",
    consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AuditResults | null>(null);
  const sessionRef = useRef<string | null>(null);

  const start = useCallback(async () => {
    if (busy) return;
    setError(null);
    if (!intake.company.trim()) return setError("Add your company name.");
    if (!intake.website.trim())
      return setError("The audit reads your website — add its address.");
    if (!intake.sector) return setError("Pick the sector closest to what you do.");
    if (!EMAIL_RE.test(intake.email.trim()))
      return setError("A valid email is needed. It's where your audit goes.");

    setBusy(true);
    try {
      const res = await fetch("/api/audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: intake.company.trim(),
          website: intake.website.trim(),
          sector: intake.sector,
          region: intake.region.trim(),
          email: intake.email.trim(),
          consent: intake.consent,
          source: params.get("src") === "form" ? "start-form" : "brand-audit",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        sessionId?: string;
        error?: string;
      };
      if (!res.ok || !data.sessionId) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      sessionRef.current = data.sessionId;
      trackCustom("BrandAuditStart");
      setBusy(false);
      setPhase("analysing");
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setBusy(false);
    }
  }, [busy, intake, params]);

  /* Poll while the pipeline runs. */
  useEffect(() => {
    if (phase !== "analysing" || !sessionRef.current) return;
    let polls = 0;
    let cancelled = false;

    const poll = async () => {
      polls += 1;
      try {
        const res = await fetch("/api/audit/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          status?: string;
          results?: AuditResults;
        };
        if (cancelled) return;
        if (data.status === "complete" && data.results) {
          trackCustom("BrandAuditComplete", {
            customData: { score: data.results.score ?? undefined },
            userData: { email: intake.email.trim() },
          });
          setResults(data.results);
          setPhase("results");
          return;
        }
        if (data.status === "failed" || polls >= MAX_POLLS) {
          setPhase("failed");
          return;
        }
      } catch {
        if (polls >= MAX_POLLS) {
          setPhase("failed");
          return;
        }
      }
      window.setTimeout(poll, POLL_INTERVAL_MS);
    };

    const timer = window.setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phase, intake.email]);

  if (phase === "results" && results) {
    return (
      <AuditResultsScreen
        results={results}
        company={intake.company.trim() || "Your brand"}
        email={intake.email.trim()}
      />
    );
  }

  if (phase === "failed") {
    return (
      <div className="mx-auto w-full max-w-xl text-center">
        <h2 className="text-balance text-[clamp(1.6rem,4vw,2.2rem)] font-bold leading-[1.05] tracking-[-0.02em]">
          We couldn&apos;t complete the automated audit.
        </h2>
        <p className="text-body mx-auto mt-4 max-w-md">
          Your site or the search lookup didn&apos;t respond in time. No
          made-up results here — try the two-minute Brand Ranking Quiz
          instead, which works even when your site is being shy.
        </p>
        <Link
          href="/brand-report"
          data-cursor="hover"
          className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-[44px] bg-brand px-8 text-[0.98rem] font-bold text-brand-ink transition-all hover:brightness-105"
        >
          Take the brand quiz instead
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (phase === "analysing") {
    return <AnalysingScreen website={intake.website.trim()} />;
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void start();
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
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
          placeholder="acme.co.uk"
          inputMode="url"
          value={intake.website}
          onChange={(e) => setIntake((s) => ({ ...s, website: e.target.value }))}
          onKeyDown={onEnter}
        />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-foreground">
            Sector
          </span>
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
          label="Send me my audit and occasional brand tips from Milktree."
        />
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <PrimaryButton
        className="mt-7 w-full sm:w-auto"
        loading={busy}
        disabled={busy}
        onClick={() => void start()}
      >
        Audit my brand
        <ArrowRight className="size-4" />
      </PrimaryButton>
      <p className="mt-4 text-sm text-faint">
        Takes about a minute. Real search data and your actual website — if we
        can&apos;t find something, we say so rather than making it up.
      </p>
    </div>
  );
}

/* ----------------------------- Analysing screen --------------------------- */

function AnalysingScreen({ website }: { website: string }) {
  const reduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  // Progress theatre — advances on a timer while the real pipeline runs.
  // The last step holds until polling resolves.
  useEffect(() => {
    if (activeStep >= ANALYSIS_STEPS.length - 1) return;
    const timer = window.setTimeout(() => setActiveStep((s) => s + 1), 6000);
    return () => window.clearTimeout(timer);
  }, [activeStep]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[2rem] border border-border bg-surface p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
          Auditing {website}
        </p>
        <div className="mt-7 grid gap-5">
          {ANALYSIS_STEPS.map((step, i) => {
            const Icon = step.icon;
            const state =
              i < activeStep ? "done" : i === activeStep ? "active" : "pending";
            return (
              <div key={step.label} className="flex items-center gap-4">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-300",
                    state === "done" && "bg-brand text-brand-ink",
                    state === "active" && "bg-white/10 text-brand",
                    state === "pending" && "bg-white/5 text-faint",
                  )}
                >
                  {state === "done" ? (
                    <Check className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[0.95rem] font-bold transition-colors duration-300",
                    state === "pending" ? "text-faint" : "text-foreground",
                  )}
                >
                  {step.label}
                  {state === "active" && !reduce && (
                    <motion.span
                      className="ml-1 inline-block"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    >
                      …
                    </motion.span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-7 border-t border-white/[0.06] pt-5 text-sm leading-relaxed text-faint">
          Live Google lookups and a real read of your site take about a
          minute. Your full audit also lands in your inbox, so you can close
          this tab if you&apos;re busy.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ Results screen ---------------------------- */

function AuditResultsScreen({
  results,
  company,
  email,
}: {
  results: AuditResults;
  company: string;
  email: string;
}) {
  const benchmark = results.benchmark;
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-faint">
          Brand Audit · {company}
        </p>
        {results.score !== null && <ScoreGauge score={results.score} />}
        <p className="text-body mx-auto mt-2 max-w-md text-[0.95rem]">
          Built from live Google results and an automated read of your
          website. Everything below is what we actually found.
        </p>
      </div>

      {/* Findings */}
      <div className="mt-12 grid gap-3">
        {results.findings.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: i * 0.07 }}
            className={cn(
              "rounded-2xl border bg-[#0A0A0A] p-5",
              f.severity === "critical" ? "border-red-400/30" : "border-[#1A1A1A]",
            )}
          >
            <p
              className={cn(
                "text-[0.68rem] font-black uppercase tracking-[0.14em]",
                SEVERITY_STYLES[f.severity],
              )}
            >
              {SEVERITY_LABELS[f.severity]}
            </p>
            <p className="mt-1.5 text-[1.02rem] font-bold text-foreground">
              {f.title}
            </p>
            <p className="mt-1.5 text-[0.92rem] leading-relaxed text-muted-foreground">
              {f.detail}
            </p>
          </motion.div>
        ))}
      </div>

      {/* You vs the top 3 */}
      {benchmark && benchmark.competitors.length > 0 && (
        <CompetitorTable benchmark={benchmark} company={company} />
      )}

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/[0.06] p-5">
        <Check className="size-5 shrink-0 text-brand" />
        <p className="text-sm text-foreground">
          The full audit is on its way to <strong>{email}</strong> — keep it,
          forward it, action it.
        </p>
      </div>

      {/* Soft CTA */}
      <div className="mt-14 rounded-[2rem] border border-border bg-card p-8 text-center md:p-10">
        <h3 className="mx-auto max-w-[24ch] text-balance text-2xl font-bold tracking-tight">
          Every &ldquo;fix first&rdquo; above is one Milktree request.
        </h3>
        <p className="text-body mx-auto mt-3 max-w-md text-[0.95rem]">
          Unlimited requests, senior work back in ~48 hours, from £1,999/mo.
          Cancel any month.
        </p>
        <Link
          href="/start"
          data-cursor="hover"
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-[44px] bg-brand px-7 text-[0.95rem] font-bold text-brand-ink transition-all hover:brightness-105"
        >
          See if Milktree fits
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const reduce = useReducedMotion();
  const radius = 84;
  const circumference = Math.PI * radius;
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

function CompetitorTable({
  benchmark,
  company,
}: {
  benchmark: BenchmarkResult;
  company: string;
}) {
  return (
    <div className="mt-14">
      <h3 className="text-h3">You vs the page-1 players</h3>
      <p className="text-body mt-2 text-[0.95rem]">
        Live Google results for{" "}
        {benchmark.terms.map((t, i) => (
          <span key={t}>
            {i > 0 && ", "}
            <em>&ldquo;{t}&rdquo;</em>
          </span>
        ))}
        .
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
        <div className="flex items-center justify-between gap-4 border-l-2 border-brand bg-brand/[0.07] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-[0.95rem] font-bold text-brand">
              {company} (you)
            </p>
            {benchmark.userBrand?.domain && (
              <p className="truncate text-xs text-faint">
                {benchmark.userBrand.domain}
              </p>
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
      <p className="mt-3 text-xs text-faint">
        Positions from live Google search results. Brand palettes extracted
        from each site. Nothing estimated, nothing invented.
      </p>
    </div>
  );
}
