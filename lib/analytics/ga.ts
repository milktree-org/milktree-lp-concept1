/**
 * GA4 event helper.
 *
 * Until now GA4 measured exactly two things: `page_view`, and one
 * `generate_lead` on a completed Cal.com booking. Every other funnel step —
 * qualification, the lead magnets, the contact and newsletter forms — was
 * Meta-only, so GA4 could show that traffic arrived but nothing about what it
 * did. This puts a GA4 event beside each Meta one.
 *
 * Uses `window.gtag` directly: the site loads gtag.js, not GTM, so
 * `dataLayer.push({event: 'x'})` would do nothing here.
 *
 * Consent is handled by Consent Mode v2 rather than a gate in this function —
 * with `analytics_storage: denied` GA still receives the event as a cookieless
 * ping, which is what makes Google's conversion modelling work. Blocking the
 * call outright would throw that away.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-9GHX9JVN9S';

export function trackGA(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, { ...params, send_to: GA_ID });
}
