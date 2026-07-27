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

/* --------------------- Business-aware term derivation ---------------------- */

/**
 * Controlled vocabulary of UK service categories. Each entry maps keywords —
 * matched against the business's own SERP title/description — to the searches
 * a real buyer of that service types. Templated terms only: every derived
 * search is a known buyer query, never invented text.
 *
 * `sector` is the best-fit of the 14 form sectors, used purely to flag a
 * mismatch with what the lead picked (their choice drives the playbook).
 * Order matters: ties resolve to the earlier entry, so keep the more
 * specific trades above the generic ones within each group.
 */
export type ServiceCategory = {
  id: string;
  label: string;
  sector: SectorValue;
  keywords: string[];
  terms: string[];
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  /* Construction & trades */
  {
    id: "heating-plumbing",
    label: "Heating & plumbing",
    sector: "construction",
    keywords: ["heating", "plumbing", "plumber", "boiler", "gas engineer", "gas safe", "heat pump", "central heating", "radiator"],
    terms: ["heating engineers {region}", "boiler installation {region}", "plumbers {region}"],
  },
  {
    id: "electrical",
    label: "Electrical",
    sector: "construction",
    keywords: ["electrician", "electrical contractor", "electrical installation", "rewiring", "ev charger", "eicr"],
    terms: ["electricians {region}", "electrical contractors {region}"],
  },
  {
    id: "roofing",
    label: "Roofing",
    sector: "construction",
    keywords: ["roofing", "roofer", "roof repair", "flat roof", "guttering"],
    terms: ["roofers {region}", "roofing company {region}"],
  },
  {
    id: "windows-glazing",
    label: "Windows & glazing",
    sector: "construction",
    keywords: ["double glazing", "glazing", "windows and doors", "upvc windows", "sash window"],
    terms: ["double glazing {region}", "window installers {region}"],
  },
  {
    id: "landscaping",
    label: "Landscaping & gardens",
    sector: "construction",
    keywords: ["landscaping", "landscaper", "garden design", "gardening", "driveway", "paving", "fencing", "tree surgeon", "artificial grass"],
    terms: ["landscapers {region}", "garden design {region}"],
  },
  {
    id: "painting-decorating",
    label: "Painting & decorating",
    sector: "construction",
    keywords: ["painting and decorating", "painter and decorator", "decorating", "plastering", "plasterer"],
    terms: ["painters and decorators {region}"],
  },
  {
    id: "carpentry-joinery",
    label: "Carpentry & joinery",
    sector: "construction",
    keywords: ["carpentry", "carpenter", "joinery", "joiner", "bespoke furniture", "kitchen fitter", "staircase"],
    terms: ["carpenters {region}", "bespoke joinery {region}"],
  },
  {
    id: "scaffolding",
    label: "Scaffolding",
    sector: "construction",
    keywords: ["scaffolding", "scaffold hire"],
    terms: ["scaffolding companies {region}", "scaffolding hire {region}"],
  },
  {
    id: "fit-out",
    label: "Fit-out & refurbishment",
    sector: "construction",
    keywords: ["fit out", "fitout", "office refurbishment", "shopfitting", "commercial interiors", "interior fit"],
    terms: ["office fit out {region}", "commercial fit out {region}"],
  },
  {
    id: "architecture",
    label: "Architecture",
    sector: "construction",
    keywords: ["architect", "architectural design", "architecture practice", "architecture studio", "planning drawings"],
    terms: ["architects {region}", "architectural services {region}"],
  },
  {
    id: "building",
    label: "Building & renovation",
    sector: "construction",
    keywords: ["builder", "building company", "building contractor", "house extension", "home extension", "loft conversion", "renovation", "refurbishment", "groundworks", "new build", "design and build"],
    terms: ["builders {region}", "house extensions {region}"],
  },

  /* Professional services */
  {
    id: "branding-design",
    label: "Branding & design",
    sector: "professional-services",
    keywords: ["branding", "brand agency", "brand identity", "brand design", "design agency", "design studio", "creative agency", "creative studio", "graphic design", "logo design", "creative department", "brand and design", "design subscription", "design partner"],
    terms: ["branding agency {region}", "design agency {region}"],
  },
  {
    id: "marketing-agency",
    label: "Marketing agency",
    sector: "professional-services",
    keywords: ["marketing agency", "digital marketing", "seo agency", "social media agency", "ppc", "paid media", "performance marketing", "growth agency", "content marketing", "lead generation"],
    terms: ["marketing agency {region}", "digital marketing agency {region}"],
  },
  {
    id: "web-design",
    label: "Web design & development",
    sector: "professional-services",
    keywords: ["web design", "website design", "web development", "web agency", "wordpress", "shopify agency", "webflow"],
    terms: ["web design agency {region}", "website designers {region}"],
  },
  {
    id: "pr-agency",
    label: "PR & communications",
    sector: "professional-services",
    keywords: ["pr agency", "public relations", "communications agency", "press office"],
    terms: ["pr agency {region}"],
  },
  {
    id: "photography-video",
    label: "Photography & video",
    sector: "professional-services",
    keywords: ["photographer", "photography", "videographer", "videography", "video production", "film production"],
    terms: ["commercial photographer {region}", "video production {region}"],
  },
  {
    id: "accountancy",
    label: "Accountancy",
    sector: "professional-services",
    keywords: ["accountant", "accountancy", "accounting", "bookkeeping", "tax adviser", "tax advisor", "tax return", "payroll", "chartered accountant"],
    terms: ["accountants {region}", "tax advisors {region}"],
  },
  {
    id: "legal",
    label: "Legal services",
    sector: "professional-services",
    keywords: ["solicitor", "law firm", "legal services", "conveyancing", "barrister", "legal advice", "litigation", "employment law", "family law"],
    terms: ["solicitors {region}", "law firms {region}"],
  },
  {
    id: "recruitment",
    label: "Recruitment",
    sector: "professional-services",
    keywords: ["recruitment", "recruiter", "staffing", "headhunter", "executive search", "talent acquisition"],
    terms: ["recruitment agency {region}"],
  },
  {
    id: "it-support",
    label: "IT support & services",
    sector: "professional-services",
    keywords: ["it support", "managed it", "it services", "managed service provider", "cyber security", "cloud services", "microsoft 365"],
    terms: ["it support {region}", "managed it services {region}"],
  },
  {
    id: "cleaning",
    label: "Cleaning services",
    sector: "other",
    keywords: ["cleaning company", "cleaning services", "commercial cleaning", "domestic cleaning", "end of tenancy", "window cleaning"],
    terms: ["cleaning company {region}", "commercial cleaning {region}"],
  },
  {
    id: "security-services",
    label: "Security services",
    sector: "other",
    keywords: ["security company", "security services", "cctv", "alarm systems", "security guards", "manned guarding"],
    terms: ["security companies {region}", "cctv installation {region}"],
  },

  /* Property & real estate */
  {
    id: "estate-agency",
    label: "Estate agency",
    sector: "property",
    keywords: ["estate agent", "estate agency", "property for sale", "lettings", "letting agent", "sell your home", "property sales"],
    terms: ["estate agents {region}", "letting agents {region}"],
  },
  {
    id: "property-management",
    label: "Property management",
    sector: "property",
    keywords: ["property management", "block management", "managing agent", "hmo management"],
    terms: ["property management {region}"],
  },
  {
    id: "property-development",
    label: "Property development",
    sector: "property",
    keywords: ["property developer", "property development", "new homes", "residential development"],
    terms: ["property developers {region}", "new homes {region}"],
  },
  {
    id: "surveying",
    label: "Surveying",
    sector: "property",
    keywords: ["surveyor", "surveying", "rics", "building survey", "valuation survey"],
    terms: ["chartered surveyors {region}", "building surveys {region}"],
  },

  /* Finance */
  {
    id: "mortgages",
    label: "Mortgage advice",
    sector: "finance",
    keywords: ["mortgage broker", "mortgage adviser", "mortgage advisor", "remortgage", "mortgage advice"],
    terms: ["mortgage brokers {region}"],
  },
  {
    id: "financial-advice",
    label: "Financial advice",
    sector: "finance",
    keywords: ["financial adviser", "financial advisor", "financial planning", "wealth management", "pension advice", "investment management", "ifa"],
    terms: ["financial advisers {region}", "wealth management {region}"],
  },
  {
    id: "insurance",
    label: "Insurance",
    sector: "finance",
    keywords: ["insurance broker", "insurance services", "business insurance", "life insurance"],
    terms: ["insurance brokers {region}"],
  },

  /* Health & beauty */
  {
    id: "dental",
    label: "Dental",
    sector: "health-beauty",
    keywords: ["dentist", "dental practice", "dental clinic", "dental implants", "orthodontic", "invisalign", "teeth whitening"],
    terms: ["dentists {region}", "dental implants {region}"],
  },
  {
    id: "aesthetics",
    label: "Aesthetics & skin",
    sector: "health-beauty",
    keywords: ["aesthetics", "aesthetic clinic", "skin clinic", "botox", "dermal filler", "laser hair removal", "skincare clinic", "facial"],
    terms: ["aesthetics clinic {region}", "skin clinic {region}"],
  },
  {
    id: "hair",
    label: "Hair",
    sector: "health-beauty",
    keywords: ["hair salon", "hairdresser", "hairdressing", "barber", "hair extensions", "hair colour"],
    terms: ["hair salons {region}"],
  },
  {
    id: "beauty",
    label: "Beauty",
    sector: "health-beauty",
    keywords: ["beauty salon", "beauty clinic", "nail salon", "nails", "lashes", "brows", "waxing"],
    terms: ["beauty salons {region}"],
  },
  {
    id: "physio-therapy",
    label: "Physical therapies",
    sector: "health-beauty",
    keywords: ["physiotherapy", "physiotherapist", "physio", "osteopath", "chiropractor", "sports massage", "sports injury"],
    terms: ["physiotherapists {region}"],
  },

  /* Fitness & wellness */
  {
    id: "gym-studio",
    label: "Gym & fitness studio",
    sector: "fitness-wellness",
    keywords: ["gym", "fitness studio", "fitness club", "crossfit", "group training", "bootcamp"],
    terms: ["gyms {region}", "fitness classes {region}"],
  },
  {
    id: "personal-training",
    label: "Personal training",
    sector: "fitness-wellness",
    keywords: ["personal trainer", "personal training", "online coaching", "fitness coach"],
    terms: ["personal trainers {region}"],
  },
  {
    id: "yoga-pilates",
    label: "Yoga & pilates",
    sector: "fitness-wellness",
    keywords: ["yoga", "pilates", "reformer"],
    terms: ["yoga studios {region}", "pilates classes {region}"],
  },

  /* Food & drink / hospitality */
  {
    id: "restaurant",
    label: "Restaurant",
    sector: "food-drink",
    keywords: ["restaurant", "fine dining", "bistro", "brasserie", "tasting menu"],
    terms: ["restaurants {region}", "best restaurants {region}"],
  },
  {
    id: "cafe-bakery",
    label: "Café & bakery",
    sector: "food-drink",
    keywords: ["cafe", "coffee shop", "coffee roaster", "bakery", "patisserie", "brunch"],
    terms: ["cafes {region}", "coffee shops {region}"],
  },
  {
    id: "catering",
    label: "Catering",
    sector: "hospitality",
    keywords: ["catering", "caterer", "event catering", "wedding catering", "corporate catering"],
    terms: ["caterers {region}", "event catering {region}"],
  },
  {
    id: "brewery-distillery",
    label: "Brewery & distillery",
    sector: "food-drink",
    keywords: ["brewery", "craft beer", "distillery", "gin", "taproom"],
    terms: ["breweries {region}", "craft beer {region}"],
  },
  {
    id: "venues",
    label: "Venues",
    sector: "hospitality",
    keywords: ["event venue", "wedding venue", "conference venue", "function room", "private hire"],
    terms: ["wedding venues {region}", "event venue {region}"],
  },
  {
    id: "hotel",
    label: "Hotels & stays",
    sector: "hospitality",
    keywords: ["hotel", "boutique hotel", "bed and breakfast", "guest house", "serviced apartment"],
    terms: ["boutique hotels {region}", "places to stay {region}"],
  },
  {
    id: "event-management",
    label: "Event management",
    sector: "hospitality",
    keywords: ["event management", "event production", "event planner", "event agency"],
    terms: ["event management companies {region}"],
  },

  /* Education & training */
  {
    id: "tutoring",
    label: "Tutoring",
    sector: "education",
    keywords: ["tutoring", "tutor", "tuition", "11 plus", "gcse", "a level"],
    terms: ["tutors {region}", "private tuition {region}"],
  },
  {
    id: "training-provider",
    label: "Training & courses",
    sector: "education",
    keywords: ["training provider", "training courses", "apprenticeship", "professional development", "cpd"],
    terms: ["training providers {region}"],
  },
  {
    id: "childcare",
    label: "Nursery & childcare",
    sector: "education",
    keywords: ["nursery", "childcare", "preschool", "early years"],
    terms: ["nurseries {region}", "childcare {region}"],
  },
  {
    id: "driving-school",
    label: "Driving school",
    sector: "education",
    keywords: ["driving school", "driving lessons", "driving instructor"],
    terms: ["driving schools {region}", "driving lessons {region}"],
  },

  /* Logistics & transport */
  {
    id: "courier",
    label: "Courier & delivery",
    sector: "logistics",
    keywords: ["courier", "same day delivery", "parcel delivery", "last mile"],
    terms: ["couriers {region}", "same day courier {region}"],
  },
  {
    id: "removals",
    label: "Removals",
    sector: "logistics",
    keywords: ["removals", "removal company", "man and van", "house move", "relocation"],
    terms: ["removals companies {region}", "man and van {region}"],
  },
  {
    id: "haulage",
    label: "Haulage & freight",
    sector: "logistics",
    keywords: ["haulage", "freight", "pallet", "transport company", "hgv"],
    terms: ["haulage companies {region}", "freight companies {region}"],
  },
  {
    id: "storage",
    label: "Storage & warehousing",
    sector: "logistics",
    keywords: ["self storage", "storage units", "warehousing", "fulfilment"],
    terms: ["self storage {region}", "warehousing {region}"],
  },

  /* Other common local services */
  {
    id: "automotive",
    label: "Automotive services",
    sector: "other",
    keywords: ["garage", "mot", "car servicing", "car repair", "bodyshop", "body shop", "vehicle repair", "car detailing"],
    terms: ["car garages {region}", "mot and servicing {region}"],
  },
  {
    id: "pest-control",
    label: "Pest control",
    sector: "other",
    keywords: ["pest control", "pest removal", "wasp nest", "rodent"],
    terms: ["pest control {region}"],
  },
];

export type BusinessClassification = {
  categoryId: string;
  label: string;
  sector: SectorValue;
  /**
   * high — safe to switch terms on this signal alone (a title keyword, or two
   * independent keywords). low — a single description keyword; keep the sector
   * defaults unless something else (the named market leader) corroborates.
   */
  confidence: "high" | "low";
};

/**
 * Classify a business from its own SERP title and meta description —
 * deterministic keyword matching against the controlled vocabulary, no AI.
 * Title hits score 2 (that's the business saying what it is), description
 * hits score 1. Highest total wins; ties resolve to vocabulary order.
 */
export function classifyBusiness(input: {
  title?: string | null;
  description?: string | null;
}): BusinessClassification | null {
  const title = normaliseText(input.title);
  const description = normaliseText(input.description);
  if (!title && !description) return null;

  let best: { category: ServiceCategory; score: number } | null = null;
  for (const category of SERVICE_CATEGORIES) {
    let score = 0;
    for (const keyword of category.keywords) {
      const re = keywordPattern(keyword);
      if (title && re.test(title)) score += 2;
      else if (description && re.test(description)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { category, score };
  }
  if (!best) return null;

  return {
    categoryId: best.category.id,
    label: best.category.label,
    sector: best.category.sector,
    confidence: best.score >= 2 ? "high" : "low",
  };
}

/** Buyer-intent terms for a vocabulary category, region-substituted. */
export function buildCategoryTerms(
  categoryId: string,
  region?: string | null,
): string[] | null {
  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;
  const r = (region || "UK").trim();
  const terms = category.terms
    .map((t) => t.replaceAll("{region}", r).replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return [...new Set(terms)].slice(0, 3);
}

/** Lowercase, unify & → and, hyphens → spaces, collapse whitespace. */
function normaliseText(value?: string | null): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[-–—/|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Word-boundary match, tolerating a plural on the final word. */
function keywordPattern(keyword: string): RegExp {
  const escaped = normaliseText(keyword)
    .split(" ")
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  return new RegExp(`\\b${escaped}s?\\b`, "i");
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
  "trustatrader.com",
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
  "gov",
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
  // US sports aggregators — event listings and sanctioning bodies, not clubs.
  "exposureevents.com",
  "usamateurbasketball.com",
  "aausports.org",
  "playeasy.com",
  "sportsengine.com",
  "leagueapps.com",
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
