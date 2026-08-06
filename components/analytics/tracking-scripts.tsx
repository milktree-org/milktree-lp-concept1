import Script from "next/script";
import { ConsentedScripts } from "./consented-scripts";
import { CONSENT_REQUIRED } from "@/lib/analytics/consent";

/**
 * Consent Mode v2 defaults. With the gate off (see CONSENT_REQUIRED) these
 * start granted, so GA4 writes `_ga` and reports real conversions rather than
 * modelled ones from cookieless pings.
 */
const CONSENT_DEFAULT = CONSENT_REQUIRED ? "denied" : "granted";

/**
 * Third-party analytics loaders — Meta Pixel, GA4, Microsoft Clarity.
 *
 * Split by what each vendor can honestly do before consent:
 *
 *   GA4 loads immediately with Consent Mode v2 defaulting every signal to
 *   `denied`. It writes no cookies in that state (verified in production) but
 *   still sends cookieless pings, so Google can model the conversions a
 *   declining visitor would otherwise erase. That modelling is why GA is
 *   treated differently from the other two.
 *
 *   The Meta Pixel and Clarity are not loaded at all until consent — see
 *   ./consented-scripts.tsx for why `fbq('consent','revoke')` is not enough.
 *
 * PageView is fired from `RouteAnalytics` (Pixel + CAPI with a shared event_id
 * for deduplication), so GA is configured with `send_page_view:false`.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "993503079134900";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9GHX9JVN9S";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "n9qw79cpo8";

/**
 * Only production writes to the live Pixel / GA4 property / Clarity project.
 *
 * The IDs above fall back to the real production values when the env vars are
 * unset, and Vercel has NEXT_PUBLIC_* scoped to Preview as well as Production —
 * so without this gate every preview deployment AND every `npm run dev` session
 * fired real PageViews into the dataset the campaign optimises on. `VERCEL_ENV`
 * is undefined locally, which is exactly the behaviour we want.
 */
export const TRACKING_ENABLED = process.env.VERCEL_ENV === "production";

export function TrackingScripts() {
  if (!TRACKING_ENABLED) return null;

  return (
    <>
      {/* GA4 — Consent Mode v2 defaults, then manual page_view.
          The defaults must reach dataLayer before the `config` command; because
          gtag() only pushes to dataLayer, doing both in this one synchronous
          block guarantees the order regardless of when gtag.js finishes
          loading. */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          ad_storage: '${CONSENT_DEFAULT}',
          ad_user_data: '${CONSENT_DEFAULT}',
          ad_personalization: '${CONSENT_DEFAULT}',
          analytics_storage: '${CONSENT_DEFAULT}',
          wait_for_update: 500
        });
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>

      {/* Meta Pixel + Clarity — mounted only once consent is granted. */}
      <ConsentedScripts pixelId={PIXEL_ID} clarityId={CLARITY_ID} />
    </>
  );
}
