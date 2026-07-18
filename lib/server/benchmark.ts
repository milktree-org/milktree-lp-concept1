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
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const mark = async (status: string, benchmark?: BenchmarkResult) => {
    await supabase
      .from("quiz_sessions")
      .update({ benchmark_status: status, ...(benchmark ? { benchmark } : {}) })
      .eq("id", input.sessionId);
  };

  try {
    await mark("running");

    const terms = buildSearchTerms(input);
    const serp = await getSerpResults(input.sector, input.region ?? null, terms);
    if (!serp || serp.length === 0) {
      await mark("failed", {
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
): Promise<SerpEntry[] | null> {
  const supabase = getSupabase();
  const cacheKey = `serp:${sector}:${(region || "uk").toLowerCase()}`;

  if (supabase) {
    const { data } = await supabase
      .from("serp_cache")
      .select("created_at, data")
      .eq("key", cacheKey)
      .maybeSingle();
    if (data && Date.now() - new Date(data.created_at).getTime() < SERP_TTL_MS) {
      return data.data as SerpEntry[];
    }
  }

  const fresh = await runGoogleSearch(terms, SERP_TIMEOUT_MS);
  if (fresh && supabase) {
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
      name: cleanTitle(info.title) || domain,
      bestPosition: info.position,
      bestTerm: info.term,
      brand: null,
    }));

  return { competitors, userBestPosition, userBestTerm };
}

/** "Acme Roofing | Hampshire's #1 ..." → "Acme Roofing" */
function cleanTitle(title: string): string {
  return title.split(/[|–—•·:-]/)[0].trim().slice(0, 60);
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
