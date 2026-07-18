import "server-only";

/**
 * Formspree forwarding — the funnel's always-on lead store. Two endpoints:
 * "intake" for the /start qualification form, "brandScore" for the brand
 * audit / brand quiz lead magnets. Submissions are forwarded server-side so
 * they're captured even when Supabase isn't configured.
 */
const ENDPOINTS = {
  intake: "https://formspree.io/f/xwvgokob",
  brandScore: "https://formspree.io/f/xrenqgql",
} as const;

export type FormspreeForm = keyof typeof ENDPOINTS;

/** POST a submission to Formspree. Returns true on success, never throws. */
export async function sendToFormspree(
  form: FormspreeForm,
  fields: Record<string, unknown>,
): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINTS[form], {
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
