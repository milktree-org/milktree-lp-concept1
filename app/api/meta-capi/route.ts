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
 *
 * Endpoint: POST /api/meta-capi
 */

const PIXEL_ID = process.env.META_PIXEL_ID || "993503079134900";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const GRAPH_API_VERSION = "v21.0";
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

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

export async function POST(request: Request) {
  // Guard: CAPI access token must be configured. Returns 200 so the client's
  // fire-and-forget call never surfaces an error to the user; the browser Pixel
  // event is the fallback. (Liveness is verified in Events Manager, not here.)
  if (!ACCESS_TOKEN) {
    console.warn("[meta-capi] META_CAPI_ACCESS_TOKEN is not set. Skipping CAPI send.");
    return Response.json({ ok: true, skipped: true, reason: "no_access_token" });
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
  if (ud.country) user_data.country = ud.country as string[];
  if (ud.external_id) user_data.external_id = ud.external_id as string[];

  // Server-side IP (improves Event Match Quality) from the edge headers.
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "";
  if (clientIp) user_data.client_ip_address = clientIp;

  const event = {
    event_name: body.event_name,
    event_time: body.event_time || Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    action_source: body.action_source || "website",
    event_source_url: body.event_source_url || "",
    user_data,
    custom_data: body.custom_data || {},
  };

  try {
    const metaResponse = await fetch(GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event], access_token: ACCESS_TOKEN }),
    });
    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("[meta-capi] Meta API error:", JSON.stringify(metaData));
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
