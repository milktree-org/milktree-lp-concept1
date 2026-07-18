import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/quiz/benchmark?session= — poll for the async benchmark results.
 * Returns only status + benchmark payload; nothing sensitive.
 */
export async function GET(request: Request) {
  const allowed = await rateLimit(`quiz-poll:${requestIp(request)}`, 120, 600);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const sessionId = new URL(request.url).searchParams.get("session");
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return Response.json({ error: "Invalid session" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) return Response.json({ status: "failed", benchmark: null });

  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("benchmark_status, benchmark")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !data) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  return Response.json({ status: data.benchmark_status, benchmark: data.benchmark });
}
