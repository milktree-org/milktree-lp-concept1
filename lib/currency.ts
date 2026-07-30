/**
 * Sitewide currency localisation. Visitors see prices in their local currency
 * based on the Vercel geo header (`x-vercel-ip-country`), resolved once in
 * `proxy.ts` and persisted in a cookie.
 *
 * These are marketing price points, NOT live FX conversions — each currency
 * gets clean charm pricing pegged roughly to the GBP rate. Adjust the numbers
 * here and every surface (plan cards, banners, anchors, comparison table,
 * FAQ) updates together.
 */

export const CURRENCY_COOKIE = "mt_currency";

export const CURRENCY_CODES = ["GBP", "USD", "EUR", "AED"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "GBP";

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value);
}

export type CurrencyPricing = {
  code: CurrencyCode;
  /** Monthly plan prices as display strings, e.g. "£1,999". */
  essentialsMonthly: string;
  designLeadMonthly: string;
  /** Founding-rate monthly price locked for the first 10 Design Lead clients. */
  foundingMonthly: string;
  /** Design Lead annualised, for the value anchor, e.g. "£48k". */
  designLeadAnnual: string;
  /** What a design-lead hire costs locally, e.g. "£65k+ a year in the UK". */
  hireAnchor: string;
  /** The employment overheads named in the value anchor, region-appropriate. */
  hireOverheads: string;
  /** Generic hire figure for the problem card / comparison row, e.g. "£50k+". */
  hireCost: string;
  /** Price range of budget design subscriptions, e.g. "£500–950". */
  cheapSubs: string;
  /** Suffix shown beside the plan price. Empty when UK VAT doesn't apply. */
  taxSuffix: string;
  /** The small print under the plan cards. */
  vatNote: string;
  /** Sentence fragment for the "Is Milktree a UK agency?" FAQ answer. */
  faqPricesLine: string;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyPricing> = {
  GBP: {
    code: "GBP",
    essentialsMonthly: "£1,999",
    designLeadMonthly: "£3,999",
    foundingMonthly: "£3,500",
    designLeadAnnual: "£48k",
    hireAnchor: "£65k+ a year in the UK",
    hireOverheads: "before National Insurance, holiday cover and recruitment",
    hireCost: "£50k+",
    cheapSubs: "£500–950",
    taxSuffix: "+VAT",
    vatNote: "All prices exclude VAT.",
    faqPricesLine: "Prices are in GBP",
  },
  USD: {
    code: "USD",
    essentialsMonthly: "$2,499",
    designLeadMonthly: "$4,999",
    foundingMonthly: "$4,399",
    designLeadAnnual: "$60k",
    hireAnchor: "$120k+ a year in the US",
    hireOverheads: "before payroll taxes, benefits and recruitment",
    hireCost: "$80k+",
    cheapSubs: "$500–1,000",
    taxSuffix: "",
    vatNote: "Prices exclude any applicable taxes.",
    faqPricesLine: "Prices are shown in USD",
  },
  EUR: {
    code: "EUR",
    essentialsMonthly: "€2,299",
    designLeadMonthly: "€4,699",
    foundingMonthly: "€4,099",
    designLeadAnnual: "€56k",
    hireAnchor: "€80k+ a year",
    hireOverheads: "before employer taxes, holiday cover and recruitment",
    hireCost: "€60k+",
    cheapSubs: "€500–950",
    taxSuffix: "",
    vatNote: "Prices exclude any applicable taxes.",
    faqPricesLine: "Prices are shown in EUR",
  },
  AED: {
    code: "AED",
    essentialsMonthly: "AED 8,999",
    designLeadMonthly: "AED 17,999",
    foundingMonthly: "AED 15,999",
    designLeadAnnual: "AED 216k",
    hireAnchor: "AED 350k+ a year in Dubai",
    hireOverheads: "before visas, benefits and recruitment",
    hireCost: "AED 300k+",
    cheapSubs: "AED 2,000–3,500",
    taxSuffix: "",
    vatNote: "Prices exclude any applicable taxes.",
    faqPricesLine: "Prices are shown in AED",
  },
};

/** ISO 3166-1 alpha-2 codes of countries whose home currency is the euro. */
const EUROZONE = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

/**
 * Country → display currency. Everything unmapped falls back to GBP (the
 * billing currency of a UK agency), so crawlers and unknown regions see the
 * same prices the business actually charges.
 */
export function currencyForCountry(country: string | null | undefined): CurrencyCode {
  const c = (country ?? "").toUpperCase();
  if (c === "US") return "USD";
  if (c === "AE") return "AED";
  if (EUROZONE.has(c)) return "EUR";
  return "GBP";
}
