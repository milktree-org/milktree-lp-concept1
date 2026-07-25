import "server-only";

import { getSupabase } from "@/lib/server/supabase";
import { runGoogleSearch, type SerpEntry } from "@/lib/server/apify";
import { extractBrand } from "@/lib/server/firecrawl";
import {
  buildSearchTerms,
  isBlockedDomain,
  normaliseDomain,
} from "@/lib/server/benchmark-terms";
import type { BenchmarkResult, BrandExtract, CompetitorResult, SectorValue } from "@/lib/quiz";

/**
 * Benchmark orchestrator (§5.3). Kicked off asynchronously at quiz start via
 * after(); results land in quiz_sessions.benchmark. Degradation is tiered:
 * full (SERP + brand extraction) → serp-only → none (self-assessment-only).
 *
 * Caching keeps costs near zero: SERP per sector+region for 7 days,
 * Firecrawl brand extractions per domain for 30 days.
 */

const SERP_TTL_MS = 7 * 24 * 60 * 60 * 1000;
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
   * Override the sector's default search terms. Used when re-running a
   * benchmark for a lead whose business doesn't match the sector template
   * (e.g. a design studio filed under professional services).
   */
  terms?: string[];
  /** SERP lookup budget. Longer for internal re-runs, where latency is free. */
  serpTimeoutMs?: number;
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

    const terms =
      input.terms && input.terms.length > 0
        ? input.terms.slice(0, 3)
        : buildSearchTerms(input);
    const serp = await getSerpResults(
      input.sector,
      input.region ?? null,
      terms,
      Boolean(input.terms && input.terms.length > 0),
      input.serpTimeoutMs ?? SERP_TIMEOUT_MS,
    );
    if (!serp || serp.length === 0) {
      await markFailed({
        tier: "none",
        terms,
        competitors: [],
        userBestPosition: null,
        userBestTerm: null,
        benchmarkScore: null,
        note: "Search lookup unavailable — score based on self-assessment only.",
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
    });
  } catch (e) {
    console.error("[benchmark] failed:", e instanceof Error ? e.message : e);
    await mark("failed").catch(() => undefined);
  }
}

/* ------------------------------- SERP layer ------------------------------- */

async function getSerpResults(
  sector: string,
  region: string | null,
  terms: string[],
  customTerms = false,
  timeoutMs = SERP_TIMEOUT_MS,
): Promise<SerpEntry[] | null> {
  const supabase = getSupabase();
  // Custom terms bypass the sector+region cache entirely so they neither read
  // nor overwrite the shared sector results.
  const cacheKey = `serp:${sector}:${(region || "uk").toLowerCase()}`;

  if (supabase && !customTerms) {
    const { data } = await supabase
      .from("serp_cache")
      .select("created_at, data")
      .eq("key", cacheKey)
      .maybeSingle();
    if (data && Date.now() - new Date(data.created_at).getTime() < SERP_TTL_MS) {
      return data.data as SerpEntry[];
    }
  }

  const fresh = await runGoogleSearch(terms, timeoutMs);
  if (fresh && supabase && !customTerms) {
    await supabase
      .from("serp_cache")
      .upsert({ key: cacheKey, created_at: new Date().toISOString(), data: fresh });
  }
  return fresh;
}

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
