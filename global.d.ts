// Global `Window` augmentations for third-party scripts injected at runtime:
//   - Google Analytics: `gtag`, `dataLayer`
//   - Meta Pixel:       `fbq`
//   - Cal.com embed:    `Cal`
//   - Meta CAPI dedup:  `__MT_INIT_PV_ID` (set by the Pixel base code in index.html)
//
// All optional: these are loaded by external <script> tags, so they may be
// absent (script still loading, ad-blocked, SSR). Every call site already
// guards with a `typeof window.x === 'function'` check, so optional is the
// honest type. Declaring these once here avoids the per-file `declare global`
// blocks that previously conflicted (gtag was optional in one file, required
// in others).
export {};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    Cal?: any;
    __MT_INIT_PV_ID?: string;
  }
}
