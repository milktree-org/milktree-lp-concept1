import { after } from "next/server";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { getResend, FROM, addToNurture } from "@/lib/server/resend";
import { quizReportEmail } from "@/lib/server/emails";
import {
  computeCategoryScores,
  computeSelfScore,
  computeFinalScore,
  weakestCategories,
  selectActions,
} from "@/lib/server/quiz-scoring";
import {
  QUIZ_QUESTIONS,
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
        self_score: selfScore,
        final_score: score,
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
    if (error) console.error("[quiz] completion update failed:", error.message);

    after(async () => {
      await sendReportAndTag(sessionId, {
        categoryScores,
        selfScore,
        allActions,
      });
    });
  }

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
 * Full report by email (§5.5). Sends regardless of marketing consent — it's
 * the transactional deliverable the user requested. Nurture tagging is
 * consent-gated (UK PECR).
 */
async function sendReportAndTag(
  sessionId: string,
  computed: {
    categoryScores: QuizResults["categoryScores"];
    selfScore: number;
    allActions: string[];
  },
) {
  const supabase = getSupabase();
  const resend = getResend();
  if (!supabase) return;

  // Give a still-running benchmark a last chance so the email is as rich as
  // possible, then send with whatever exists.
  const benchmark = await waitForBenchmark(sessionId, EMAIL_WAIT_MS);

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("email, company, sector, consent, final_score, report_sent_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session?.email || session.report_sent_at) return;

  const score = computeFinalScore(
    computed.selfScore,
    benchmark?.benchmarkScore ?? null,
  );
  if (score !== session.final_score) {
    await supabase
      .from("quiz_sessions")
      .update({ final_score: score })
      .eq("id", sessionId);
  }

  if (resend) {
    try {
      const email = quizReportEmail({
        company: session.company ?? "Your brand",
        score,
        categoryScores: computed.categoryScores,
        actions: computed.allActions,
        benchmark,
      });
      await resend.emails.send({
        from: FROM,
        to: session.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      await supabase
        .from("quiz_sessions")
        .update({ report_sent_at: new Date().toISOString() })
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
