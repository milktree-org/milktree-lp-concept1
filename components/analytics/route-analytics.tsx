"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics/meta-tracking";
import { captureLeadTracking } from "@/lib/analytics/lead-tracking";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9GHX9JVN9S";

/**
 * Click IDs that must never reach GA4's page_location. Each one is unique per
 * click, so leaving them in shatters the Landing Page report into one row per
 * ad click and makes the whole report useless mid-campaign. UTMs and Google's
 * own click IDs are kept — GA4 reads those for session source/medium.
 */
const STRIP_PARAMS = ["fbclid", "ttclid", "msclkid", "li_fat_id", "twclid", "epik"];

/**
 * PII / secrets that must never reach GA4 or Meta in a URL. `k` is the
 * DOC_REVIEW_KEY on /brand-score-doc; the rest are legacy funnel hand-off
 * params that now travel in sessionStorage instead (see funnel-handoff.ts).
 */
const REDACT_PARAMS = ["k", "name", "email", "company", "website"];

/** Current href with tracking noise and PII removed, for analytics payloads. */
function cleanPageLocation(): string {
  try {
    const url = new URL(window.location.href);
    for (const p of [...STRIP_PARAMS, ...REDACT_PARAMS]) url.searchParams.delete(p);
    return url.toString();
  } catch {
    return window.location.origin + window.location.pathname;
  }
}

/**
 * Fires a PageView (Meta Pixel + CAPI, shared event_id) and a GA4 page_view on
 * first load and on every client-side route change, and captures marketing
 * attribution (UTMs, click IDs) from the URL so any later Lead/Contact/Schedule
 * event carries the full first- and last-touch context.
 *
 * Mounted once in the root layout. Renders nothing.
 *
 * `enabled` is false outside production. Attribution capture still runs so the
 * funnel behaves identically in dev and preview — only the third-party sends
 * are suppressed, so test traffic never reaches the live campaign dataset.
 */
export function RouteAnalytics({ enabled = true }: { enabled?: boolean }) {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    // Capture attribution every navigation (a UTM/click-id link may land on
    // any route, not just the first). First-touch is written once; last-touch
    // updates each time. Must run before any conversion event.
    captureLeadTracking();

    if (!enabled) return;

    // GA4 page_view (config has send_page_view:false, so we send it manually).
    if (typeof window.gtag === "function") {
      // page_location, not page_path: page_path is a Universal Analytics field
      // that GA4 discards, and with it absent gtag auto-collects the raw href
      // including ?fbclid. Send a cleaned absolute URL instead.
      window.gtag("event", "page_view", {
        page_location: cleanPageLocation(),
        page_title: document.title,
        send_to: GA_ID,
      });
    }

    // Meta Pixel + CAPI PageView (shared event_id → deduplicated).
    trackPageView();

    if (isFirst.current) isFirst.current = false;
  }, [pathname, enabled]);

  return null;
}
