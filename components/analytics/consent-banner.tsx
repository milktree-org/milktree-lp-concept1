"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import Link from "next/link";
import {
  applyConsent,
  clearTrackingStorage,
  writeConsent,
  type ConsentState,
} from "@/lib/analytics/consent";
import { useConsent } from "@/lib/analytics/use-consent";

/**
 * Compact cookie consent bar.
 *
 * Deliberately NOT a full-screen modal — a corner bar is equally compliant and
 * far less hostile. What ICO actually requires is that rejecting is as easy as
 * accepting, so the two buttons are the same size, weight and prominence. No
 * pre-ticked boxes, no "manage preferences" maze, no yellow on Accept to bias
 * the choice (the brand accent is reserved for the primary CTA elsewhere).
 *
 * Once a choice is made the bar is replaced by a small persistent tab so the
 * decision can be changed later — withdrawal has to be as easy as giving it.
 */
export function ConsentBanner() {
  // undefined = hydrating, null = no choice made yet. See useConsent().
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);
  const reduce = useReducedMotion();

  const barRef = useRef<HTMLElement>(null);

  // Re-assert the stored choice on every load: the inline snippet defaults
  // Consent Mode to denied and revokes the Pixel, so a returning visitor who
  // accepted needs the grant pushed again before any tag acts on it.
  useEffect(() => {
    if (consent === "granted" || consent === "denied") applyConsent(consent);
  }, [consent]);

  // Reserve space for the bar so it never sits ON TOP of page content.
  //
  // It is position:fixed, so without this it overlays whatever is at the bottom
  // of the viewport. On a 375x667 iPhone SE that is the third answer on /start
  // step 1 — the bar covered "Not sure yet" outright, and on the contact step it
  // covered the submit button. Every cold ad click lands on /start as a
  // first-time visitor, so that is precisely the audience that hit it.
  //
  // Padding the body means the page simply scrolls above the bar instead. The
  // height is measured rather than hardcoded because the copy wraps differently
  // across widths, and re-measured on resize / orientation change.
  useEffect(() => {
    const el = barRef.current;
    if (!el) {
      document.body.style.paddingBottom = "";
      return;
    }
    const apply = () => {
      document.body.style.paddingBottom = `${el.offsetHeight + 32}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.body.style.paddingBottom = "";
    };
  });

  const choose = useCallback((state: ConsentState) => {
    if (state === "denied") clearTrackingStorage();
    writeConsent(state);
    setReopened(false);
  }, []);

  // Don't render anything until storage has been read, so an accepted visitor
  // never sees the bar flash on screen.
  if (consent === undefined) return null;

  const showBar = consent === null || reopened;
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <>
      {/* Deliberately no AnimatePresence / exit animation. The exit ran but the
          node was left mounted at opacity 0, where it still intercepted clicks
          along the left edge of the page. A consent bar that vanishes the
          instant you choose is also better feedback than one that fades. */}
      {showBar && (
          <motion.aside
            ref={barRef}
            role="region"
            aria-label="Cookie consent"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.6, ease }}
            className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-[1.5rem] border border-border bg-surface/95 p-5 shadow-2xl backdrop-blur-md sm:right-auto sm:mx-0"
          >
            <p className="text-sm font-medium leading-relaxed text-foreground">
              We use cookies to measure our advertising.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Meta, Google Analytics and Microsoft Clarity help us see which ads
              bring people here. Decline and we&rsquo;ll only keep what the site
              needs to work.{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 transition-colors hover:text-foreground focus-visible:text-foreground"
              >
                Privacy policy
              </Link>
              .
            </p>
            <div className="mt-4 flex gap-2.5">
              {/* Equal visual weight in both directions — that is the compliance
                  requirement, not a stylistic preference. */}
              <button
                type="button"
                onClick={() => choose("granted")}
                className="min-h-11 flex-1 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => choose("denied")}
                className="min-h-11 flex-1 rounded-full border border-border px-4 text-sm font-bold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Decline
              </button>
            </div>
          </motion.aside>
      )}

      {/* Persistent re-open tab. Withdrawing consent must be as easy as giving
          it, so this stays for the life of the session. */}
      {/* Explicit values, not `!== null`: during hydration consent is
          `undefined`, which would otherwise flash this button on screen for
          first-time visitors who have made no choice at all. */}
      {(consent === "granted" || consent === "denied") && !reopened && (
        <button
          type="button"
          onClick={() => setReopened(true)}
          aria-label="Cookie settings"
          title="Cookie settings"
          className="fixed bottom-4 left-4 z-[55] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/90 text-muted-foreground shadow-lg backdrop-blur-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Cookie className="h-[18px] w-[18px]" aria-hidden />
        </button>
      )}
    </>
  );
}
