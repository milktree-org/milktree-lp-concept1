import "server-only";

import { getSupabase } from "@/lib/server/supabase";
import { runGoogleSearch, type SerpEntry } from "@/lib/server/apify";
import { extractBrand } from "@/lib/server/firecrawl";
import {
  SERVICE_CATEGORIES,
  buildCategoryTerms,
  buildSearchTerms,
  classifyBusiness,
  isBlockedDomain,
  normaliseDomain,
  type BusinessClassification,
} from "@/lib/server/benchmark-terms";
import type {
  BenchmarkResult,
  BrandExtract,
  CompetitorResult,
  SectorValue,
  TermSource,
} from "@/lib/quiz";

/**
 * Benchmark orchestrator (§5.3). Kicked off asynchronously at quiz start via
 * after(); results land in quiz_sessions.benchmark. Degradation is tiered:
 * full (SERP + brand extraction) → serp-only → none (self-assessment-only).
 *
 * Search terms are derived from what the business actually does, not just the
 * sector it picked in the form: one discovery search for the company's own
 * domain returns its title and meta description, which a controlled keyword
 * vocabulary classifies into a service category with real buyer-intent terms
 * (a heating firm filed under Construction gets "boiler installation London",
 * not "builders London"). No classification → the sector template, unchanged.
 *
 * Caching keeps costs near zero: SERP per normalised term list for 7 days
 * (never per sector — two businesses in one sector can have different terms),
 * discovery per domain for 30 days, Firecrawl brand extractions per domain
 * for 30 days. On a cold run the discovery query is batched into the same
 * Apify call as the sector-default terms, so the happy path stays one
 * round trip; only a term mismatch costs a second call.
 */

const SERP_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DISCOVERY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const BRAND_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SERP_TIMEOUT_MS = 20_000;
const BRAND_TIMEOUT_MS = 15_000;

export async function runBenchmark(input: {
  sessionId: string;
  sector: SectorValue;
  region?: string | null;
  company?: string | null;
  website?: string | null;
  /**
   * Override the derived/sector search terms. Used by the operator escape
   * hatch (/api/doc/rebenchmark) and by market-leader corroboration.
   */
  terms?: string[];
  /** How overridden terms were chosen. Defaults to "manual". */
  termSource?: TermSource;
  /** Carried through on corroboration re-runs so the audit trail survives. */
  inferredCategory?: string | null;
  inferredCategoryId?: string | null;
  /** SERP lookup budget. Longer for internal re-runs, where latency is free. */
  serpTimeoutMs?: number;
  /** SERP country ("gb" default). Set per-run for non-UK leads. */
  countryCode?: string;
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const mark = async (status: string, benchmark?: BenchmarkResult) => {
    await supabase
      .from("quiz_sessions")
      .update({ benchmark_status: status, ...(benchmark ? { benchmark } : {}) })
      .eq("id", input.sessionId);
  };

  /**
   * Failure must never destroy market data we already hold — a re-run that
   * times out leaves the previous successful benchmark in place.
   */
  const markFailed = async (placeholder: BenchmarkResult) => {
    const { data } = await supabase
      .from("quiz_sessions")
      .select("benchmark")
      .eq("id", input.sessionId)
      .maybeSingle();
    const existing = data?.benchmark as BenchmarkResult | null | undefined;
    const keepExisting = existing && existing.tier !== "none";
    await mark("failed", keepExisting ? undefined : placeholder);
  };

  try {
    await mark("running");

    const timeoutMs = input.serpTimeoutMs ?? SERP_TIMEOUT_MS;
    const countryCode = input.countryCode ?? "gb";
    let terms: string[];
    let termSource: TermSource;
    let inferred: InferredCategory | null;
    let serp: SerpEntry[] | null;

    if (input.terms && input.terms.length > 0) {
      terms = input.terms.slice(0, 3);
      termSource = input.termSource ?? "manual";
      inferred = input.inferredCategoryId
        ? {
            categoryId: input.inferredCategoryId,
            label: input.inferredCategory ?? input.inferredCategoryId,
          }
        : null;
      serp = await getSerpResults(terms, timeoutMs, countryCode);
    } else {
      const resolved = await resolveBusinessSerp({
        domain: normaliseDomain(input.website ?? ""),
        sector: input.sector,
        region: input.region ?? null,
        company: input.company ?? null,
        timeoutMs,
        countryCode,
      });
      ({ serp, terms, termSource, inferred } = resolved);
    }

    const audit = {
      termSource,
      inferredCategory: inferred?.label ?? null,
      inferredCategoryId: inferred?.categoryId ?? null,
      inferredSector: inferredSectorFor(inferred?.categoryId, input.sector),
    };

    if (!serp || serp.length === 0) {
      await markFailed({
        tier: "none",
        terms,
        competitors: [],
        userBestPosition: null,
        userBestTerm: null,
        benchmarkScore: null,
        note: "Search lookup unavailable — score based on self-assessment only.",
        ...audit,
      });
      return;
    }

    const userDomain = normaliseDomain(input.website ?? "");
    const { competitors, userBestPosition, userBestTerm } = analyseSerp(
      serp,
      userDomain,
    );

    // Brand extraction — competitors + the user's own site, in parallel,
    // each domain cached for 30 days.
    const domainsToExtract = [
      ...competitors.map((c) => c.domain),
      ...(userDomain ? [userDomain] : []),
    ];
    const extracts = await Promise.all(
      domainsToExtract.map((d) => getBrandExtract(d)),
    );
    const byDomain = new Map<string, BrandExtract | null>();
    domainsToExtract.forEach((d, i) => byDomain.set(d, extracts[i]));

    for (const c of competitors) c.brand = byDomain.get(c.domain) ?? null;
    const userBrand = userDomain ? (byDomain.get(userDomain) ?? null) : null;

    const anyBrand =
      competitors.some((c) => c.brand) || Boolean(userBrand);
    const tier: BenchmarkResult["tier"] = anyBrand ? "full" : "serp-only";

    const benchmarkScore = scoreBenchmark({
      userBestPosition,
      userBrand,
      hasUserSite: Boolean(userDomain),
    });

    await mark("complete", {
      tier,
      terms: serp.map((s) => s.term),
      competitors,
      userBestPosition,
      userBestTerm,
      userBrand,
      benchmarkScore,
      ...audit,
    });
  } catch (e) {
    console.error("[benchmark] failed:", e instanceof Error ? e.message : e);
    await mark("failed").catch(() => undefined);
  }
}

/* --------------------- Business-aware term resolution ---------------------- */

type InferredCategory = { categoryId: string; label: string };

type ResolvedSerp = {
  serp: SerpEntry[] | null;
  terms: string[];
  termSource: TermSource;
  inferred: InferredCategory | null;
};

/**
 * Decide what to search from what the business actually does, and fetch it.
 *
 * 1. Discovery: one search for the company's own domain returns its title and
 *    meta description (cached 30 days per domain). On a cold run this query
 *    rides in the same Apify call as the sector defaults, so the common case
 *    costs no extra round trip.
 * 2. Classification: deterministic keyword matching against the controlled
 *    vocabulary. High confidence → the category's buyer-intent terms replace
 *    the sector template. Low confidence → defaults, with the category
 *    recorded so market-leader corroboration can revisit the call.
 * 3. Fallback: no website, no classification, or a failed derived lookup →
 *    the sector template, exactly as before.
 */
async function resolveBusinessSerp(input: {
  domain: string | null;
  sector: SectorValue;
  region: string | null;
  company: string | null;
  timeoutMs: number;
  countryCode: string;
}): Promise<ResolvedSerp> {
  const defaults = buildSearchTerms(input);
  const fallback = async (
    serp: SerpEntry[] | null,
    inferred: InferredCategory | null,
  ): Promise<ResolvedSerp> => ({
    serp:
      serp ?? (await getSerpResults(defaults, input.timeoutMs, input.countryCode)),
    terms: defaults,
    termSource: "sector-default",
    inferred,
  });

  if (!input.domain) return fallback(null, null);

  let discovery = await readDiscoveryCache(input.domain);
  let defaultSerp: SerpEntry[] | null = null;

  if (!discovery) {
    const cachedDefaults = await readSerpCache(defaults, input.countryCode);
    if (cachedDefaults) {
      // Defaults already cached — the discovery query runs alone.
      const solo = await runGoogleSearch(
        [input.domain],
        input.timeoutMs,
        input.countryCode,
      );
      if (solo) {
        discovery = extractDiscovery(solo, input.domain);
        await writeDiscoveryCache(input.domain, discovery);
      }
      defaultSerp = cachedDefaults;
    } else {
      // Cold run: discovery and sector defaults share one Apify call.
      const batch = await runGoogleSearch(
        [input.domain, ...defaults],
        input.timeoutMs,
        input.countryCode,
      );
      if (batch) {
        const domainKey = input.domain.toLowerCase();
        const discoveryEntries = batch.filter(
          (e) => e.term.trim().toLowerCase() === domainKey,
        );
        const defaultEntries = batch.filter(
          (e) => e.term.trim().toLowerCase() !== domainKey,
        );
        discovery = extractDiscovery(discoveryEntries, input.domain);
        await writeDiscoveryCache(input.domain, discovery);
        if (defaultEntries.length > 0) {
          await writeSerpCache(defaults, defaultEntries, input.countryCode);
          defaultSerp = defaultEntries;
        }
      }
    }
  }

  const classification: BusinessClassification | null = discovery
    ? classifyBusiness(discovery)
    : null;
  const inferred: InferredCategory | null = classification
    ? { categoryId: classification.categoryId, label: classification.label }
    : null;
  const derived = classification
    ? buildCategoryTerms(classification.categoryId, input.region)
    : null;

  const useDerived =
    classification?.confidence === "high" &&
    derived !== null &&
    !sameTerms(derived, defaults);
  if (!useDerived) return fallback(defaultSerp, inferred);

  const serp = await getSerpResults(derived, input.timeoutMs, input.countryCode);
  if (serp && serp.length > 0) {
    return { serp, terms: derived, termSource: "inferred", inferred };
  }
  // Derived lookup failed — fall back to the default data we already hold.
  return fallback(defaultSerp, inferred);
}

/**
 * The inferred category's best-fit sector, only when it confidently disagrees
 * with what the lead picked. Never applied automatically — the review page
 * flags it so an operator decides.
 */
function inferredSectorFor(
  categoryId: string | null | undefined,
  picked: SectorValue,
): SectorValue | null {
  if (!categoryId) return null;
  const category = SERVICE_CATEGORIES.find((c) => c.id === categoryId);
  if (!category || category.sector === "other" || category.sector === picked) {
    return null;
  }
  return category.sector;
}

function sameTerms(a: string[], b: string[]): boolean {
  return serpCacheKey(a) === serpCacheKey(b);
}

/* ---------------------- Market-leader corroboration ------------------------ */

/**
 * The lead names their market leader at quiz completion — after the benchmark
 * has already run. When discovery classified a category but the signal was
 * too weak to switch terms on its own, the named leader settles it: if the
 * leader ranks for the derived terms and not for the sector defaults, the
 * derived terms describe the lead's real market, and the benchmark re-runs
 * with them. Returns true when the benchmark was re-run.
 */
export async function corroborateWithMarketLeader(input: {
  sessionId: string;
  marketLeader: string;
}): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const leaderKey = alphanumeric(input.marketLeader);
  if (leaderKey.length < 4) return false;

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("company, website, sector, region, benchmark_status, benchmark")
    .eq("id", input.sessionId)
    .maybeSingle();
  if (!session || session.benchmark_status !== "complete") return false;

  const benchmark = session.benchmark as BenchmarkResult | null;
  if (
    !benchmark ||
    benchmark.termSource !== "sector-default" ||
    !benchmark.inferredCategoryId
  ) {
    return false;
  }

  const derived = buildCategoryTerms(
    benchmark.inferredCategoryId,
    session.region as string | null,
  );
  if (!derived || sameTerms(derived, benchmark.terms)) return false;

  const derivedSerp = await getSerpResults(derived, SERP_TIMEOUT_MS);
  if (!derivedSerp || derivedSerp.length === 0) return false;
  if (!serpMentionsLeader(derivedSerp, leaderKey)) return false;

  // The leader ranking for the defaults too would mean the sector template
  // already covers their market — leave it alone.
  const defaultSerp = await readSerpCache(benchmark.terms);
  const inDefaults = defaultSerp
    ? serpMentionsLeader(defaultSerp, leaderKey)
    : benchmark.competitors.some(
        (c) =>
          alphanumeric(c.domain).includes(leaderKey) ||
          alphanumeric(c.name ?? "").includes(leaderKey),
      );
  if (inDefaults) return false;

  await runBenchmark({
    sessionId: input.sessionId,
    sector: (session.sector as SectorValue) ?? "other",
    region: session.region as string | null,
    company: session.company as string | null,
    website: session.website as string | null,
    terms: derived,
    termSource: "inferred",
    inferredCategory: benchmark.inferredCategory,
    inferredCategoryId: benchmark.inferredCategoryId,
  });
  return true;
}

function serpMentionsLeader(serp: SerpEntry[], leaderKey: string): boolean {
  return serp.some((entry) =>
    entry.results.some(
      (r) =>
        alphanumeric(normaliseDomain(r.url) ?? "").includes(leaderKey) ||
        alphanumeric(r.title).includes(leaderKey),
    ),
  );
}

function alphanumeric(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/* ------------------------------- SERP layer ------------------------------- */

/**
 * Cache keyed on the normalised term list, so identical searches are free for
 * 7 days whoever triggers them, and no two businesses can poison each other's
 * results just by sharing a sector.
 */
function serpCacheKey(terms: string[], countryCode = "gb"): string {
  const normalised = terms
    .map((t) => t.toLowerCase().replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .sort();
  // "gb" keeps the original key shape so existing cache rows stay warm.
  const country = countryCode.toLowerCase();
  const prefix = country === "gb" ? "serp:v2:" : `serp:v2:${country}:`;
  return `${prefix}${normalised.join("|")}`;
}

async function readSerpCache(
  terms: string[],
  countryCode = "gb",
): Promise<SerpEntry[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("serp_cache")
    .select("created_at, data")
    .eq("key", serpCacheKey(terms, countryCode))
    .maybeSingle();
  if (data && Date.now() - new Date(data.created_at).getTime() < SERP_TTL_MS) {
    return data.data as SerpEntry[];
  }
  return null;
}

async function writeSerpCache(
  terms: string[],
  entries: SerpEntry[],
  countryCode = "gb",
) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("serp_cache").upsert({
    key: serpCacheKey(terms, countryCode),
    created_at: new Date().toISOString(),
    data: entries,
  });
}

async function getSerpResults(
  terms: string[],
  timeoutMs = SERP_TIMEOUT_MS,
  countryCode = "gb",
): Promise<SerpEntry[] | null> {
  const cached = await readSerpCache(terms, countryCode);
  if (cached) return cached;

  const fresh = await runGoogleSearch(terms, timeoutMs, countryCode);
  if (fresh) await writeSerpCache(terms, fresh, countryCode);
  return fresh;
}

/* ----------------------------- Discovery layer ----------------------------- */

/** What the business's own SERP snippet says it does. */
type Discovery = { title: string; description: string };

const DISCOVERY_KEY_PREFIX = "discovery:v1:";

/**
 * Pull the business's own result out of the discovery entry — the lowest
 * position on their own domain. An empty Discovery is cached too, so a domain
 * Google returns nothing useful for isn't re-queried on every run.
 */
function extractDiscovery(
  entries: SerpEntry[] | null,
  domain: string,
): Discovery {
  let best: { position: number; title: string; description: string } | null =
    null;
  for (const entry of entries ?? []) {
    for (const result of entry.results) {
      const resultDomain = normaliseDomain(result.url);
      if (!resultDomain) continue;
      if (resultDomain !== domain && !resultDomain.endsWith(`.${domain}`)) {
        continue;
      }
      if (!best || result.position < best.position) {
        best = {
          position: result.position,
          title: result.title,
          description: result.description ?? "",
        };
      }
    }
  }
  return { title: best?.title ?? "", description: best?.description ?? "" };
}

async function readDiscoveryCache(domain: string): Promise<Discovery | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("serp_cache")
    .select("created_at, data")
    .eq("key", `${DISCOVERY_KEY_PREFIX}${domain}`)
    .maybeSingle();
  if (
    data &&
    Date.now() - new Date(data.created_at).getTime() < DISCOVERY_TTL_MS
  ) {
    return data.data as Discovery;
  }
  return null;
}

async function writeDiscoveryCache(domain: string, discovery: Discovery) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("serp_cache").upsert({
    key: `${DISCOVERY_KEY_PREFIX}${domain}`,
    created_at: new Date().toISOString(),
    data: discovery,
  });
}

/* ------------------------------ SERP analysis ------------------------------ */

function analyseSerp(
  serp: SerpEntry[],
  userDomain: string | null,
): {
  competitors: CompetitorResult[];
  userBestPosition: number | null;
  userBestTerm: string | null;
} {
  // Best position per candidate domain across all terms.
  const best = new Map<string, { position: number; term: string; title: string }>();
  let userBestPosition: number | null = null;
  let userBestTerm: string | null = null;

  for (const entry of serp) {
    for (const result of entry.results) {
      const domain = normaliseDomain(result.url);
      if (!domain) continue;

      if (userDomain && (domain === userDomain || domain.endsWith(`.${userDomain}`))) {
        if (userBestPosition === null || result.position < userBestPosition) {
          userBestPosition = result.position;
          userBestTerm = entry.term;
        }
        continue;
      }
      if (isBlockedDomain(domain)) continue;

      const current = best.get(domain);
      if (!current || result.position < current.position) {
        best.set(domain, {
          position: result.position,
          term: entry.term,
          title: result.title,
        });
      }
    }
  }

  const competitors: CompetitorResult[] = [...best.entries()]
    .sort((a, b) => a[1].position - b[1].position)
    .slice(0, 3)
    .map(([domain, info]) => ({
      domain,
      name: competitorName(domain, info.title),
      bestPosition: info.position,
      bestTerm: info.term,
      brand: null,
    }));

  return { competitors, userBestPosition, userBestTerm };
}

/**
 * "Acme Roofing | Hampshire's #1 ..." → "Acme Roofing".
 * Also trims trailing tagline sentences ("Ragged Edge. A global branding
 * agency...") so competitor cards carry a brand name, not a meta title.
 */
function cleanTitle(title: string): string {
  const head = title.split(/[|–—•·:]|\s-\s/)[0].trim();
  const sentence = head.split(/\.\s+/)[0].trim();
  return (sentence || head).replace(/\.$/, "").slice(0, 40);
}

/**
 * A competitor's display name. SERP titles are unreliable (sitelinks, keyword
 * stuffing), so the cleaned title is only trusted when it corroborates the
 * domain; otherwise the domain label wins. Naming a real business wrongly
 * would sink the document's credibility.
 */
function competitorName(domain: string, title: string): string {
  const label = domain.replace(
    /\.(co\.uk|com|org\.uk|org|net|studio|design|agency|energy|services|solutions|group|london|homes|build|shop|store|tech|io|dev|ai|uk)$/i,
    "",
  );
  const cleaned = cleanTitle(title);
  const key = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
  const domainKey = domain.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (key.length >= 3 && (domainKey.includes(key) || key.includes(label.replace(/[^a-z0-9]/gi, "").toLowerCase()))) {
    return cleaned;
  }
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/* ---------------------------- Brand extraction ---------------------------- */

async function getBrandExtract(domain: string): Promise<BrandExtract | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("brand_extract_cache")
      .select("created_at, data")
      .eq("domain", domain)
      .maybeSingle();
    if (data && Date.now() - new Date(data.created_at).getTime() < BRAND_TTL_MS) {
      return data.data as BrandExtract | null;
    }
  }

  const fresh = await extractBrand(domain, BRAND_TIMEOUT_MS);
  if (supabase && fresh) {
    await supabase.from("brand_extract_cache").upsert({
      domain,
      created_at: new Date().toISOString(),
      data: fresh,
    });
  }
  return fresh;
}

/* -------------------------------- Scoring --------------------------------- */

/**
 * Benchmark score /100 — transparent, rules-based:
 *  - SERP visibility (up to 60): page-1 top 3 → 60 · page 1 → 42 · page 2 →
 *    22 · not found in the top 20 → 6.
 *  - Brand presentation (up to 40): clear headline, meta description,
 *    contained palette, disciplined type — from the user's own extraction.
 *  - No user site / extraction failed → SERP component scaled to /100.
 */
function scoreBenchmark(input: {
  userBestPosition: number | null;
  userBrand: BrandExtract | null;
  hasUserSite: boolean;
}): number {
  const pos = input.userBestPosition;
  const serp =
    pos === null ? 6 : pos <= 3 ? 60 : pos <= 10 ? 42 : pos <= 20 ? 22 : 6;

  if (!input.userBrand) {
    return Math.round((serp / 60) * 100 * (input.hasUserSite ? 0.85 : 0.7));
  }

  let brand = 0;
  const b = input.userBrand;
  if (b.headline && b.headline.length <= 70) brand += 12;
  else if (b.headline) brand += 6;
  if (b.description) brand += 8;
  if (b.colors && b.colors.length > 0 && b.colors.length <= 5) brand += 10;
  else if (b.colors && b.colors.length > 0) brand += 5;
  if (b.fonts && b.fonts.length > 0 && b.fonts.length <= 3) brand += 10;
  else if (b.fonts && b.fonts.length > 0) brand += 5;

  return Math.min(100, serp + brand);
}
