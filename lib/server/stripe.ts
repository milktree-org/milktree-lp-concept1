import "server-only";

import Stripe from "stripe";

/**
 * Stripe, for the self-serve sprint checkout (docs/PRD.md 3.3).
 *
 * Env:
 *   STRIPE_SECRET_KEY        sk_live_… or sk_test_…  (absent → checkout hidden)
 *   STRIPE_WEBHOOK_SECRET    whsec_… for /api/stripe-webhook
 *   STRIPE_VAT_TAX_RATE_ID   optional txr_… for UK VAT (20%). If unset the
 *                            price is charged ex-VAT and the invoice says so;
 *                            set it, or enable Stripe Tax, before going live.
 */
let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  client = key ? new Stripe(key) : null;
  return client;
}

/** Whether the self-serve sprint checkout should be offered at all. */
export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
