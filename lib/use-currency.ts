"use client";

import { useSyncExternalStore } from "react";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";

function readCurrencyCookie(): CurrencyCode {
  if (typeof document === "undefined") return DEFAULT_CURRENCY;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CURRENCY_COOKIE}=([A-Za-z]{3})`),
  );
  const value = match?.[1]?.toUpperCase() ?? "";
  return isCurrencyCode(value) ? value : DEFAULT_CURRENCY;
}

// The cookie is written once by proxy.ts before the page loads and never
// changes during a session, so there is nothing to subscribe to.
const subscribe = () => () => {};
const getServerSnapshot = () => DEFAULT_CURRENCY;

/**
 * The visitor's display currency, set by `proxy.ts` from Vercel geo.
 * Server-rendered HTML always shows GBP; the real currency applies after
 * hydration, which keeps every page fully static and cache-friendly.
 */
export function useCurrency(): CurrencyCode {
  return useSyncExternalStore(subscribe, readCurrencyCookie, getServerSnapshot);
}
