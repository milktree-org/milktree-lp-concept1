import { after } from "next/server";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { runBenchmark } from "@/lib/server/benchmark";
import { SECTORS, type SectorValue } from "@/lib/quiz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECTOR_VALUES = new Set(SECTORS.map((s) => s.value));

/**
 * POST /api/quiz/start — create a quiz session and kick off the async
 * benchmark lookups (Apify SERP + Firecrawl brand extraction) so results are
 * ready by the time the user finishes the self-assessment.
 *
 * The contact is already captured to Formspree by /api/quiz/capture on the
 * first slide, so this route no longer double-writes there; it just persists
 * the session for benchmarking. If no DB is configured or the insert fails we
 * degrade to a self-assessment-only session (the lead is safe either way).
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`quiz-start:${requestIp(request)}`, 10, 600);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const str = (v: unknown, max = 200) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const name = str(body.name, 120);
  const jobRole = str(body.jobRole, 120);
  const company = str(body.company);
  const website = str(body.website);
  const sector = str(body.sector);
  const region = str(body.region, 80);
  const email = str(body.email);
  const consent = body.consent === true;
  const leadId = str(body.leadId, 40) || null;
  const source = str(body.source, 40) || "direct";

  if (!company) return Response.json({ error: "Company name is required" }, { status: 400 });
  if (!SECTOR_VALUES.has(sector as SectorValue))
    return Response.json({ error: "Pick a sector" }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return Response.json({ error: "A valid email is required" }, { status: 400 });

  const supabase = getSupabase();
  if (!supabase) {
    // No DB configured: self-assessment-only session; the contact is already
    // in Formspree from the capture step.
    console.error("[quiz] Supabase not configured; running self-assessment-only");
    return Response.json({ sessionId: null });
  }

  const { data, error } = await supabase
    .from("quiz_sessions")
    .insert({
      lead_id: leadId,
      name: name || null,
      job_role: jobRole || null,
      company,
      website: website || null,
      sector,
      region: region || null,
      email,
      consent,
      source,
      benchmark_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[quiz] session insert failed:", error.message);
    // The contact is already safe in Formspree — degrade to a
    // self-assessment-only session rather than erroring the user out.
    return Response.json({ sessionId: null });
  }

  const sessionId = data.id as string;

  after(async () => {
    await runBenchmark({
      sessionId,
      sector: sector as SectorValue,
      region: region || null,
      company,
      website: website || null,
    });
  });

  return Response.json({ sessionId });
}
