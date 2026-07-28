import "server-only";

/**
 * GoHighLevel inbound webhooks — optional second sink alongside Formspree.
 * "newsletter" uses GHL_NEWSLETTER_WEBHOOK_URL; "contact" uses
 * GHL_CONTACT_WEBHOOK_URL, falling back to the newsletter URL so a single
 * GHL workflow can route by tags. "brandScore" fires when a lead completes
 * the Brand Score quiz (Workflow 1: tag + internal review notification);
 * "brandScoreDoc" fires when the finished PDF is published (Workflow 2:
 * delivery email with the download button). Failures are logged, never
 * thrown.
 */
export type GhlWebhook =
  | "newsletter"
  | "contact"
  | "lead"
  | "brandScore"
  | "brandScoreDoc";

function webhookUrl(webhook: GhlWebhook): string | undefined {
  switch (webhook) {
    case "contact":
      return (
        process.env.GHL_CONTACT_WEBHOOK_URL ??
        process.env.GHL_NEWSLETTER_WEBHOOK_URL
      );
    // The /start qualification form — the primary paid conversion. Falls back
    // to the contact webhook so a single GHL workflow can route on `tags`.
    case "lead":
      return (
        process.env.GHL_LEAD_WEBHOOK_URL ??
        process.env.GHL_CONTACT_WEBHOOK_URL ??
        process.env.GHL_NEWSLETTER_WEBHOOK_URL
      );
    case "brandScore":
      return process.env.GHL_BRANDSCORE_WEBHOOK_URL;
    case "brandScoreDoc":
      return process.env.GHL_BRANDSCORE_DOC_WEBHOOK_URL;
    default:
      return process.env.GHL_NEWSLETTER_WEBHOOK_URL;
  }
}

/**
 * Attribution fields worth putting on a GHL contact.
 *
 * `getLeadTrackingFields()` produces ~40 keys; sending all of them buries the
 * useful ones in custom-field noise and risks GHL's payload limits. These are
 * the ones that answer "which ad produced this booked call?" — first-touch
 * (who paid for the lead) plus the last-touch campaign and the platform click
 * IDs. Everything else stays in Supabase, which already has the full record.
 */
const GHL_ATTRIBUTION_KEYS = [
  "first_utm_source", "first_utm_medium", "first_utm_campaign",
  "first_utm_content", "first_utm_term", "first_utm_id",
  "first_fbclid", "first_gclid", "first_msclkid", "first_ttclid", "first_li_fat_id",
  "first_ad_id", "first_adset_id", "first_campaign_id",
  "first_ad_name", "first_adset_name", "first_campaign_name",
  "first_referrer", "first_landing_path", "first_seen_at",
  "last_utm_source", "last_utm_medium", "last_utm_campaign",
  "last_ad_id", "last_campaign_id",
  "submit_path", "visitor_id",
] as const;

/**
 * Pick the attribution fields GHL should receive from a full tracking-fields
 * map. Values are truncated defensively — this data originates in a URL the
 * visitor controls.
 */
export function ghlAttribution(
  attribution: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!attribution) return {};
  const out: Record<string, string> = {};
  for (const key of GHL_ATTRIBUTION_KEYS) {
    const v = attribution[key];
    if (typeof v === "string" && v.trim()) out[key] = v.slice(0, 500);
  }
  return out;
}

/**
 * Read an `attribution` object off an untrusted request body. Every value here
 * originates in a URL the visitor controls, so keys and values are both
 * length-capped and non-strings are dropped.
 */
export function parseAttribution(raw: unknown): Record<string, string> | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && Object.keys(out).length < 60) {
      out[k.slice(0, 64)] = v.slice(0, 500);
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export async function sendToGhlWebhook(
  webhook: GhlWebhook,
  fields: Record<string, unknown>,
): Promise<boolean> {
  const url = webhookUrl(webhook);
  if (!url) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[ghl] ${webhook} webhook failed (${res.status}):`, detail);
    }
    return res.ok;
  } catch (e) {
    console.error(`[ghl] ${webhook} webhook errored:`, e);
    return false;
  }
}
