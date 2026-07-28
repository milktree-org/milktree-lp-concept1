/**
 * Route Handler — Meta Conversions API (CAPI)
 *
 * Receives events from the client-side tracking utility (`lib/analytics/meta-tracking.ts`)
 * and forwards them to Meta's Conversions API for server-side event tracking.
 * Shares an `event_id` with the browser Pixel event so Meta deduplicates.
 *
 * Environment variables:
 *   META_CAPI_ACCESS_TOKEN  — System-User token from Events Manager → Settings (required to send)
 *   META_PIXEL_ID           — Meta Pixel / dataset ID (defaults to the Milktree pixel)
 *   META_TEST_EVENT_CODE    — optional; routes events to Events Manager → Test Events for QA
 *   META_GRAPH_API_VERSION  — optional; override without a redeploy when a version sunsets
 *
 * Endpoints:
 *   POST /api/meta-capi   — forward one event
 *   GET  /api/meta-capi   — health check: is the token configured? (no secrets returned)
 */

import { rateLimit } from "@/lib/server/supabase";
import { notifySlack } from "@/lib/server/resend";

/**
 * Alert the team, at most once an hour per kind.
 *
 * A broken CAPI is silent by design — the client fire-and-forgets and the
 * browser Pixel keeps working — so without this the first sign of an expired
 * token is a gap in Events Manager noticed days into spend. Throttled through
 * the existing rate limiter so a sustained outage can't spam the channel.
 * `rateLimit` fails open when Supabase is unconfigured, which for an alert is
 * the right direction: better a noisy channel than a silent failure.
 */
async function alertOnce(kind: string, message: string): Promise<void> {
  try {
    const first = await rateLimit(`capi-alert:${kind}`, 1, 3600);
    if (first) await notifySlack(`⚠️ ${message}`);
  } catch {
    // Alerting must never take the request down with it.
  }
}

const PIXEL_ID = process.env.META_PIXEL_ID || "993503079134900";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || "";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

// Only production writes to the live dataset. Mirrors the client-side gate in
// components/analytics/tracking-scripts.tsx — gating the scripts alone is not
// enough, because the CAPI POST is a same-origin fetch that would still fire.
const TRACKING_ENABLED = process.env.VERCEL_ENV === "production";

/**
 * Events this endpoint is allowed to forward. Without it, `/api/meta-capi` is a
 * public, unauthenticated relay into a conversion dataset that cannot be purged
 * — anyone could POST fake £150 `Lead` events and poison campaign optimisation.
 * Keep in sync with the event names actually fired in components/.
 */
const ALLOWED_EVENTS = new Set([
  // Meta standard events
  "PageView",
  "ViewContent",
  "Contact",
  "Lead",
  "Schedule",
  "CompleteRegistration",
  // Custom events fired by the funnels
  "QualificationFormStart",
  "QualificationFormQualified",
  "QualificationFormUnqualified",
  "HireCalculatorStart",
  "HireCalculatorLead",
  "BrandAuditStart",
  "BrandAuditComplete",
  "BrandQuizStart",
  "BrandQuizComplete",
  "CareersFormStart",
  "CareersFormSubmit",
  "ContactFormSubmit",
  "NewsletterSubscribe",
  "BookingViewed",
]);

// Reads per-request headers (client IP); must run dynamically on Node, never cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CapiUserData = {
  fbp?: string;
  fbc?: string;
  client_user_agent?: string;
  em?: string[];
  ph?: string[];
  fn?: string[];
  ln?: string[];
  country?: string[];
  external_id?: string[];
  client_ip_address?: string;
};

/** SHA-256 hex, for the country code we derive server-side. */
async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Health check for pre-launch QA. Returns booleans and public values only —
 * never any part of the token. Without this, a missing token is invisible:
 * the POST path returns 200 either way.
 */
export async function GET() {
  return Response.json({
    configured: Boolean(ACCESS_TOKEN),
    pixel: PIXEL_ID,
    env: process.env.VERCEL_ENV ?? null,
    tracking_enabled: TRACKING_ENABLED,
    graph_api_version: GRAPH_API_VERSION,
    test_mode: Boolean(TEST_EVENT_CODE),
  });
}

export async function POST(request: Request) {
  // Non-production (preview / local) never reaches the live dataset.
  if (!TRACKING_ENABLED) {
    return Response.json({ ok: true, skipped: true, reason: "non_production" });
  }

  // Server-side IP (improves Event Match Quality) from the edge headers.
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";

  // Cheap abuse ceiling on a public endpoint. Fails open when Supabase is
  // unconfigured — the allowlist below is the control that always applies.
  if (clientIp) {
    const ok = await rateLimit(`capi:${clientIp}`, 120, 60);
    if (!ok) return Response.json({ ok: true, skipped: true, reason: "rate_limited" });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.event_name || !body?.event_id) {
    return Response.json({ error: "Missing event_name or event_id" }, { status: 400 });
  }

  const eventName = String(body.event_name);
  if (!ALLOWED_EVENTS.has(eventName)) {
    console.warn(`[meta-capi] Rejected unknown event_name: ${eventName}`);
    return Response.json({ error: "Unsupported event_name" }, { status: 400 });
  }

  // Token check comes AFTER validation so a bad request is rejected the same way
  // whether or not the token happens to be configured. Returns 200 so the
  // client's fire-and-forget call never surfaces an error; the browser Pixel is
  // the fallback. Logged as an error because this failure is otherwise
  // indistinguishable from success all the way through to Events Manager.
  if (!ACCESS_TOKEN) {
    console.error(
      "[meta-capi] META_CAPI_ACCESS_TOKEN is not set — ALL server-side events are being dropped.",
    );
    await alertOnce(
      "no_token",
      "Meta CAPI: META_CAPI_ACCESS_TOKEN is not set in production. Every server-side conversion is being dropped.",
    );
    return Response.json({ ok: true, skipped: true, reason: "no_access_token" });
  }

  // Map user data (PII fields are already SHA-256 hashed on the client).
  const ud = (body.user_data || {}) as Record<string, unknown>;
  const user_data: CapiUserData = {};
  if (ud.fbp) user_data.fbp = ud.fbp as string;
  if (ud.fbc) user_data.fbc = ud.fbc as string;
  if (ud.client_user_agent) user_data.client_user_agent = ud.client_user_agent as string;
  if (ud.em) user_data.em = ud.em as string[];
  if (ud.ph) user_data.ph = ud.ph as string[];
  if (ud.fn) user_data.fn = ud.fn as string[];
  if (ud.ln) user_data.ln = ud.ln as string[];
  if (ud.external_id) user_data.external_id = ud.external_id as string[];
  if (clientIp) user_data.client_ip_address = clientIp;

  // Real country from the edge, replacing the old hardcoded sha256('gb') that
  // the client sent for every visitor. A constant matches everyone, so it added
  // no entropy and contradicted client_ip_address for non-GB traffic.
  const country = request.headers.get("x-vercel-ip-country");
  if (country) user_data.country = [await sha256(country)];

  // Clamp client-supplied event_time: Meta rejects events older than 7 days and
  // future timestamps, and this value arrives from an untrusted client.
  const now = Math.floor(Date.now() / 1000);
  const t = Number(body.event_time);
  const event_time = Number.isFinite(t) && t <= now + 60 && t > now - 7 * 86400 ? t : now;

  const event = {
    event_name: eventName,
    event_time,
    event_id: body.event_id,
    action_source: body.action_source || "website",
    event_source_url: body.event_source_url || "",
    user_data,
    custom_data: body.custom_data || {},
  };

  try {
    const payload: Record<string, unknown> = { data: [event], access_token: ACCESS_TOKEN };
    if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

    const metaResponse = await fetch(GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("[meta-capi] Meta API error:", JSON.stringify(metaData));
      await alertOnce(
        "meta_error",
        `Meta CAPI rejected an event (${metaResponse.status}). Likely an expired token or a payload change — conversions are not reaching Meta. ${JSON.stringify(metaData).slice(0, 400)}`,
      );
      return Response.json({ error: "Meta API error", details: metaData }, { status: 502 });
    }

    return Response.json({
      ok: true,
      events_received: metaData.events_received,
      fbtrace_id: metaData.fbtrace_id,
    });
  } catch (err) {
    console.error("[meta-capi] Internal error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
