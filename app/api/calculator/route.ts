import { after } from "next/server";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import {
  getResend,
  FROM,
  addToNurture,
  notifySlack,
} from "@/lib/server/resend";
import { calculatorReportEmail } from "@/lib/server/emails";
import {
  ROLE_OPTIONS,
  LOCATION_OPTIONS,
  HIRING_OPTIONS,
  SALARY_MIN,
  SALARY_MAX,
  calculateHireCost,
  formatGBP,
  type RoleValue,
  type LocationValue,
  type HiringValue,
} from "@/lib/calculator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_VALUES = new Set(ROLE_OPTIONS.map((o) => o.value));
const LOCATION_VALUES = new Set(LOCATION_OPTIONS.map((o) => o.value));
const HIRING_VALUES = new Set(HIRING_OPTIONS.map((o) => o.value));

/**
 * POST /api/calculator — Design Hire Calculator lead capture.
 * Same ordering discipline as /api/lead: validate → persist → respond;
 * email/nurture/notify run in after() and never block or lose the lead.
 * The breakdown is recomputed server-side from the raw inputs.
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`calc:${requestIp(request)}`, 20, 600);
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
  const email = str(body.email);
  const role = str(body.role, 20);
  const location = str(body.location, 20);
  const hiring = str(body.hiring, 20);
  const salaryRaw = Number(body.salary);
  const consent = body.consent === true;
  const attribution =
    body.attribution && typeof body.attribution === "object"
      ? (body.attribution as Record<string, string>)
      : null;

  if (!EMAIL_RE.test(email))
    return Response.json({ error: "A valid email is required" }, { status: 400 });
  if (!ROLE_VALUES.has(role as RoleValue))
    return Response.json({ error: "Pick a role" }, { status: 400 });
  if (!LOCATION_VALUES.has(location as LocationValue))
    return Response.json({ error: "Pick a location" }, { status: 400 });
  if (!HIRING_VALUES.has(hiring as HiringValue))
    return Response.json({ error: "Pick a hiring route" }, { status: 400 });
  if (!Number.isFinite(salaryRaw))
    return Response.json({ error: "Salary is required" }, { status: 400 });

  const salary = Math.min(SALARY_MAX, Math.max(SALARY_MIN, Math.round(salaryRaw)));
  const breakdown = calculateHireCost({ salary, hiring: hiring as HiringValue });
  const roleLabel =
    ROLE_OPTIONS.find((o) => o.value === role)?.label ?? "design hire";

  // Persist FIRST — email delivery must never be the only record of a lead.
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("calculator_leads").insert({
      name: name || null,
      email,
      role,
      location,
      hiring_route: hiring,
      salary,
      total_cost: breakdown.total,
      consent,
      source: "hire-calculator",
      attribution,
    });
    if (error) {
      console.error("[calculator] insert failed:", error.message);
      after(() =>
        notifySlack(
          `:rotating_light: Calculator lead DB insert failed — lead only here: ${email} (${roleLabel}, ${formatGBP(breakdown.total)})`,
        ).catch(() => {}),
      );
      // Don't fail the request — the report email is the user-facing promise.
    }
  } else {
    console.error("[calculator] Supabase not configured; lead not persisted:", email);
  }

  after(async () => {
    await Promise.allSettled([
      sendReport(email, name, roleLabel, breakdown),
      notifySlack(
        [
          `*New calculator lead*`,
          `${name || "(no name)"} · ${email}`,
          `${roleLabel} · ${formatGBP(salary)} salary · true cost ${formatGBP(breakdown.total)}`,
        ].join("\n"),
      ).catch(() => {}),
      consent
        ? addToNurture({
            email,
            firstName: name.split(" ")[0] || undefined,
            lastName: name.split(" ").slice(1).join(" ") || undefined,
          }).catch((e) => console.error("[calculator] nurture add failed:", e))
        : Promise.resolve(),
    ]);
  });

  return Response.json({ ok: true });
}

async function sendReport(
  email: string,
  name: string,
  roleLabel: string,
  breakdown: ReturnType<typeof calculateHireCost>,
) {
  const resend = getResend();
  if (!resend) return;
  try {
    const report = calculatorReportEmail({
      firstName: name.split(" ")[0] || undefined,
      roleLabel,
      breakdown,
    });
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: report.subject,
      html: report.html,
      text: report.text,
    });
  } catch (e) {
    console.error("[calculator] report email failed:", e);
  }
}
