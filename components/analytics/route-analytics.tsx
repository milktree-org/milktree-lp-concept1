"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics/meta-tracking";
import { captureLeadTracking } from "@/lib/analytics/lead-tracking";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9GHX9JVN9S";

/**
 * Fires a PageView (Meta Pixel + CAPI, shared event_id) and a GA4 page_view on
 * first load and on every client-side route change, and captures marketing
 * attribution (UTMs, click IDs) from the URL so any later Lead/Contact/Schedule
 * event carries the full first- and last-touch context.
 *
 * Mounted once in the root layout. Renders nothing.
 */
export function RouteAnalytics() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    // Capture attribution every navigation (a UTM/click-id link may land on
    // any route, not just the first). First-touch is written once; last-touch
    // updates each time. Must run before any conversion event.
    captureLeadTracking();

    // GA4 page_view (config has send_page_view:false, so we send it manually).
    if (typeof window.gtag === "function") {
      // Send pathname only — keep click IDs / UTMs (fbclid etc.) out of GA paths.
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
        send_to: GA_ID,
      });
    }

    // Meta Pixel + CAPI PageView (shared event_id → deduplicated).
    trackPageView();

    if (isFirst.current) isFirst.current = false;
  }, [pathname]);

  return null;
}
