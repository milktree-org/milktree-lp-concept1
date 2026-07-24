import { rateLimit, requestIp } from "@/lib/server/supabase";
import { sendToFormspree } from "@/lib/server/formspree";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/quiz/capture — the earliest lead save in the Brand Score funnel.
 * Fired the moment the first slide (name, job role, email) is completed, so a
 * drop-off before the rest of the form still leaves us a contact in Formspree.
 * Best-effort: it never blocks the user, so it always returns 200.
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`quiz-capture:${requestIp(request)}`, 15, 600);
  if (!allowed) {
    return Response.json({ ok: false }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const str = (v: unknown, max = 200) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const name = str(body.name, 120);
  const jobRole = str(body.jobRole, 120);
  const email = str(body.email);
  const consent = body.consent === true;
  const source = str(body.source, 40) || "direct";

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const stored = await sendToFormspree("brandScore", {
    _subject: `New Brand Score Lead — ${name || email}`,
    form: "brand-quiz-lead",
    name,
    jobRole,
    email,
    consent,
    source,
  });

  return Response.json({ ok: stored });
}
