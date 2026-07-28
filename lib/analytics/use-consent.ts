"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_EVENT, CONSENT_KEY, readConsent, type ConsentState } from "./consent";

/**
 * Consent is an external store (localStorage + a custom event), so it belongs in
 * `useSyncExternalStore` rather than `useState` + `useEffect`. That avoids the
 * cascading render an effect-based sync causes, and gives us a clean way to
 * distinguish "not yet known" from "no choice made":
 *
 *   undefined → hydrating, storage not read yet  → render nothing
 *   null      → read, but no choice made         → show the banner
 *   'granted' / 'denied'                         → act on the choice
 *
 * React uses `getServerSnapshot` for the hydration pass and only then switches
 * to `getSnapshot`, so a returning visitor who already accepted never sees the
 * banner flash on screen.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onChange);
  // `storage` fires only in OTHER tabs — keeps a second tab in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// Returns a primitive, so React's identity check is stable across calls.
const getSnapshot = (): ConsentState | null => readConsent();
const getServerSnapshot = (): undefined => undefined;

export function useConsent(): ConsentState | null | undefined {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
