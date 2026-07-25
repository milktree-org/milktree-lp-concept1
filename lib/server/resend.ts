import "server-only";

import { Resend } from "resend";

/** Resend client — server-side only. Env: RESEND_API_KEY. */
let client: Resend | null | undefined;

export function getResend(): Resend | null {
  if (client !== undefined) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[resend] RESEND_API_KEY not configured — email disabled");
    client = null;
    return client;
  }
  client = new Resend(key);
  return client;
}

/**
 * Sending identity. Must be on a domain verified in Resend, which is why it's
 * an env var: the verified sender is usually a subdomain (updates.…) rather
 * than the root domain the brand replies from.
 */
export const FROM =
  process.env.RESEND_FROM ?? "Milktree <hello@milktreeagency.com>";
export const NOTIFY_TO = process.env.NOTIFY_EMAIL ?? "hello@milktreeagency.com";

/**
 * Add a contact to the `nurture` audience. Consent-gated by the caller —
 * only call this when the marketing-consent boolean is true (UK PECR).
 * Rich metadata (route, score, sector, source) lives in Supabase; Resend
 * contacts carry name + email.
 */
export async function addToNurture(input: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  const resend = getResend();
  const audienceId = process.env.RESEND_NURTURE_AUDIENCE_ID;
  if (!resend || !audienceId) {
    if (!audienceId)
      console.error("[resend] RESEND_NURTURE_AUDIENCE_ID not configured");
    return;
  }
  await resend.contacts.create({
    audienceId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    unsubscribed: false,
  });
}

/** Post to the team Slack channel if a webhook is configured. */
export async function notifySlack(text: string): Promise<boolean> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.ok;
}
