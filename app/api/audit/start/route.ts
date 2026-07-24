import { after } from "next/server";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { sendToFormspree } from "@/lib/server/formspree";
import { runBenchmark } from "@/lib/server/benchmark";
import { SECTORS, type SectorValue } from "@/lib/quiz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECTOR_VALUES = new Set(SECTORS.map((s) => s.value));

/**
 * POST /api/audit/start — automated Brand Audit. Same session + benchmark
 * pipeline as the quiz (rows share quiz_sessions, source "brand-audit"),
 * but the website is REQUIRED: the audit's whole promise is "we looked at
 * your brand", so there must be a brand to look at.
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`audit-start:${requestIp(request)}`, 10, 600);
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

  const company = str(body.company);
  const website = str(body.website);
  const sector = str(body.sector);
  const region = str(body.region, 80);
  const email = str(body.email);
  const consent = body.consent === true;
  const source = str(body.source, 40) || "brand-audit";

  if (!company)
    return Response.json({ error: "Company name is required" }, { status: 400 });
  if (!website)
    return Response.json(
      { error: "The audit reads your website — add its address" },
      { status: 400 },
    );
  if (!SECTOR_VALUES.has(sector as SectorValue))
    return Response.json({ error: "Pick a sector" }, { status: 400 });
  if (!EMAIL_RE.test(email))
    return Response.json({ error: "A valid email is required" }, { status: 400 });

  // Capture the lead at the gate — even if the audit pipeline can't run,
  // the submission is stored.
  await sendToFormspree("brandScore", {
    _subject: `New Brand Score Lead — ${company}`,
    form: "brand-audit",
    company,
    website,
    sector,
    region,
    email,
    consent,
    source,
  });

  const supabase = getSupabase();
  if (!supabase) {
    console.error("[audit] Supabase not configured; audit unavailable");
    return Response.json(
      { error: "The audit is briefly unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("quiz_sessions")
    .insert({
      company,
      website,
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
    console.error("[audit] session insert failed:", error.message);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  const sessionId = data.id as string;

  after(async () => {
    await runBenchmark({
      sessionId,
      sector: sector as SectorValue,
      region: region || null,
      company,
      website,
    });
  });

  return Response.json({ sessionId });
}
