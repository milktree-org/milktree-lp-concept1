"use client";

import { useEffect, useState } from "react";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";

function readCurrencyCookie(): CurrencyCode {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${CURRENCY_COOKIE}=([A-Za-z]{3})`),
  );
  const value = match?.[1]?.toUpperCase() ?? "";
  return isCurrencyCode(value) ? value : DEFAULT_CURRENCY;
}

/**
 * The visitor's display currency, set by `proxy.ts` from Vercel geo.
 * Server-rendered HTML always shows GBP; the real currency applies after
 * hydration, which keeps every page fully static and cache-friendly.
 */
export function useCurrency(): CurrencyCode {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  useEffect(() => {
    setCurrency(readCurrencyCookie());
  }, []);
  return currency;
}
