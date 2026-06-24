/**
 * Global window augmentations for third-party analytics + booking scripts.
 *
 *   - Meta Pixel:   `window.fbq` / `window._fbq`
 *   - GA4:          `window.gtag` / `window.dataLayer`
 *   - Microsoft Clarity: `window.clarity`
 *   - Cal.com embed:`window.Cal` (+ namespaced `Cal.ns`)
 *   - CAPI dedup:   `window.__MT_INIT_PV_ID` — the initial PageView event_id set
 *                   by the Pixel base snippet so the server-side CAPI PageView
 *                   can reuse it for deduplication.
 */

export {};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Cal?: any;
    __MT_INIT_PV_ID?: string;
  }
}
