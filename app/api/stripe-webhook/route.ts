import { after } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/server/stripe";
import { getSupabase } from "@/lib/server/supabase";
import { sendToFormspree } from "@/lib/server/formspree";
import { sendToGhlWebhook } from "@/lib/server/ghl";
import { getResend, FROM, REPLY_TO, NOTIFY_TO, notifySlack } from "@/lib/server/resend";
import { productFollowUpEmail } from "@/lib/server/emails";
import { sprintOptions } from "@/lib/offer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/stripe-webhook — `checkout.session.completed` for the sprint
 * (PRD 3.3). Verifies the signature, then treats the paid session exactly
 * like a /start submission that chose "sprint": store the lead, notify the
 * team, send the sprint follow-up (which books the day-one call).
 *
 * Idempotent on the session id: a retried event won't create a second lead.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return Response.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await request.text();
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (e) {
    console.error("[stripe-webhook] signature check failed:", e);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ ok: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return Response.json({ ok: true, ignored: session.payment_status });
  }

  const details = session.customer_details;
  const email = (details?.email ?? "").toLowerCase();
  const name = details?.name ?? "";
  const phone = details?.phone ?? undefined;
  const custom = Object.fromEntries(
    (session.custom_fields ?? []).map((f) => [f.key, f.text?.value ?? f.dropdown?.value ?? ""]),
  );
  const company = custom.company || name || "Unknown";
  const kind = sprintOptions.find((o) => o.id === custom.sprint)?.name ?? "Not chosen yet";
  const amount = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? "gbp").toUpperCase();
  const meta = session.metadata ?? {};

  if (!email) {
    console.error("[stripe-webhook] paid session without an email:", session.id);
    return Response.json({ ok: true, warning: "no email" });
  }

  // Persist first. Both stores in parallel; the webhook only reports failure
  // if both fail so Stripe retries.
  const [formspreeStored, supabaseStored] = await Promise.all([
    sendToFormspree("intake", {
      _subject: `Sprint PAID — ${company}`,
      form: "intake",
      route: "sprint",
      name,
      email,
      phone: phone ?? "",
      company,
      need: "Fix one thing",
      sprint: kind,
      paid: `${currency} ${amount}`,
      stripe_session: session.id,
      source: "stripe-checkout",
      attribution: meta,
    }),
    storeLead({ name, email, phone, company, kind, sessionId: session.id, meta }),
  ]);

  if (!formspreeStored && !supabaseStored) {
    after(() => notifyTeam({ name, email, phone, company, kind, amount, currency }, "ALL STORES FAILED — lead only in this notification"));
    return Response.json({ error: "Could not store lead" }, { status: 500 });
  }

  const firstName = name.split(/\s+/)[0] || "there";
  const lastName = name.split(/\s+/).slice(1).join(" ") || undefined;

  after(async () => {
    await Promise.allSettled([
      notifyTeam({ name, email, phone, company, kind, amount, currency }),
      sendFollowUp(email, firstName),
      sendToGhlWebhook("lead", {
        name,
        email,
        phone: phone ?? "",
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        company,
        route: "sprint",
        product: "sprint",
        need: "Fix one thing",
        sprint: kind,
        paid: amount,
        currency,
        source: "stripe-checkout",
        tags: ["start-form", "start-sprint", "product-sprint", "sprint-paid"],
      }),
    ]);
  });

  return Response.json({ ok: true });
}

async function storeLead(input: {
  name: string;
  email: string;
  phone?: string;
  company: string;
  kind: string;
  sessionId: string;
  meta: Record<string, string>;
}): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    // Idempotency: one lead per Checkout Session.
    const existing = await supabase
      .from("website_leads")
      .select("id")
      .eq("stripe_session_id", input.sessionId)
      .maybeSingle();
    if (existing.data) return true;

    const { error } = await supabase.from("website_leads").insert({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      company: input.company,
      website: null,
      need: "sprint",
      product: "sprint",
      sector: "other",
      timing: "this-month",
      team_size: null,
      route: "sprint",
      consent: false,
      source: "stripe-checkout",
      stripe_session_id: input.sessionId,
      attribution: { ...input.meta, sprint: input.kind },
    });
    if (error) {
      console.error("[stripe-webhook] lead insert failed:", error.message, "— run supabase/migrations/20260909_referrals_and_stripe.sql");
      return false;
    }
    return true;
  } catch (e) {
    console.error("[stripe-webhook] lead insert threw:", e);
    return false;
  }
}

async function sendFollowUp(email: string, firstName: string) {
  const resend = getResend();
  if (!resend) return;
  try {
    const mail = productFollowUpEmail({ firstName, route: "sprint" });
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: email,
      subject: "Paid. Now let's book your day one.",
      html: mail.html,
      text: mail.text,
    });
  } catch (e) {
    console.error("[stripe-webhook] follow-up failed:", e);
  }
}

async function notifyTeam(
  d: { name: string; email: string; phone?: string; company: string; kind: string; amount: number; currency: string },
  warning?: string,
) {
  try {
    const text = [
      warning ? `:rotating_light: ${warning}` : null,
      `*Sprint PAID* — ${d.company} · ${d.currency} ${d.amount}`,
      `${d.name} · ${d.email}${d.phone ? ` · ${d.phone}` : ""}`,
      `Sprint: ${d.kind} · Next: they book the day-one call from the thank-you page`,
    ]
      .filter(Boolean)
      .join("\n");
    const sent = await notifySlack(text).catch(() => false);
    if (!sent) {
      const resend = getResend();
      if (!resend) return;
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `${warning ? "⚠ " : ""}Sprint paid — ${d.company}`,
        text,
      });
    }
  } catch (e) {
    console.error("[stripe-webhook] notify failed:", e);
  }
}
