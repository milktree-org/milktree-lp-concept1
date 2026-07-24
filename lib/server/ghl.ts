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
  | "brandScore"
  | "brandScoreDoc";

function webhookUrl(webhook: GhlWebhook): string | undefined {
  switch (webhook) {
    case "contact":
      return (
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
