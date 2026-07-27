import "server-only";

/**
 * Apify Google Search Scraper (§5.3) — real SERP data, run synchronously via
 * run-sync-get-dataset-items. Returns organic results per query term.
 */

export type SerpEntry = {
  term: string;
  results: { url: string; title: string; description?: string; position: number }[];
};

const ACTOR_URL =
  "https://api.apify.com/v2/actors/apify~google-search-scraper/run-sync-get-dataset-items";

export async function runGoogleSearch(
  terms: string[],
  timeoutMs: number,
  /** ISO country for the SERP ("gb" default; "us" for American leads). */
  countryCode = "gb",
): Promise<SerpEntry[] | null> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || terms.length === 0) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${ACTOR_URL}?token=${token}&format=json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queries: terms.join("\n"),
        countryCode,
        languageCode: "en",
        maxPagesPerQuery: 1,
        resultsPerPage: 20,
        mobileResults: false,
        saveHtml: false,
        includeUnfilteredResults: false,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error("[apify] search failed:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const items = (await res.json()) as Record<string, unknown>[];
    if (!Array.isArray(items)) return null;

    return items.map((item) => {
      const searchQuery = item.searchQuery as { term?: string } | string | undefined;
      const term =
        typeof searchQuery === "string"
          ? searchQuery
          : (searchQuery?.term ?? "");
      const raw =
        (item.organicResults as Record<string, unknown>[] | undefined) ??
        (item.nonPromotedSearchResults as Record<string, unknown>[] | undefined) ??
        [];
      const results = raw
        .map((r, i) => ({
          url: typeof r.url === "string" ? r.url : "",
          title: typeof r.title === "string" ? r.title : "",
          // The result's meta description — business-aware term discovery
          // reads what a company sells from its own snippet.
          ...(typeof r.description === "string" && r.description
            ? { description: r.description }
            : {}),
          position: typeof r.position === "number" ? r.position : i + 1,
        }))
        .filter((r) => r.url);
      return { term, results };
    });
  } catch (e) {
    console.error("[apify] search errored:", e instanceof Error ? e.message : e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
