"use client";

import { useEffect, useRef } from "react";
import { trackViewContent } from "@/lib/analytics/meta-tracking";

/**
 * Fires a Meta `ViewContent` once when a content page mounts.
 *
 * Case-study pages are the strongest mid-funnel intent signal on the site —
 * someone reading a full project is warmer than someone who bounced off the
 * homepage — but `trackViewContent` previously had zero callers anywhere in the
 * repo. Without this the ViewContent retargeting audience stays empty, so it
 * can't be used until weeks into the campaign.
 *
 * Rendered from a server component (the page) as a tiny client island, so the
 * page itself stays static.
 */
export function ViewContentTracker({
  contentName,
  contentCategory,
  contentId,
}: {
  contentName: string;
  contentCategory?: string;
  contentId?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    // Guard against React Strict Mode's double-invoked effects in dev, which
    // would otherwise report two ViewContents for one page view.
    if (fired.current) return;
    fired.current = true;

    trackViewContent({
      contentName,
      contentCategory,
      contentIds: contentId ? [contentId] : undefined,
    });
  }, [contentName, contentCategory, contentId]);

  return null;
}
