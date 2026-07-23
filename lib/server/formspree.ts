import "server-only";

/**
 * Formspree forwarding — the funnel's always-on lead store. Endpoints:
 * "intake" for /start, "brandScore" for brand audit / quiz, "newsletter" for
 * /subscribe (override with FORMSPREE_NEWSLETTER_ENDPOINT). Submissions are
 * forwarded server-side so they're captured even when Supabase isn't configured.
 */
const ENDPOINTS = {
  intake: "https://formspree.io/f/xwvgokob",
  brandScore: "https://formspree.io/f/xrenqgql",
  newsletter:
    process.env.FORMSPREE_NEWSLETTER_ENDPOINT ??
    "https://formspree.io/f/PLACEHOLDER",
  // Contact-page messages ride the always-on intake endpoint unless a
  // dedicated form is configured.
  contact:
    process.env.FORMSPREE_CONTACT_ENDPOINT ?? "https://formspree.io/f/xwvgokob",
} as const;

export type FormspreeForm = keyof typeof ENDPOINTS;

/** POST a submission to Formspree. Returns true on success, never throws. */
export async function sendToFormspree(
  form: FormspreeForm,
  fields: Record<string, unknown>,
): Promise<boolean> {
  const endpoint = ENDPOINTS[form];
  if (form === "newsletter" && endpoint.includes("PLACEHOLDER")) {
    console.error(
      "[formspree] FORMSPREE_NEWSLETTER_ENDPOINT is not set — newsletter submissions disabled",
    );
    return false;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(fields),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[formspree] ${form} submission failed (${res.status}):`, detail);
    }
    return res.ok;
  } catch (e) {
    console.error(`[formspree] ${form} submission errored:`, e);
    return false;
  }
}
