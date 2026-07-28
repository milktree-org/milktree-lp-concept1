/**
 * Route Handler — Cal.com booking webhook → Meta Conversions API
 *
 * WHY THIS EXISTS
 * Until now the only signal that a call had been booked was a client-side
 * callback inside the Cal.com embed (`bookingSuccessful` in
 * components/booking/booking-embed.tsx). That callback does not run when:
 *   - the visitor completes the booking from the Cal confirmation email,
 *   - the event type is configured with a "redirect on booking" URL,
 *   - an ad blocker or a Cal embed update breaks the handler,
 *   - the tab is closed before the callback fires.
 * In every one of those cases the calendar fills up while Meta and GA4 record
 * zero conversions — the exact failure mode behind the previous 0-lead month.
 *
 * This webhook is the server-side source of truth. It fires the same Lead and
 * Schedule events with `event_id` derived from the Cal booking uid, so Meta
 * deduplicates against the browser copy rather than double-counting.
 *
 * Environment variables:
 *   CAL_WEBHOOK_SECRET      — the signing secret configured on the Cal.com webhook (required)
 *   META_CAPI_ACCESS_TOKEN  — system-user token (shared with /api/meta-capi)
 *   META_PIXEL_ID           — Meta Pixel / dataset ID
 *
 * Cal.com setup: Settings → Developer → Webhooks → subscribe to BOOKING_CREATED,
 * point it at https://www.milktreeagency.com/api/cal-webhook, set the secret.
 */

import crypto from "node:crypto";

const PIXEL_ID = process.env.META_PIXEL_ID || "993503079134900";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";
const WEBHOOK_SECRET = process.env.CAL_WEBHOOK_SECRET || "";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

const TRACKING_ENABLED = process.env.VERCEL_ENV === "production";

// Keep aligned with LEAD_VALUE / LEAD_CURRENCY in lib/analytics/meta-tracking.ts
// so browser and server copies of the same booking report the same number.
const LEAD_VALUE = 150;
const LEAD_CURRENCY = "GBP";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** Digits-only E.164 without the `+`. Mirrors normalizePhone in meta-tracking.ts
 *  so the browser and server hashes of the same number agree. */
function normalizePhone(raw: string): string | undefined {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  return digits.length >= 7 ? digits : undefined;
}

function normalizeName(raw: string): string | undefined {
  const v = raw.trim().toLowerCase().replace(/[.,'"()]/g, "");
  return v || undefined;
}

/** Constant-time compare of the Cal signature against our own HMAC. */
function verifySignature(rawBody: string, header: string | null): boolean {
  if (!WEBHOOK_SECRET || !header) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header.trim().toLowerCase(), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type CalAttendee = { email?: string; name?: string; phoneNumber?: string };

export async function POST(request: Request) {
  // Read the raw body first — the signature is over the exact bytes Cal sent,
  // so re-serialising parsed JSON would break verification.
  const rawBody = await request.text();

  if (!WEBHOOK_SECRET) {
    console.error("[cal-webhook] CAL_WEBHOOK_SECRET is not set — rejecting.");
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature =
    request.headers.get("x-cal-signature-256") ?? request.headers.get("X-Cal-Signature-256");
  if (!verifySignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trigger = String(body.triggerEvent ?? "");
  if (trigger !== "BOOKING_CREATED") {
    // Acknowledge so Cal doesn't retry events we deliberately ignore.
    return Response.json({ ok: true, ignored: trigger });
  }

  const payload = (body.payload ?? {}) as Record<string, unknown>;
  const uid = String(payload.uid ?? "");
  if (!uid) return Response.json({ error: "Missing booking uid" }, { status: 400 });

  if (!TRACKING_ENABLED || !ACCESS_TOKEN) {
    return Response.json({ ok: true, skipped: true, reason: !ACCESS_TOKEN ? "no_token" : "non_production" });
  }

  const attendee = (Array.isArray(payload.attendees) ? payload.attendees[0] : {}) as CalAttendee;
  const metadata = (payload.metadata ?? {}) as Record<string, string>;

  const user_data: Record<string, unknown> = {};
  if (attendee.email) user_data.em = [sha256(attendee.email)];
  if (attendee.phoneNumber) {
    const phone = normalizePhone(attendee.phoneNumber);
    if (phone) user_data.ph = [sha256(phone)];
  }
  if (attendee.name) {
    const [first, ...rest] = attendee.name.trim().split(/\s+/).filter(Boolean);
    const fn = first ? normalizeName(first) : undefined;
    const ln = rest.length ? normalizeName(rest.join(" ")) : undefined;
    if (fn) user_data.fn = [fn].map(sha256);
    if (ln) user_data.ln = [ln].map(sha256);
  }

  // Browser cookies carried through as Cal booking metadata by
  // getCalcomTrackingMetadata() — these are what tie the booking to the ad click.
  if (metadata.fbp) user_data.fbp = metadata.fbp;
  if (metadata.fbc) user_data.fbc = metadata.fbc;

  const eventSourceUrl = metadata.last_landing_url || metadata.first_landing_url || "";
  const eventTime = Math.floor(Date.now() / 1000);
  const custom_data = {
    currency: LEAD_CURRENCY,
    value: LEAD_VALUE,
    event_source: "Cal.com Webhook",
  };

  // Same event_id scheme as the browser copy in booking-embed.tsx, so Meta
  // collapses the pair instead of counting the booking twice.
  const events = [
    { name: "Lead", id: `cal-lead-${uid}` },
    { name: "Schedule", id: `cal-schedule-${uid}` },
  ].map((e) => ({
    event_name: e.name,
    event_time: eventTime,
    event_id: e.id,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data,
    custom_data,
  }));

  try {
    const graphPayload: Record<string, unknown> = { data: events, access_token: ACCESS_TOKEN };
    if (TEST_EVENT_CODE) graphPayload.test_event_code = TEST_EVENT_CODE;

    const res = await fetch(GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphPayload),
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("[cal-webhook] Meta API error:", JSON.stringify(data));
      // 200 so Cal doesn't retry-storm on a Meta-side problem; the error is logged.
      return Response.json({ ok: false, error: "Meta API error", details: data });
    }

    return Response.json({ ok: true, uid, events_received: data.events_received });
  } catch (err) {
    console.error("[cal-webhook] Internal error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
