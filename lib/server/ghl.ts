import "server-only";

/**
 * GoHighLevel inbound webhook — optional second sink for newsletter subs.
 * Set GHL_NEWSLETTER_WEBHOOK_URL to your GHL workflow / inbound webhook URL.
 * Failures are logged and never thrown.
 */
export async function sendToGhlWebhook(
  fields: Record<string, unknown>,
): Promise<boolean> {
  const url = process.env.GHL_NEWSLETTER_WEBHOOK_URL;
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
      console.error(`[ghl] webhook failed (${res.status}):`, detail);
    }
    return res.ok;
  } catch (e) {
    console.error("[ghl] webhook errored:", e);
    return false;
  }
}
