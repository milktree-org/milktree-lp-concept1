/**
 * Sitewide currency localisation. Visitors see prices in their local currency
 * based on the Vercel geo header (`x-vercel-ip-country`), resolved once in
 * `proxy.ts` and persisted in a cookie.
 *
 * These are marketing price points, NOT live FX conversions — each currency
 * gets clean charm pricing pegged roughly to the GBP rate. Adjust the numbers
 * here and every surface (product pages, pricing table, anchors, FAQ,
 * schema.org offers, emails) updates together. GBP is the billing currency
 * and the source of truth; the offer ladder itself lives in lib/offer.ts.
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
  /** Currency symbol or code prefix used by `formatAmount`, e.g. "£" or "AED ". */
  symbol: string;
  /**
   * The offer ladder (MILKTREE-STUDIO.md §2) as numbers, so schema.org and
   * any arithmetic read the same figures the cards display. Non-GBP values
   * are marketing pegs, not FX conversions.
   */
  amounts: {
    sprint: number;
    build: number;
    buildPlus: number;
    essentials: number;
    designLead: number;
  };
  /** Display strings derived from `amounts`, e.g. "£1,499". */
  sprint: string;
  build: string;
  buildPlus: string;
  essentialsMonthly: string;
  designLeadMonthly: string;
  /** Design Lead annualised, for the value anchor, e.g. "£30k". */
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
    symbol: "£",
    amounts: { sprint: 799, build: 3499, buildPlus: 5999, essentials: 1499, designLead: 2499 },
    sprint: "£799",
    build: "£3,499",
    buildPlus: "£5,999",
    essentialsMonthly: "£1,499",
    designLeadMonthly: "£2,499",
    designLeadAnnual: "£30k",
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
    symbol: "$",
    amounts: { sprint: 999, build: 4499, buildPlus: 7499, essentials: 1899, designLead: 3199 },
    sprint: "$999",
    build: "$4,499",
    buildPlus: "$7,499",
    essentialsMonthly: "$1,899",
    designLeadMonthly: "$3,199",
    designLeadAnnual: "$38k",
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
    symbol: "€",
    amounts: { sprint: 899, build: 3999, buildPlus: 6999, essentials: 1699, designLead: 2899 },
    sprint: "€899",
    build: "€3,999",
    buildPlus: "€6,999",
    essentialsMonthly: "€1,699",
    designLeadMonthly: "€2,899",
    designLeadAnnual: "€35k",
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
    symbol: "AED ",
    amounts: { sprint: 3699, build: 15999, buildPlus: 27999, essentials: 6999, designLead: 11499 },
    sprint: "AED 3,699",
    build: "AED 15,999",
    buildPlus: "AED 27,999",
    essentialsMonthly: "AED 6,999",
    designLeadMonthly: "AED 11,499",
    designLeadAnnual: "AED 138k",
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
