import "server-only";

import type { SectorValue } from "@/lib/quiz";

/**
 * Sector → key search terms (§5.3). [slot] — replace with the client-supplied
 * mapping table when provided; these defaults are sensible UK buyer queries.
 * `{region}` is replaced with the user's region/postcode area when given,
 * otherwise "UK".
 */
const SECTOR_TERMS: Record<SectorValue, string[]> = {
  construction: ["builders {region}", "construction company {region}"],
  "professional-services": ["accountants {region}", "business consultants {region}"],
  ecommerce: ["{keyword} online store UK", "buy {keyword} UK"],
  "food-drink": ["food brand {region}", "{keyword} {region}"],
  "health-beauty": ["skincare brand UK", "beauty clinic {region}"],
  "fitness-wellness": ["gym {region}", "personal trainer {region}"],
  property: ["estate agents {region}", "property management {region}"],
  finance: ["financial advisers {region}", "mortgage broker {region}"],
  software: ["{keyword} software UK", "best {keyword} platform UK"],
  manufacturing: ["{keyword} manufacturer UK", "manufacturing company {region}"],
  hospitality: ["event venue {region}", "catering {region}"],
  education: ["training provider {region}", "{keyword} courses UK"],
  logistics: ["courier service {region}", "logistics company {region}"],
  other: ["{keyword} {region}"],
};

/**
 * Build 2–3 search terms for a session. `keyword` falls back to the company
 * name when the sector template needs one.
 */
export function buildSearchTerms(input: {
  sector: SectorValue;
  region?: string | null;
  company?: string | null;
}): string[] {
  const region = (input.region || "UK").trim();
  const keyword = (input.company || "").trim() || "brand";
  const templates = SECTOR_TERMS[input.sector] ?? SECTOR_TERMS.other;
  const terms = templates
    .map((t) => t.replaceAll("{region}", region).replaceAll("{keyword}", keyword))
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return [...new Set(terms)].slice(0, 3);
}

/**
 * Directory/aggregator/social blocklist — these can never be "the top 3
 * competitors" or the report loses credibility.
 */
const BLOCKLIST = [
  "yell.com",
  "checkatrade.com",
  "trustpilot.com",
  "mybuilder.com",
  "ratedpeople.com",
  "bark.com",
  "houzz.co.uk",
  "houzz.com",
  "yelp.com",
  "yelp.co.uk",
  "thomsonlocal.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
  "reddit.com",
  "medium.com",
  "wikipedia.org",
  "google.com",
  "google.co.uk",
  "amazon.com",
  "amazon.co.uk",
  "ebay.com",
  "ebay.co.uk",
  "etsy.com",
  "gumtree.com",
  "indeed.com",
  "indeed.co.uk",
  "glassdoor.com",
  "glassdoor.co.uk",
  "rightmove.co.uk",
  "zoopla.co.uk",
  "onthemarket.com",
  "tripadvisor.com",
  "tripadvisor.co.uk",
  "booking.com",
  "opentable.com",
  "opentable.co.uk",
  "deliveroo.co.uk",
  "just-eat.co.uk",
  "ubereats.com",
  "comparethemarket.com",
  "moneysupermarket.com",
  "which.co.uk",
  "gov.uk",
  "nhs.uk",
  "clutch.co",
  "capterra.com",
  "g2.com",
  "sortlist.com",
  "designrush.com",
  "unbiased.co.uk",
  "vouchedfor.co.uk",
  "threebestrated.co.uk",
  "cylex-uk.co.uk",
  "freeindex.co.uk",
  "hotfrog.co.uk",
  "misterwhat.co.uk",
  "scoot.co.uk",
];

export function isBlockedDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  return BLOCKLIST.some((blocked) => d === blocked || d.endsWith(`.${blocked}`));
}

/** Normalise any URL/hostname to a bare registrable-ish domain. */
export function normaliseDomain(input: string): string | null {
  if (!input) return null;
  try {
    const url = input.includes("://") ? new URL(input) : new URL(`https://${input}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}
