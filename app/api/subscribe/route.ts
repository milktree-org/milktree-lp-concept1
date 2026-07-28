import { sendToFormspree } from "@/lib/server/formspree";
import { sendToGhlWebhook, ghlAttribution, parseAttribution } from "@/lib/server/ghl";
import { rateLimit, requestIp } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeBody = {
  name?: unknown;
  email?: unknown;
};

/**
 * POST /api/subscribe — newsletter opt-in (name + email).
 *
 * Persists to Formspree (FORMSPREE_NEWSLETTER_ENDPOINT) and, when configured,
 * also POSTs to a GoHighLevel inbound webhook (GHL_NEWSLETTER_WEBHOOK_URL).
 * Succeeds if either sink accepts the lead.
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`subscribe:${requestIp(request)}`, 12, 600);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (name.length < 2) {
    return Response.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const firstName = name.split(/\s+/)[0] ?? name;
  const lastName = name.split(/\s+/).slice(1).join(" ");

  const [formspreeStored, ghlStored] = await Promise.all([
    sendToFormspree("newsletter", {
      _subject: `Newsletter subscribe — ${name}`,
      form: "newsletter",
      name,
      email,
      firstName,
      lastName,
      source: "website-subscribe",
    }),
    sendToGhlWebhook("newsletter", {
      name,
      email,
      firstName,
      lastName,
      first_name: firstName,
      last_name: lastName,
      source: "website-subscribe",
      tags: ["newsletter", "website-subscribe"],
      ...ghlAttribution(parseAttribution((body as {attribution?: unknown}).attribution)),
    }),
  ]);

  if (!formspreeStored && !ghlStored) {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
