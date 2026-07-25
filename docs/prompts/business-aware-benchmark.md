# Task: make the market benchmark match the actual business

## What's wrong

The Brand Score benchmark searches Google for competitors using **search terms
templated per sector**, not per business. When a business doesn't match the
average of its sector, the document compares the lead to companies that aren't
their competitors, which destroys the credibility of the whole report.

Real failure, captured from a live lead:

| | |
| --- | --- |
| Company | Heatplex — `heatplex.com` |
| Sector picked in the form | Construction & trades |
| Region | London |
| Terms generated | `builders London`, `construction company London` |
| Competitors returned | **Glenigan** (a construction *data* provider), RED Construction Group, thelondonbuilders.co.uk |
| What the business actually is | their own homepage title reads "Heat-Plex London \| Heating, Plumbing & Gas Specialists" |
| Terms that should have been used | `boiler installation London`, `plumbers London`, `heating engineers London` |
| Competitors those return | Pimlico Plumbers, Heating Engineers London, Boiler Installations London — **including the market leader the lead named in the form** |

The signal needed was sitting in their own page title. The lead also tells us
who they think the market leader is (`quiz_sessions.market_leader`), which the
benchmark currently ignores entirely.

## What to build

Derive the market search terms from **what the business actually does**, falling
back to the sector template only when nothing better can be established.

**Use Apify only.** `APIFY_API_TOKEN` is already configured and the Google Search
Scraper already returns everything needed — a search for the company's own brand
or domain returns their title *and* meta description, which is the same signal
Firecrawl's `ogTitle`/`ogDescription` gives us at no extra vendor. Firecrawl
(`FIRECRAWL_API_KEY`) stays for brand/visual extraction only. Do not add an AI
vendor: the content engine in `lib/brand-score-doc.ts` is deliberately
rules-based and this must stay deterministic and explainable.

## Where the code is

| File | What it does |
| --- | --- |
| `lib/server/benchmark-terms.ts` | `buildSearchTerms({sector, region, company})` and the `SECTOR_TERMS` template map (14 sectors). Also `BLOCKLIST` / `isBlockedDomain` (directories and socials can never be "competitors") and `normaliseDomain`. **This is the main file to change.** |
| `lib/server/benchmark.ts` | `runBenchmark({sessionId, sector, region, company, website, terms?, serpTimeoutMs?})`. Orchestrates SERP → competitor analysis → brand extraction. Tiers: `full` → `serp-only` → `none`. `getSerpResults` caches by `serp:${sector}:${region}` for 7 days. `analyseSerp` takes the top 3 domains by best position. `markFailed` deliberately preserves an earlier good benchmark. |
| `lib/server/apify.ts` | `runGoogleSearch(terms, timeoutMs)` → actor `apify~google-search-scraper` via `run-sync-get-dataset-items`, `countryCode: "gb"`, 20 results. **It currently keeps only `url`, `title`, `position` and throws away each result's `description`, plus the payload's related queries / people-also-ask.** You will need the descriptions. |
| `app/api/quiz/start/route.ts` | Kicks off `runBenchmark` in `after()` when the lead starts the quiz. |
| `app/api/doc/rebenchmark/route.ts` | Operator override: re-runs with explicit `terms`. **Keep this** — it's the manual escape hatch, and it's how the Heatplex terms above were proven. |
| `app/api/quiz/complete/route.ts` | Waits up to 8s for the benchmark to score the quiz on screen, then up to 20s more before composing the email. |
| `lib/quiz.ts` | `SECTORS` (the 14 form options) and the `BenchmarkResult` type stored in `quiz_sessions.benchmark`. |
| `lib/brand-score-doc.ts` | `SECTOR_PLAYBOOKS`, keyed by sector — this drives the document's advice copy, so a wrong sector also produces wrong advice. |
| `components/doc/brand-score-document.tsx` | Renders the market page and **quotes the search terms verbatim** to the lead. |

Data available per lead in `quiz_sessions`: `company`, `website`, `sector`,
`region`, `market_leader`, `answers`. Caches live in `serp_cache` and
`brand_extract_cache` (Supabase).

## Approach

1. **Discovery.** One Apify search for the company (their domain, and/or brand
   name plus region). Pull the title and description of the result matching their
   own domain. That text says what they sell.
2. **Classify deterministically.** Match that text against a controlled
   vocabulary of service categories mapped to buyer-intent term templates
   (`heating` → `heating engineers {region}`, `boiler` → `boiler installation
   {region}`, `estate agent` → `estate agents {region}`, `branding` → `branding
   agency {region}`, and so on). A controlled vocabulary means the terms are
   always real buyer searches and never invented. Cover the common UK service
   categories inside each of the 14 sectors, since that's where the mismatch
   happens.
3. **Use the named market leader as corroboration.** If `market_leader` resolves
   to a real company, what *it* ranks for is strong evidence of the category. At
   minimum, prefer derived terms when the named leader appears in their results
   and doesn't in the sector defaults.
4. **Build 2–3 terms**, region-substituted exactly as `buildSearchTerms` does now.
5. **Fall back cleanly**: no website, no matching vocabulary, or discovery fails
   → today's sector template, unchanged.
6. **Record why.** Put the inferred category and a `termSource` of
   `"inferred" | "sector-default" | "manual"` into the stored `BenchmarkResult`,
   so an operator reviewing a document can see how the terms were chosen.
7. **Consider correcting the sector too.** The picked sector also selects the
   document's advice playbook, so a heating firm filed under Construction gets
   builder advice. If the inferred category maps confidently to a different one
   of the 14 sectors, either use it for the playbook or flag the mismatch on the
   internal review page. Do not silently overwrite what the lead chose.

## Constraints

- **Cost.** Apify bills per query. Discovery adds one query per new lead — cache
  it per domain (30 days, like `brand_extract_cache`) so re-runs are free. If
  it's cheap to do so, batch the discovery query alongside the sector-default
  terms in a single call and only re-query when the derived terms differ.
- **Caching correctness.** The SERP cache key is currently `sector + region`,
  which is wrong the moment terms are per-business — two businesses in one sector
  would poison each other's results. Key the cache on the normalised term list.
- **Latency.** The on-screen score waits 8s for the benchmark. Discovery adds a
  round trip, so keep the whole path inside the existing budget or make discovery
  non-blocking (the emailed report is scheduled 45 minutes out, so it can absorb
  more delay than the on-screen result can).
- **Never invent data.** Every term must be a real search that was actually run,
  because the document quotes them to the lead and the positions must be
  verifiable.
- Keep the directory/social blocklist applied, and keep `markFailed`'s behaviour
  of never destroying a good benchmark with a failed re-run.

## Verify against these real cases

Run each through `/api/quiz/start` (or `/api/doc/rebenchmark`) and check the
stored `quiz_sessions.benchmark`:

| Company | Website | Sector picked | Region | Expected |
| --- | --- | --- | --- | --- |
| Heatplex | heatplex.com | construction | London | heating/plumbing/boiler terms; Pimlico among the competitors; **not** Glenigan |
| Foxtons | foxtons.co.uk | property | London | still `estate agents London`; must not regress — this one was already right, and they rank #2 |
| Milktree | milktreeagency.com | professional-services | London | branding/design agency terms, **not** `accountants London` |
| any lead with no website | — | any | any | falls back to sector defaults, no error, benchmark still completes |

For each: the competitors must be businesses a buyer would actually consider
instead of this company, and the terms must read like something a real customer
would type.

## Optional second task (known loose end)

`/api/doc/rebenchmark` recomputes the market data but doesn't update
`quiz_sessions.final_score`, so the document and email can show a different score
than the lead saw on screen (a real case scored 33 on screen and 52 in the
email). Decide which wins — the corrected data is more accurate, but the lead has
already seen the first number — and make the score, the document and the email
agree.
