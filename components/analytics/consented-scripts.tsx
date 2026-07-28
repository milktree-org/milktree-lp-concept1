"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useConsent } from "@/lib/analytics/use-consent";
import { isTrackingExcluded } from "@/lib/analytics/excluded-paths";

/**
 * Tags that are not loaded at all until consent is granted.
 *
 * GA4 is deliberately NOT here — Consent Mode v2 lets it run cookieless and
 * still model conversions, which is worth far more than blocking it. These two
 * have no equivalent:
 *
 *   Meta Pixel — `fbq('consent','revoke')` stops events, but fbevents.js still
 *     writes a `_fbc` cookie from the `fbclid` in the URL the moment it loads.
 *     Verified in production: `_fbc` was present before any choice was made.
 *     A cookie written before consent is exactly what PECR prohibits, and no
 *     JS-level consent call prevents it — so the script itself has to wait.
 *
 *   Clarity — records the DOM of every page including the funnel forms, and
 *     has no meaningful cookieless mode.
 *
 * Nothing is lost by deferring the Pixel: with consent revoked it could not
 * send events anyway. Once mounted, the base snippet initialises with consent
 * already granted, so the first PageView from RouteAnalytics fires normally.
 *
 * There is no unload path — a script element can't be un-run. Declining after
 * accepting takes effect on the next page load, which is how every CMP behaves.
 */
export function ConsentedScripts({
  pixelId,
  clarityId,
}: {
  pixelId: string;
  clarityId: string;
}) {
  const consent = useConsent();
  const pathname = usePathname();

  // Internal pages carry a secret in the query string — never load a recorder
  // there (see lib/analytics/excluded-paths.ts).
  if (consent !== "granted" || isTrackingExcluded(pathname)) return null;

  return (
    <>
      {/* Meta Pixel — base + init. PageView is fired from RouteAnalytics with a
          shared event_id so the Pixel and CAPI copies deduplicate. */}
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('consent', 'grant');
        fbq('init', '${pixelId}');`}
      </Script>

      {/* Microsoft Clarity */}
      <Script id="ms-clarity" strategy="afterInteractive" onReady={() => window.clarity?.("consent")}>
        {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");`}
      </Script>
    </>
  );
}
