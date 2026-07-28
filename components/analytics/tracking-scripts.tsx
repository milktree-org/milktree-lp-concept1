import Script from "next/script";
import { ClarityScript } from "./clarity-script";

/**
 * Third-party analytics loaders — Meta Pixel, GA4, Microsoft Clarity.
 *
 * Everything here is consent-aware (see lib/analytics/consent.ts):
 *   - GA4 gets Consent Mode v2 defaults of `denied` pushed to dataLayer BEFORE
 *     the `config` command. Google then runs cookieless and still models
 *     conversions, so a decline costs far less measurement than blocking it.
 *   - The Pixel gets `fbq('consent','revoke')` between the base stub and
 *     `init`, so it writes no cookies and holds events until consent is given.
 *   - Clarity is not loaded at all without consent — it has no useful
 *     cookieless mode and session replay is the highest-risk recorder here.
 *
 * PageView is fired from `RouteAnalytics` (Pixel + CAPI with a shared event_id
 * for deduplication), so GA is configured with `send_page_view:false` and the
 * Pixel base does not fire PageView itself.
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
      {/* Meta Pixel — base + init only; PageView is fired from RouteAnalytics.
          `consent revoke` sits between the stub and init so no cookie is
          written before a choice; ConsentBanner calls grant on acceptance. */}
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('consent', 'revoke');
        fbq('init', '${PIXEL_ID}');`}
      </Script>

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
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500
        });
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>

      {/* Microsoft Clarity — client-gated, only mounts once consent is granted. */}
      <ClarityScript projectId={CLARITY_ID} />
    </>
  );
}
