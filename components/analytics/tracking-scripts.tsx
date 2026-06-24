import Script from "next/script";

/**
 * Third-party analytics loaders — Meta Pixel, GA4, Microsoft Clarity.
 *
 * The Pixel base (fbq stub + init) loads `beforeInteractive` so `window.fbq`
 * exists before the React route-analytics effect runs (no load-order race).
 * The initial + every subsequent PageView is fired from `RouteAnalytics`
 * (Pixel + CAPI with a shared event_id for deduplication), so we set
 * `send_page_view:false` on GA and do NOT fire PageView in the Pixel base here.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "993503079134900";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9GHX9JVN9S";
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "n9qw79cpo8";

export function TrackingScripts() {
  return (
    <>
      {/* Meta Pixel — base + init only; PageView is fired from RouteAnalytics.
          afterInteractive keeps connect.facebook.net off the LCP path; fbq's
          queue stub buffers any early calls until the library loads. */}
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');`}
      </Script>

      {/* GA4 — manual page_view (we send it from RouteAnalytics) */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>

      {/* Microsoft Clarity */}
      <Script id="ms-clarity" strategy="afterInteractive">
        {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_ID}");`}
      </Script>
    </>
  );
}
