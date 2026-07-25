import { getSupabase } from "@/lib/server/supabase";
import { runBenchmark } from "@/lib/server/benchmark";
import type { SectorValue } from "@/lib/quiz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/doc/rebenchmark — internal. Re-runs the live market benchmark for
 * an existing session, optionally with corrected search terms, then returns
 * the stored result. Use when a lead's sector template doesn't match their
 * actual market (e.g. a design studio filed under professional services), or
 * when the first run failed. Auth: ?k=<DOC_REVIEW_KEY>.
 */
export async function POST(request: Request) {
  const requiredKey = process.env.DOC_REVIEW_KEY;
  const providedKey = new URL(request.url).searchParams.get("k");
  if (requiredKey ? providedKey !== requiredKey : process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return Response.json({ error: "Invalid session id" }, { status: 400 });
  }
  const terms = Array.isArray(body.terms)
    ? body.terms.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    : undefined;

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("id, company, website, sector, region")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  await runBenchmark({
    sessionId,
    sector: (session.sector as SectorValue) ?? "other",
    region: session.region as string | null,
    company: session.company as string | null,
    website: session.website as string | null,
    terms,
    serpTimeoutMs: 90_000,
  });

  const { data: updated } = await supabase
    .from("quiz_sessions")
    .select("benchmark_status, benchmark")
    .eq("id", sessionId)
    .maybeSingle();

  return Response.json({
    status: updated?.benchmark_status ?? "unknown",
    benchmark: updated?.benchmark ?? null,
  });
}
