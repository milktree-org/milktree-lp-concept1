import { after } from "next/server";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { corroborateWithMarketLeader } from "@/lib/server/benchmark";
import { sendToFormspree } from "@/lib/server/formspree";
import { sendToGhlWebhook } from "@/lib/server/ghl";
import { getResend, FROM, REPLY_TO, addToNurture } from "@/lib/server/resend";
import { composeReportEmail } from "@/lib/server/quiz-report";
import { SITE_URL } from "@/lib/seo";
import {
  computeCategoryScores,
  computeSelfScore,
  computeFinalScore,
  weakestCategories,
  selectActions,
} from "@/lib/server/quiz-scoring";
import {
  QUIZ_QUESTIONS,
  CATEGORY_LABELS,
  type BenchmarkResult,
  type QuizAnswers,
  type QuizResults,
} from "@/lib/quiz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** How long the results computation waits for a still-running benchmark. */
const COMPLETE_WAIT_MS = 8_000;
/** How much longer the report email waits before sending with what exists. */
const EMAIL_WAIT_MS = 20_000;
const POLL_INTERVAL_MS = 1_500;
/**
 * Report email delivery delay — scheduled via Resend, not sent instantly.
 * Override with REPORT_DELAY_MINUTES (set 0 to send immediately, e.g. tests).
 */
const REPORT_DELAY_MS =
  process.env.REPORT_DELAY_MINUTES !== undefined
    ? Math.max(0, Number(process.env.REPORT_DELAY_MINUTES) || 0) * 60 * 1000
    : 45 * 60 * 1000;

/**
 * POST /api/quiz/complete — score the self-assessment, merge any benchmark
 * data that's ready (waiting briefly for a still-running lookup), persist,
 * return the results payload, then send the full report email + consent-gated
 * nurture add in the background.
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`quiz-complete:${requestIp(request)}`, 15, 600);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const answers = validateAnswers(body.answers);
  if (!answers) {
    return Response.json({ error: "Answer the questions first" }, { status: 400 });
  }

  const sessionId =
    typeof body.sessionId === "string" && /^[0-9a-f-]{36}$/i.test(body.sessionId)
      ? body.sessionId
      : null;

  // Intake context sent by the client so the completion record forwarded to
  // Formspree is self-contained (works even without a DB session).
  const str = (v: unknown, max = 200) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const intake = {
    name: str(body.name, 120),
    jobRole: str(body.jobRole, 120),
    marketLeader: str(body.marketLeader),
    company: str(body.company),
    website: str(body.website),
    sector: str(body.sector, 80),
    region: str(body.region, 80),
    email: str(body.email),
    consent: body.consent === true,
    source: str(body.source, 40) || "direct",
  };

  const categoryScores = computeCategoryScores(answers);
  const selfScore = computeSelfScore(categoryScores);
  const weakest = weakestCategories(categoryScores);
  const allActions = selectActions(categoryScores);

  const supabase = getSupabase();

  // Merge benchmark if the session has one (waiting briefly if still running).
  let benchmark: BenchmarkResult | null = null;
  if (supabase && sessionId) {
    benchmark = await waitForBenchmark(sessionId, COMPLETE_WAIT_MS);
  }

  const score = computeFinalScore(selfScore, benchmark?.benchmarkScore ?? null);

  if (supabase && sessionId) {
    const { error } = await supabase
      .from("quiz_sessions")
      .update({
        answers,
        market_leader: intake.marketLeader || null,
        name: intake.name || null,
        job_role: intake.jobRole || null,
        self_score: selfScore,
        final_score: score,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
    if (error) console.error("[quiz] completion update failed:", error.message);
  }

  after(async () => {
    // Give a still-running benchmark one last chance so both the Formspree
    // record and the emailed report carry the market data.
    let finalBenchmark =
      supabase && sessionId
        ? await waitForBenchmark(sessionId, EMAIL_WAIT_MS)
        : benchmark;

    // The named market leader only arrives now. If the benchmark stayed on
    // sector defaults despite discovery reading a (weak) category off the
    // lead's own site, the leader can settle it — ranking for the derived
    // terms and not the defaults means the derived terms are the real market.
    if (supabase && sessionId && intake.marketLeader) {
      const corrected = await corroborateWithMarketLeader({
        sessionId,
        marketLeader: intake.marketLeader,
      }).catch((e) => {
        console.error("[quiz] leader corroboration failed:", e);
        return false;
      });
      if (corrected) {
        finalBenchmark = await waitForBenchmark(sessionId, EMAIL_WAIT_MS);
      }
    }
    const finalScore = computeFinalScore(
      selfScore,
      finalBenchmark?.benchmarkScore ?? null,
    );

    // Internal review link for the Brand Score document (the 3-hour clock).
    const reviewLink = sessionId ? docReviewLink(sessionId) : null;

    await sendCompletionToFormspree({
      intake,
      answers,
      score: finalScore,
      selfScore,
      benchmark: finalBenchmark,
      reviewLink,
    });

    // GHL Workflow 1: upsert the contact, tag brand-score, notify the team
    // with the review link so the document gets built and published.
    await sendToGhlWebhook("brandScore", {
      type: "brand-score-completed",
      session_id: sessionId ?? "local",
      name: intake.name,
      job_role: intake.jobRole,
      email: intake.email,
      company: intake.company,
      website: intake.website,
      sector: intake.sector,
      region: intake.region,
      market_leader: intake.marketLeader,
      consent: intake.consent,
      source: intake.source,
      score: finalScore,
      review_link: reviewLink ?? "",
    });

    if (supabase && sessionId) {
      await sendReportAndTag(sessionId, answers, finalBenchmark);
    }
  });

  const results: QuizResults = {
    sessionId: sessionId ?? "local",
    score,
    selfScore,
    categoryScores,
    weakest,
    actions: allActions.slice(0, 3),
    benchmark,
  };
  return Response.json(results);
}

function validateAnswers(raw: unknown): QuizAnswers | null {
  if (typeof raw !== "object" || raw === null) return null;
  const input = raw as Record<string, unknown>;
  const answers: QuizAnswers = {};
  let count = 0;
  for (const q of QUIZ_QUESTIONS) {
    const value = input[q.id];
    if (typeof value === "string" && q.options.some((o) => o.value === value)) {
      answers[q.id] = value;
      count++;
    }
  }
  return count >= QUIZ_QUESTIONS.length - 1 ? answers : null;
}

async function waitForBenchmark(
  sessionId: string,
  budgetMs: number,
): Promise<BenchmarkResult | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const deadline = Date.now() + budgetMs;

  for (;;) {
    const { data } = await supabase
      .from("quiz_sessions")
      .select("benchmark_status, benchmark")
      .eq("id", sessionId)
      .maybeSingle();

    if (!data) return null;
    if (data.benchmark_status === "complete" || data.benchmark_status === "failed") {
      return (data.benchmark as BenchmarkResult | null) ?? null;
    }
    if (Date.now() >= deadline) return null;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

/**
 * The full completion record for Formspree — the upsell dataset. Every quiz
 * answer (as its human-readable label), the score, the market leader and the
 * live benchmark summary, alongside the intake so the row is self-contained.
 */
async function sendCompletionToFormspree(data: {
  intake: {
    name: string;
    jobRole: string;
    marketLeader: string;
    company: string;
    website: string;
    sector: string;
    region: string;
    email: string;
    consent: boolean;
    source: string;
  };
  answers: QuizAnswers;
  score: number;
  selfScore: number;
  benchmark: BenchmarkResult | null;
  reviewLink: string | null;
}) {
  const { intake, answers, score, selfScore, benchmark, reviewLink } = data;

  const answerFields: Record<string, string> = {};
  for (const q of QUIZ_QUESTIONS) {
    const label = q.options.find((o) => o.value === answers[q.id])?.label;
    if (label) answerFields[CATEGORY_LABELS[q.id]] = label;
  }

  await sendToFormspree("brandScore", {
    _subject: `Brand Score Completed — ${intake.company || "Unknown company"} — ${score}/100`,
    form: "brand-quiz-completed",
    name: intake.name,
    jobRole: intake.jobRole,
    company: intake.company,
    website: intake.website,
    sector: intake.sector,
    region: intake.region,
    email: intake.email,
    consent: intake.consent,
    source: intake.source,
    "Brand you admire": intake.marketLeader || "Not answered",
    "Brand Score": score,
    "Self-assessment score": selfScore,
    ...answerFields,
    "Benchmark score": benchmark?.benchmarkScore ?? "Not available",
    "Best Google position": benchmark?.userBestPosition ?? "Not found",
    "Top competitors found":
      (benchmark?.competitors ?? [])
        .slice(0, 3)
        .map((c) => c.name || c.domain)
        .join(", ") || "None found",
    "Brand Score document (internal review link)":
      reviewLink ?? "Not available (no database session)",
  });
}

/** Gated internal link to review + publish the lead's Brand Score document. */
function docReviewLink(sessionId: string): string {
  const key = process.env.DOC_REVIEW_KEY;
  return `${SITE_URL}/brand-score-doc/${sessionId}${key ? `?k=${encodeURIComponent(key)}` : ""}`;
}

/**
 * Full report by email (§5.5). Sends regardless of marketing consent — it's
 * the transactional deliverable the user requested. Nurture tagging is
 * consent-gated (UK PECR).
 */
async function sendReportAndTag(
  sessionId: string,
  answers: QuizAnswers,
  benchmark: BenchmarkResult | null,
) {
  const supabase = getSupabase();
  const resend = getResend();
  if (!supabase) return;

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("email, company, sector, consent, final_score, report_sent_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session?.email || session.report_sent_at) return;

  const email = composeReportEmail({
    id: sessionId,
    company: session.company as string | null,
    answers,
    benchmark,
  });
  if (email.score !== session.final_score) {
    await supabase
      .from("quiz_sessions")
      .update({ final_score: email.score })
      .eq("id", sessionId);
  }

  if (resend) {
    try {
      // Content is computed now (benchmark fresh); delivery is deferred so
      // the report lands 45 minutes after they finish the quiz, not the
      // second they close the tab. With a zero delay, send immediately.
      const deliverAt = new Date(Date.now() + REPORT_DELAY_MS).toISOString();
      const { data: sent } = await resend.emails.send({
        from: FROM,
        replyTo: REPLY_TO,
        to: session.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(REPORT_DELAY_MS > 0 ? { scheduledAt: deliverAt } : {}),
      });
      // Keep the Resend id: publishing the document cancels this scheduled
      // send and delivers it early rather than emailing the lead twice.
      await supabase
        .from("quiz_sessions")
        .update({ report_sent_at: deliverAt, report_email_id: sent?.id ?? null })
        .eq("id", sessionId);
    } catch (e) {
      console.error("[quiz] report email failed:", e);
    }
  }

  if (session.consent) {
    await addToNurture({ email: session.email }).catch((e) =>
      console.error("[quiz] nurture add failed:", e),
    );
  }
}
