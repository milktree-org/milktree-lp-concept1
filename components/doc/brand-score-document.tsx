import {
  CATEGORY_LABELS,
  type BenchmarkResult,
  type BrandExtract,
  type QuizCategory,
  type SectorValue,
  SECTORS,
} from "@/lib/quiz";
import {
  CATEGORY_INSIGHTS,
  ROADMAP,
  SECTOR_PLAYBOOKS,
  categoryVerdict,
  describeRadius,
  identityNotes,
  inkOn,
  scoreBand,
} from "@/lib/brand-score-doc";
import { Wordmark } from "@/components/layout/wordmark";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * The Brand Score document — A4 pages rendered server-side from a completed
 * quiz session, exported to PDF via the browser's print dialog (print styles
 * live in globals.css under .brand-score-doc). Page count varies: the identity
 * read-out only appears when we could scrape the lead's own site, so pages are
 * numbered from the composed list rather than hard-coded.
 */

export type BrandScoreDocData = {
  sessionId: string;
  company: string;
  contactName: string;
  jobRole: string;
  email: string;
  website: string;
  sector: SectorValue;
  region: string;
  marketLeader: string;
  score: number;
  categoryScores: Record<QuizCategory, number>;
  actions: string[];
  benchmark: BenchmarkResult | null;
  date: string;
};

const CATEGORY_ORDER: QuizCategory[] = [
  "consistency",
  "freshness",
  "resource",
  "social",
  "website",
  "search",
];

export function BrandScoreDocument({ data }: { data: BrandScoreDocData }) {
  const playbook = SECTOR_PLAYBOOKS[data.sector] ?? SECTOR_PLAYBOOKS.other;
  const sectorLabel =
    SECTORS.find((s) => s.value === data.sector)?.label ?? "Your sector";
  const band = scoreBand(data.score);
  const weakest = CATEGORY_ORDER.slice()
    .sort((a, b) => data.categoryScores[a] - data.categoryScores[b])
    .slice(0, 3);
  const competitors = data.benchmark?.competitors?.slice(0, 3) ?? [];
  const userBrand = data.benchmark?.userBrand ?? null;

  const pages: { section: string; content: React.ReactNode }[] = [];

  /* ------------------------------- 1 · Cover ------------------------------- */
  pages.push({
    section: "",
    content: (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <DocWordmark />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
            {data.date}
          </p>
        </div>

        <div className="mt-auto">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.24em] text-brand">
            <span className="inline-block h-[2px] w-6 bg-brand" />
            Brand Score
          </p>
          <h1 className="mt-5 text-[54px] font-black leading-[1.02] tracking-[-0.03em] text-white">
            {data.company}
          </h1>
          <p className="mt-4 text-[15px] font-medium text-white/60">
            How your brand really performs in {playbook.noun}, measured against
            the businesses winning your market.
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-white/15 pt-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Prepared for
            </p>
            <p className="mt-1 text-[16px] font-bold text-white">
              {data.contactName || data.company}
              {data.jobRole ? (
                <span className="font-medium text-white/50"> · {data.jobRole}</span>
              ) : null}
            </p>
            <p className="mt-0.5 text-[13px] text-white/50">
              {sectorLabel}
              {data.region ? ` · ${data.region}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Your score
            </p>
            <p className="text-[64px] font-black leading-none tracking-[-0.03em] text-brand">
              {data.score}
              <span className="text-[22px] font-bold text-white/40">/100</span>
            </p>
          </div>
        </div>
      </div>
    ),
  });

  /* ----------------------------- 2 · Your score ---------------------------- */
  pages.push({
    section: "Your score",
    content: (
      <>
        <PageTitle
          kicker={band.label}
          title={band.headline}
          sub={band.summary}
        />

        <div className="mt-9 flex items-center gap-8 rounded-2xl border border-white/12 bg-white/[0.04] p-7">
          <p className="text-[72px] font-black leading-none tracking-[-0.03em] text-brand">
            {data.score}
          </p>
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-white/50">
              Brand Score
            </p>
            <p className="mt-1 max-w-[380px] text-[13.5px] leading-relaxed text-white/60">
              A combined measure of how your brand presents and how visibly it
              competes, scored across the six areas below.
            </p>
          </div>
        </div>

        <div className="mt-9 grid gap-4">
          {CATEGORY_ORDER.map((category) => {
            const value = data.categoryScores[category];
            return (
              <div key={category} className="flex items-center gap-5">
                <p className="w-[150px] text-[13.5px] font-bold text-white">
                  {CATEGORY_LABELS[category]}
                </p>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      value >= 7
                        ? "bg-brand"
                        : value >= 4
                          ? "bg-brand/55"
                          : "bg-white/30",
                    )}
                    style={{ width: `${Math.max(value * 10, 4)}%` }}
                  />
                </div>
                <p className="w-10 text-right text-[13.5px] font-bold text-white">
                  {value}/10
                </p>
                <p
                  className={cn(
                    "w-[86px] text-right text-[11px] font-bold uppercase tracking-[0.12em]",
                    value >= 6 ? "text-brand" : "text-white/45",
                  )}
                >
                  {categoryVerdict(value)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-auto rounded-2xl border border-white/12 p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
            How this was measured
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
            Your score combines your own answers across the six brand areas with
            a live benchmark of your market{" "}
            {data.benchmark?.benchmarkScore != null
              ? "(real Google search results for your sector and region, weighted 50/50 with your self-assessment)."
              : "where live search data was available. Nothing in this report is fabricated: where a figure is an estimate, it says so."}
          </p>
        </div>
      </>
    ),
  });

  /* --------------------------- 3 · Your identity --------------------------- */
  if (userBrand) {
    pages.push({
      section: "Your identity",
      content: <IdentitySheet brand={userBrand} company={data.company} />,
    });
  }

  /* ---------------------------- 4 · Your market ---------------------------- */
  pages.push({
    section: "Your market",
    content: (
      <>
        <PageTitle
          kicker={sectorLabel}
          title="How your market actually buys."
          sub={playbook.marketIntro}
        />

        <div className="mt-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
            {data.benchmark && data.benchmark.terms.length > 0
              ? "What we checked on Google"
              : "The visibility reality"}
          </p>
          {data.benchmark && data.benchmark.terms.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {data.benchmark.terms.slice(0, 6).map((term) => (
                <span
                  key={term}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-[12.5px] font-medium text-white/70"
                >
                  “{term}”
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 max-w-[520px] text-[13.5px] leading-relaxed text-white/60">
              Page 1 of Google for your core service and area is where your
              market shortlists. The businesses holding those positions collect
              the demand everyone else generates.
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Your best position found
            </p>
            <p className="mt-3 text-[44px] font-black leading-none text-white">
              {data.benchmark?.userBestPosition != null
                ? `#${data.benchmark.userBestPosition}`
                : "Not found"}
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-white/60">
              {positionNote(
                data.benchmark?.userBestPosition ?? null,
                data.benchmark?.userBestTerm ?? null,
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-brand/40 bg-brand/[0.06] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
              {(data.benchmark?.userBestPosition ?? 99) <= 3
                ? "Who else is on your page 1"
                : "Who owns your page 1"}
            </p>
            {competitors.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {competitors.map((c) => (
                  <div key={c.domain}>
                    <p className="text-[14px] font-bold leading-snug text-white">
                      {c.name || c.domain}
                    </p>
                    <p className="text-[11.5px] font-medium text-white/60">
                      #{c.bestPosition} for “{c.bestTerm}”
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[12.5px] leading-relaxed text-white/60">
                Run the search yourself: your main service plus your area, in an
                incognito window. The names on that page are your real
                competitor set, whatever you think of their work.
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto border-l-2 border-brand pl-5">
          <p className="text-[15px] font-bold leading-relaxed text-white">
            {playbook.positioningInsight}
          </p>
        </div>
      </>
    ),
  });

  /* ------------------------- 5 · The leading brands ------------------------ */
  pages.push({
    section: "The leading brands",
    content: (
      <>
        <PageTitle
          kicker="Side by side"
          title="The brands setting your market's standard."
          sub={
            competitors.length > 0
              ? "Pulled live from the businesses holding your market's top search positions: how they present, and what they lead with."
              : "The standard is set by whoever your buyers see most. Here is what the leading brands in your market consistently get right."
          }
        />

        {competitors.length > 0 ? (
          <div className="mt-9 grid gap-4">
            {competitors.map((c, i) => (
              <div
                key={c.domain}
                className="rounded-2xl border border-white/12 bg-white/[0.04] p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                      Market leader {String(i + 1).padStart(2, "0")}
                    </p>
                    {/* SERP-derived name is short and domain-verified; the
                        scraped site name is often a full meta title. */}
                    <p className="mt-1 text-[19px] font-black leading-snug text-white">
                      {c.name || c.brand?.name || c.domain}
                    </p>
                    <p className="truncate text-[12px] text-white/45">
                      {c.domain} · ranks #{c.bestPosition} for “{c.bestTerm}”
                    </p>
                  </div>
                  {c.brand?.colors && c.brand.colors.length > 0 && (
                    <div className="flex shrink-0 gap-1.5">
                      {c.brand.colors.slice(0, 4).map((color) => (
                        <span
                          key={color}
                          className="size-7 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {(c.brand?.headline || c.brand?.description) && (
                  <p className="mt-3 border-t border-white/10 pt-3 text-[12.5px] italic leading-relaxed text-white/60">
                    “{c.brand.headline || c.brand.description}”
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-9 grid gap-4">
            {playbook.leaderMoves.slice(0, 3).map((move, i) => (
              <div
                key={move.title}
                className="rounded-2xl border border-white/12 bg-white/[0.04] p-6"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Leader habit {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[17px] font-black text-white">
                  {move.title}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
                  {move.detail}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto rounded-2xl border border-brand/40 bg-brand/[0.06] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
            The brand you told us you look up to
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-white">
            {data.marketLeader ? (
              <>
                <strong>{data.marketLeader}</strong> earned that admiration the
                same way every leader in this report did: consistency,
                presentation and visibility, compounding over time. The rest of
                this document is the playbook for closing that gap.
              </>
            ) : (
              <>
                Pick the one brand in your space you would most like to be
                mentioned alongside. Every recommendation in this report moves
                you measurably closer to that standard.
              </>
            )}
          </p>
        </div>
      </>
    ),
  });

  /* ------------------------ 6 · You vs the leaders ------------------------- */
  pages.push({
    section: "You vs the leaders",
    content: (
      <>
        <PageTitle
          kicker="The gap analysis"
          title="Where you're losing ground, and why it matters."
          sub="Your three weakest areas, measured against the standard the leading brands in your market hold. This is where the fastest commercial gains live."
        />

        <div className="mt-9 grid gap-5">
          {weakest.map((category) => {
            const value = data.categoryScores[category];
            const insight = CATEGORY_INSIGHTS[category];
            return (
              <div
                key={category}
                className="rounded-2xl border border-white/12 bg-white/[0.04] p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[16px] font-black text-white">
                    {CATEGORY_LABELS[category]}
                  </p>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/45">
                    You: {value}/10 · Leaders: 9/10
                  </p>
                </div>
                <div className="mt-3 grid gap-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-white/35"
                      style={{ width: `${Math.max(value * 10, 4)}%` }}
                    />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[90%] rounded-full bg-brand" />
                  </div>
                </div>
                <p className="mt-4 text-[12.5px] leading-relaxed text-white/60">
                  {insight.why}
                </p>
              </div>
            );
          })}
        </div>
      </>
    ),
  });

  /* ----------------------- 7 · The leaders' playbook ---------------------- */
  pages.push({
    section: "The leaders' playbook",
    content: (
      <>
        <PageTitle
          kicker={sectorLabel}
          title={`What the leaders in ${playbook.noun} are doing.`}
          sub="Five habits that separate the brands winning your market. None of them require a bigger budget than yours. All of them require consistency."
        />

        <div className="mt-9 grid gap-4">
          {playbook.leaderMoves.map((move, i) => (
            <div key={move.title} className="flex gap-5">
              <p className="w-9 shrink-0 text-[20px] font-black text-brand">
                {String(i + 1).padStart(2, "0")}
              </p>
              <div>
                <p className="text-[15.5px] font-black text-white">
                  {move.title}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">
                  {move.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  });

  /* ----------------------- 8 · Where the market is won -------------------- */
  pages.push({
    section: "Channel playbook",
    content: (
      <>
        <PageTitle
          kicker="Channel by channel"
          title="Where your market is actually won."
          sub={`How the leading brands in ${playbook.noun} run each channel, and the standard your buyers now expect as a minimum.`}
        />

        <div className="mt-9 grid gap-5">
          {(
            [
              ["Website", playbook.channelPlays.website, "website"],
              ["Social", playbook.channelPlays.social, "social"],
              ["Search", playbook.channelPlays.search, "search"],
            ] as [string, string, QuizCategory][]
          ).map(([label, play, category]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/12 bg-white/[0.04] p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[15.5px] font-black text-white">{label}</p>
                <p
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.14em]",
                    data.categoryScores[category] >= 6
                      ? "text-brand"
                      : "text-white/45",
                  )}
                >
                  You score {data.categoryScores[category]}/10 here
                </p>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
                {play}
              </p>
              <p className="mt-3 border-t border-white/10 pt-3 text-[12.5px] leading-relaxed text-white/75">
                <strong className="text-brand">Fastest win: </strong>
                {CATEGORY_INSIGHTS[category].quickWin}
              </p>
            </div>
          ))}
        </div>
      </>
    ),
  });

  /* ----------------------------- 9 · The fixes ---------------------------- */
  pages.push({
    section: "Your 10 fixes",
    content: (
      <>
        <PageTitle
          kicker="Prioritised for you"
          title="Your 10 fixes, in order."
          sub="Sequenced by your scores: the fixes addressing your weakest areas come first. Each one is actionable without waiting on the others."
        />

        <div className="mt-8 grid gap-3.5">
          {data.actions.map((action, i) => (
            <div key={action} className="flex items-start gap-4">
              <p className="w-8 shrink-0 pt-px text-[16px] font-black text-brand">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="text-[13px] leading-relaxed text-white/75">
                {action}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-auto border-t border-white/10 pt-5 text-[12px] leading-relaxed text-white/45">
          Done in-house, this list is roughly a quarter&apos;s design and
          marketing workload. Done with an embedded design team, it is the first
          few weeks. Either way, the order above is the order that pays back
          fastest.
        </p>
      </>
    ),
  });

  /* ---------------------------- 10 · The roadmap -------------------------- */
  pages.push({
    section: "90-day roadmap",
    content: (
      <>
        <PageTitle
          kicker="The plan"
          title="Your next 90 days."
          sub="Three phases: stop the leaks, build the system, then let it compound. Each phase is achievable alongside running the business."
        />

        <div className="mt-9 grid gap-5">
          {ROADMAP.map((phase) => (
            <div
              key={phase.label}
              className="rounded-2xl border border-white/12 bg-white/[0.04] p-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[15.5px] font-black text-white">
                  {phase.label} · {phase.focus}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                  {phase.window}
                </p>
              </div>
              <ul className="mt-3 grid gap-1.5">
                {phase.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-brand" />
                    <p className="text-[12.5px] leading-relaxed text-white/65">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </>
    ),
  });

  /* ------------------------------ 11 · The CTA ---------------------------- */
  pages.push({
    section: "The shortcut",
    content: (
      <div className="flex h-full flex-col">
        <PageTitle
          kicker="Or skip the queue"
          title="Everything in this report, done for you."
          sub={`Milktree is an embedded brand and design team on a flat monthly subscription. We have spent 6 years building 200+ brands, and closing exactly the gaps this report found is what we do every week for businesses in ${playbook.noun}.`}
        />

        <div className="mt-9 grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
            <p className="text-[15px] font-black text-white">Essentials</p>
            <p className="mt-1 text-[24px] font-black text-white">
              £1,999
              <span className="text-[13px] font-bold text-white/45">
                /mo +VAT
              </span>
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
              Unlimited design requests, one at a time. Vetted designers matched
              to each request, quality-checked by a creative director. Work back
              in around 48 hours. Pause or cancel anytime.
            </p>
          </div>
          <div className="rounded-2xl border border-brand/50 bg-brand/[0.07] p-6">
            <p className="text-[15px] font-black text-white">
              Design Lead{" "}
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                Most popular
              </span>
            </p>
            <p className="mt-1 text-[24px] font-black text-white">
              £3,999
              <span className="text-[13px] font-bold text-white/45">
                /mo +VAT
              </span>
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
              Two requests at a time, plus your own dedicated senior designer as
              a permanent design lead, direct on Slack. Full brand builds in 4
              to 6 weeks.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3 text-center">
          {[
            ["200+", "brands built"],
            ["15+", "industries"],
            ["6", "years as an agency"],
            ["50+", "experienced designers"],
          ].map(([stat, label]) => (
            <div key={label} className="rounded-xl border border-white/10 py-3.5">
              <p className="text-[20px] font-black text-white">{stat}</p>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/45">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-2xl bg-brand p-8 text-center">
          <p className="text-[22px] font-black leading-tight tracking-[-0.02em] text-black">
            Your business has outgrown its brand. Let&apos;s fix that.
          </p>
          <p className="mx-auto mt-2 max-w-[420px] text-[12.5px] font-medium leading-relaxed text-black/70">
            Two minutes to tell us what you need. No proposals, no quotes, no
            hourly billing. Just senior design, on tap, from next week.
          </p>
          <a
            href={`${SITE_URL}/start`}
            className="mt-5 inline-block rounded-full bg-black px-9 py-3.5 text-[14px] font-black text-white"
          >
            Get started &rarr;
          </a>
          <p className="mt-3 text-[11px] font-bold text-black/60">
            {SITE_URL.replace("https://www.", "")}/start
          </p>
        </div>
      </div>
    ),
  });

  return (
    <div className="brand-score-doc mx-auto flex w-fit flex-col items-center gap-8 print:gap-0">
      {pages.map((page, i) => (
        <DocPage
          key={i}
          n={i + 1}
          total={pages.length}
          section={page.section}
        >
          {page.content}
        </DocPage>
      ))}
    </div>
  );
}

/* ----------------------------- Identity sheet ------------------------------ */

/**
 * A one-page identity read-out of the lead's own brand, assembled from a live
 * scrape of their site: logo on its own background, palette with roles, type,
 * their primary button, and what we noticed. Every value shown was measured —
 * this page's job is to make the lead see their brand as a designer sees it.
 */
function IdentitySheet({
  brand,
  company,
}: {
  brand: BrandExtract;
  company: string;
}) {
  const roles = brand.colorRoles ?? [];
  const siteBackground =
    roles.find((c) => /background/i.test(c.role))?.hex ??
    (brand.colorScheme === "dark" ? "#000000" : "#FFFFFF");
  const logoTile = logoBackdrop(siteBackground, brand.logoLuminance);
  const swatches = roles.length
    ? roles
    : (brand.colors ?? []).map((hex, i) => ({ role: `Colour ${i + 1}`, hex }));

  const fonts = (
    brand.fontRoles?.length
      ? brand.fontRoles
      : (brand.fonts ?? []).map((family) => ({ family, role: undefined }))
  ).map((font) => ({
    family: font.family,
    role: font.role && font.role !== "unknown" ? font.role : undefined,
  }));
  const headingFont =
    fonts.find((f) => /head|display|title/i.test(f.role ?? ""))?.family ??
    fonts[0]?.family;

  const bodyFont =
    fonts.find((f) => /body|paragraph|primary/i.test(f.role ?? ""))?.family ??
    fonts[fonts.length - 1]?.family ??
    headingFont;
  const scale = typeScaleSteps(brand, headingFont, bodyFont);
  const notes = identityNotes(brand);

  return (
    <>
      <PageTitle
        kicker="Your identity today"
        title="Your brand, as your buyers meet it."
        sub={`Pulled live from ${brand.domain}: the logo, palette, type and words your market actually meets. Laid out the way we would present an identity, so you can judge it as one.`}
      />

      <div className="mt-6 grid grid-cols-[0.85fr_1.15fr] gap-4">
        <div className="flex flex-col">
          <div
            className="flex flex-1 items-center justify-center border border-white/15 px-6"
            style={{ backgroundColor: logoTile.hex }}
          >
            {brand.logo ? (
              /* Arbitrary scraped host: next/image would need every lead's
                 domain allow-listed, and this render is print-only. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logo}
                alt=""
                className="max-h-[64px] max-w-full object-contain"
              />
            ) : (
              <p
                className="text-[24px] font-bold"
                style={{
                  color: inkOn(logoTile.hex),
                  fontFamily: headingFont
                    ? `'${headingFont}', var(--font-satoshi), sans-serif`
                    : undefined,
                }}
              >
                {company}
              </p>
            )}
          </div>
          <p className="mt-2.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/40">
            Logo · {logoTile.caption}
          </p>
        </div>

        <div className="border border-white/12 bg-white/[0.04] p-5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">
            What you lead with
          </p>
          <p
            className="mt-2 text-[19px] font-black leading-[1.15] tracking-[-0.02em] text-white"
            style={{
              fontFamily: headingFont
                ? `'${headingFont}', var(--font-satoshi), sans-serif`
                : undefined,
            }}
          >
            {brand.headline ?? "No primary headline found on your site."}
          </p>
          {brand.description && (
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/55">
              {brand.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
            {[
              brand.tone ? `${brand.tone} tone` : null,
              brand.colorScheme ? `${brand.colorScheme} interface` : null,
              // Long audience strings wrap the row and push the page over.
              brand.audience && brand.audience.length <= 40
                ? brand.audience
                : null,
            ]
              .filter(Boolean)
              .map((chip) => (
                <span
                  key={chip as string}
                  className="border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/50"
                >
                  {chip}
                </span>
              ))}
          </div>
        </div>
      </div>

      {swatches.length > 0 && (
        <div className="mt-4">
          <SheetLabel>Your palette, in the order your site uses it</SheetLabel>
          <div className="mt-2.5 flex gap-2.5">
            {swatches.slice(0, 6).map((swatch) => (
              <div key={swatch.hex + swatch.role} className="min-w-0 flex-1">
                <div
                  className="h-[62px] border border-white/15"
                  style={{ backgroundColor: swatch.hex }}
                />
                <p className="mt-2 text-[10.5px] font-bold leading-none text-white">
                  {swatch.hex}
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-white/40">
                  {humaniseRole(swatch.role)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-[1.25fr_0.75fr] gap-4">
        <div className="flex flex-col border border-white/12 p-5">
          <SheetLabel>Typography</SheetLabel>
          <div className="mt-2.5 grid gap-2.5">
            {fonts.slice(0, 2).map((font) => (
              <div key={font.family} className="flex items-center gap-4">
                <p
                  className="w-[52px] shrink-0 text-[27px] font-bold leading-none text-white"
                  style={{
                    fontFamily: `'${font.family}', var(--font-satoshi), sans-serif`,
                  }}
                >
                  Aa
                </p>
                <div>
                  <p className="text-[13px] font-bold text-white">
                    {font.family}
                  </p>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/40">
                    {font.role ? `${font.role} face` : "In use on site"}
                  </p>
                </div>
              </div>
            ))}
            {fonts.length > 2 && (
              <p className="text-[10px] font-medium text-white/40">
                Also loading: {fonts.slice(2).map((f) => f.family).join(", ")}
              </p>
            )}
          </div>
          {scale.length > 0 && (
            <div className="mt-auto border-t border-white/10 pt-3.5">
              <SheetLabel>Your scale, shown to proportion</SheetLabel>
              <div className="mt-2 grid gap-1">
                {scale.map((step) => (
                  <div
                    key={step.label}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <p
                      className="font-bold leading-tight text-white/85"
                      style={{
                        fontSize: `${step.rendered}px`,
                        fontFamily: `'${step.family}', var(--font-satoshi), sans-serif`,
                      }}
                    >
                      {step.label}
                    </p>
                    <p className="shrink-0 text-[10px] font-bold text-white/40">
                      {step.actual}px
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border border-white/12 p-5">
          <SheetLabel>Your primary action</SheetLabel>
          <div
            className="mt-3.5 flex h-[74px] items-center justify-center border border-white/10"
            style={{ backgroundColor: siteBackground }}
          >
            <span
              className="px-5 py-2.5 text-[12.5px] font-bold"
              style={{
                backgroundColor: brand.button?.background ?? "#000000",
                color: brand.button?.textColor ?? "#FFFFFF",
                borderRadius: radiusCss(brand.button?.radius),
              }}
            >
              {brand.button?.label ?? "Get in touch"}
            </span>
          </div>
          <div className="mt-3.5 grid gap-1.5 border-t border-white/10 pt-3.5">
            <SheetStat label="Button corners" value={describeRadius(brand.button?.radius)} />
            <SheetStat label="Panel corners" value={describeRadius(brand.radius)} />
          </div>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="mt-auto border border-brand/40 bg-brand/[0.06] p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand">
            What a designer notices first
          </p>
          <div className="mt-2 grid gap-2">
            {notes.map((note) => (
              <div key={note.title} className="flex gap-3">
                <span
                  className={cn(
                    "mt-[6px] inline-block size-1.5 shrink-0 rounded-full",
                    note.good ? "bg-brand" : "bg-white/45",
                  )}
                />
                <p className="text-[11.5px] leading-relaxed text-white/65">
                  <strong className="font-bold text-white">
                    {note.title}.
                  </strong>{" "}
                  {note.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SheetLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">
      {children}
    </p>
  );
}

function SheetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <p className="text-[11px] font-medium text-white/45">{label}</p>
      <p className="text-[11.5px] font-bold text-white/80">{value}</p>
    </div>
  );
}

/**
 * Reads the live search position back honestly. A lead already ranking in the
 * top three must not be told their market can't find them, and one nowhere in
 * the results must not be softened.
 */
function positionNote(position: number | null, term: string | null): string {
  const forTerm = term ? ` for “${term}”` : "";
  if (position === null) {
    return "We could not find your brand in the live results we checked. Right now, competitors are collecting the searches your marketing pays to create.";
  }
  if (position <= 3) {
    return `Your strongest live ranking${forTerm}, which puts you ahead of most of your market. Positions like this are won slowly and lost quickly, so the work now is protecting it.`;
  }
  if (position <= 10) {
    return `Your strongest live ranking${forTerm}. You are on page 1, but the names above you take the majority of the clicks.`;
  }
  return `Your strongest live ranking${forTerm}, which is past the point where most buyers stop looking. Everything below page 1 is effectively invisible.`;
}

/**
 * Picks a backdrop the logo is actually visible on. We prefer the site's own
 * background (that's how buyers see it), but a white wordmark built for a dark
 * header would vanish on a white tile, so when the ink and the background sit
 * too close in luminance we flip to the opposite neutral and say so.
 */
function logoBackdrop(
  siteBackground: string,
  logoLuminance?: number | null,
): { hex: string; caption: string } {
  const site = relativeLuminance(siteBackground);
  if (logoLuminance == null || site == null) {
    return {
      hex: siteBackground,
      caption: `on your background ${siteBackground}`,
    };
  }
  if (Math.abs(logoLuminance - site) >= 0.3) {
    return {
      hex: siteBackground,
      caption: `on your background ${siteBackground}`,
    };
  }
  const flipped = logoLuminance > 0.5 ? "#0B0B0A" : "#FFFFFF";
  return {
    hex: flipped,
    caption: `shown on ${logoLuminance > 0.5 ? "black" : "white"} to be legible`,
  };
}

function relativeLuminance(hex: string): number | null {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (full.length !== 6 || /[^0-9a-f]/i.test(full)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * The site's own type scale, rendered proportionally at a size that fits the
 * card. Keeping one scale factor across all three steps is the point: a flat
 * hierarchy on the site shows up as a flat hierarchy here.
 */
function typeScaleSteps(
  brand: BrandExtract,
  headingFont?: string,
  bodyFont?: string,
): { label: string; actual: number; rendered: number; family?: string }[] {
  const px = (value?: string) => {
    const n = Number(value?.match(/-?\d+(\.\d+)?/)?.[0]);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };
  const steps = [
    { label: "Headline", actual: px(brand.typeScale?.h1), family: headingFont },
    { label: "Subhead", actual: px(brand.typeScale?.h2), family: headingFont },
    { label: "Body copy", actual: px(brand.typeScale?.body), family: bodyFont },
  ].filter((s): s is typeof s & { actual: number } => s.actual !== null);
  if (steps.length === 0) return [];

  const largest = Math.max(...steps.map((s) => s.actual));
  const factor = Math.min(1, 28 / largest);
  return steps.map((step) => ({
    ...step,
    rendered: Math.max(9, Math.round(step.actual * factor)),
  }));
}

/** Roles arrive as camelCase API keys ("textPrimary" → "text primary"). */
function humaniseRole(role: string): string {
  return role.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/** Sites report pill radii as absurd pixel values; clamp before rendering. */
function radiusCss(value?: string): string {
  const px = Number(value?.match(/-?\d+(\.\d+)?/)?.[0]);
  if (!Number.isFinite(px)) return "9999px";
  return px > 100 ? "9999px" : `${px}px`;
}

/* ------------------------------- Page frame -------------------------------- */

function DocPage({
  n,
  total,
  section,
  children,
}: {
  n: number;
  total: number;
  section: string;
  children: React.ReactNode;
}) {
  return (
    <section className="doc-page relative flex flex-col overflow-hidden bg-black text-white shadow-[0_10px_60px_-20px_rgba(0,0,0,0.9)] print:shadow-none">
      {n !== 1 && (
        <div className="flex items-center justify-between pb-6">
          <DocWordmark small />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {section}
          </p>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <div className="mt-auto flex items-center justify-between pt-6">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          <span className="inline-block h-[2px] w-4 bg-brand" />
          Brand Score · Milktree
        </p>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          {String(n).padStart(2, "0")} / {total}
        </p>
      </div>
    </section>
  );
}

function PageTitle({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand">
        <span className="inline-block h-[2px] w-5 bg-brand" />
        {kicker}
      </p>
      <h2 className="mt-3 max-w-[560px] text-[30px] font-black leading-[1.06] tracking-[-0.025em] text-white">
        {title}
      </h2>
      {sub && (
        <p className="mt-3 max-w-[580px] text-[13px] leading-relaxed text-white/60">
          {sub}
        </p>
      )}
    </div>
  );
}

function DocWordmark({ small }: { small?: boolean }) {
  return <Wordmark className={small ? "h-[17px]" : "h-[26px]"} />;
}
