import { after } from "next/server";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { getResend, FROM, addToNurture } from "@/lib/server/resend";
import { auditReportEmail } from "@/lib/server/emails";
import { generateFindings } from "@/lib/server/audit-findings";
import type { BenchmarkResult } from "@/lib/quiz";
import type { AuditResults } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/audit/complete — poll for the automated audit. The client calls
 * this every few seconds while the benchmark runs:
 *   - still running → { status: "running" }
 *   - failed / nothing found → { status: "failed" } (client offers the quiz)
 *   - complete → { status: "complete", results } + report email in after()
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`audit-poll:${requestIp(request)}`, 120, 600);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId =
    typeof body.sessionId === "string" && /^[0-9a-f-]{36}$/i.test(body.sessionId)
      ? body.sessionId
      : null;
  if (!sessionId) {
    return Response.json({ error: "Invalid session" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) return Response.json({ status: "failed" });

  const { data: session, error } = await supabase
    .from("quiz_sessions")
    .select("benchmark_status, benchmark, company, email, consent, report_sent_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  if (
    session.benchmark_status === "pending" ||
    session.benchmark_status === "running"
  ) {
    return Response.json({ status: "running" });
  }

  const benchmark = (session.benchmark as BenchmarkResult | null) ?? null;
  if (
    session.benchmark_status === "failed" ||
    !benchmark ||
    benchmark.tier === "none"
  ) {
    return Response.json({ status: "failed" });
  }

  const company = (session.company as string) || "Your brand";
  const findings = generateFindings(benchmark, company);
  const score = benchmark.benchmarkScore;

  await supabase
    .from("quiz_sessions")
    .update({ final_score: score, completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  const results: AuditResults = { sessionId, score, findings, benchmark };

  // Report email + consent-gated nurture — once, guarded by report_sent_at.
  if (!session.report_sent_at && session.email) {
    const email = session.email as string;
    const consent = session.consent === true;
    // Claim the send BEFORE queueing so parallel polls can't double-send.
    const { data: claimed } = await supabase
      .from("quiz_sessions")
      .update({ report_sent_at: new Date().toISOString() })
      .eq("id", sessionId)
      .is("report_sent_at", null)
      .select("id")
      .maybeSingle();

    if (claimed) {
      after(async () => {
        await Promise.allSettled([
          sendAuditEmail(email, company, results),
          consent
            ? addToNurture({ email }).catch((e) =>
                console.error("[audit] nurture add failed:", e),
              )
            : Promise.resolve(),
        ]);
      });
    }
  }

  return Response.json({ status: "complete", results });
}

async function sendAuditEmail(
  to: string,
  company: string,
  results: AuditResults,
) {
  const resend = getResend();
  if (!resend) return;
  try {
    const email = auditReportEmail({
      company,
      score: results.score,
      findings: results.findings,
      benchmark: results.benchmark,
    });
    await resend.emails.send({
      from: FROM,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (e) {
    console.error("[audit] report email failed:", e);
  }
}
