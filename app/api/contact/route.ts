import { after } from "next/server";
import { sendToFormspree } from "@/lib/server/formspree";
import { getResend, FROM, NOTIFY_TO, notifySlack } from "@/lib/server/resend";
import { rateLimit, requestIp } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
};

/**
 * POST /api/contact — general enquiries from /contact.
 *
 * Persists to Formspree first (contact endpoint, defaults to the always-on
 * intake form), then notifies the team via Slack or Resend in after() so
 * notification failures never lose the message.
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`contact:${requestIp(request)}`, 8, 600);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2) {
    return Response.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (message.length < 10) {
    return Response.json(
      { error: "Tell us a little more — a sentence or two helps." },
      { status: 400 },
    );
  }
  if (message.length > 5000) {
    return Response.json({ error: "Message is too long." }, { status: 400 });
  }

  const stored = await sendToFormspree("contact", {
    _subject: `Contact message — ${name}`,
    form: "contact",
    name,
    email,
    company,
    message,
    source: "website-contact",
  });

  if (!stored) {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  after(() => notifyTeam({ name, email, company, message }));

  return Response.json({ ok: true });
}

async function notifyTeam(details: {
  name: string;
  email: string;
  company: string;
  message: string;
}) {
  try {
    const slackText = [
      `*New contact message* — ${details.name}${details.company ? ` (${details.company})` : ""}`,
      details.email,
      details.message,
    ].join("\n");

    const sentToSlack = await notifySlack(slackText).catch(() => false);
    if (!sentToSlack) {
      const resend = getResend();
      if (!resend) return;
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        replyTo: details.email,
        subject: `Contact message — ${details.name}`,
        text: [
          `Name: ${details.name}`,
          `Email: ${details.email}`,
          details.company ? `Company: ${details.company}` : null,
          "",
          details.message,
        ]
          .filter((l) => l !== null)
          .join("\n"),
      });
    }
  } catch (e) {
    console.error("[contact] team notify failed:", e);
  }
}
