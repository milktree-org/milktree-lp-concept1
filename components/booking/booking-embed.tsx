"use client";

import { useEffect, useRef } from "react";
import { CAL_URL } from "@/lib/site";
import { trackLead, trackSchedule } from "@/lib/analytics/meta-tracking";
import { getCalcomTrackingMetadata } from "@/lib/analytics/lead-tracking";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9GHX9JVN9S";
const CAL_NAMESPACE = "brand-audit";
// Cal.com embeds want the bare "<user>/<event>" slug, not the full URL.
const CAL_LINK = CAL_URL.replace(/^https?:\/\/(app\.)?cal\.com\//, "");

/**
 * Inline Cal.com booking embed (dark, brand-yellow) for the free brand audit.
 *
 * On a completed booking it fires the conversion events that the whole funnel
 * exists for — Meta `Lead` + `Schedule` (Pixel + CAPI, deduplicated) and a GA4
 * `generate_lead` — carrying first/last-touch ad attribution as Cal metadata so
 * the booking can be tied back to the ad that produced it.
 */
export function BookingEmbed() {
  const initialised = useRef(false);
  const booked = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    (function (C: any, A: string, L: string) {
      const p = (a: any, ar: any) => a.q.push(ar);
      const d = C.document;
      C.Cal =
        C.Cal ||
        function (...args: any[]) {
          const cal: any = C.Cal;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (args[0] === L) {
            const api: any = function (...inner: any[]) {
              p(api, inner);
            };
            const ns = args[1];
            api.q = api.q || [];
            if (typeof ns === "string") {
              cal.ns[ns] = cal.ns[ns] || api;
              p(cal.ns[ns], args);
              p(cal, ["initNamespace", ns]);
            } else {
              p(cal, args);
            }
            return;
          }
          p(cal, args);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = window.Cal;
    const trackingMetadata = getCalcomTrackingMetadata();

    Cal("init", CAL_NAMESPACE, { origin: "https://cal.com" });
    Cal.ns[CAL_NAMESPACE]("inline", {
      elementOrSelector: "#brand-audit-cal",
      config: {
        layout: "month_view",
        theme: "dark",
        metadata: { source: "Website — /book", ...trackingMetadata },
      },
      calLink: CAL_LINK,
    });
    Cal.ns[CAL_NAMESPACE]("ui", {
      hideEventTypeDetails: false,
      layout: "month_view",
      cssVarsPerTheme: { dark: { "cal-brand": "#FFDC04" } },
    });
    Cal.ns[CAL_NAMESPACE]("on", {
      action: "bookingSuccessful",
      callback: () => {
        if (booked.current) return; // guard double-fire
        booked.current = true;

        if (typeof window.gtag === "function") {
          window.gtag("event", "generate_lead", {
            event_category: "Brand Audit",
            event_label: "Website — Cal.com Booking",
            value: 150,
            currency: "GBP",
            send_to: GA_ID,
          });
        }
        trackLead({ eventSource: "Website — /book Booking" });
        trackSchedule({ eventSource: "Website — Cal.com Booking" });
      },
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, []);

  return (
    <div
      id="brand-audit-cal"
      aria-label="Brand audit booking calendar"
      className="min-h-[clamp(680px,90vh,900px)] w-full"
    />
  );
}
