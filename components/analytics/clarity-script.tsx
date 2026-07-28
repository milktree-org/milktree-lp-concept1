"use client";

import Script from "next/script";
import { useConsent } from "@/lib/analytics/use-consent";

/**
 * Microsoft Clarity, mounted only after consent is granted.
 *
 * Unlike GA4 (which has a genuinely useful cookieless Consent Mode) Clarity has
 * no meaningful degraded mode, and it is the highest-risk recorder on the site:
 * it captures the DOM of every page including the funnel forms. So it is simply
 * not loaded until the visitor opts in — and once loaded, `clarity('consent')`
 * confirms the basis to Microsoft.
 *
 * There is no unload path: a script element can't be un-run. Declining after
 * accepting stops it on the next page load, which is the normal behaviour for
 * every CMP.
 */
export function ClarityScript({ projectId }: { projectId: string }) {
  const consent = useConsent();

  if (consent !== "granted") return null;

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      onReady={() => window.clarity?.("consent")}
    >
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}
