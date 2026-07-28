import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandScoreDocument } from "@/components/doc/brand-score-document";
import { DocToolbar } from "@/components/doc/doc-toolbar";
import {
  loadBrandScoreDoc,
  formatDate,
  type BrandScoreDocPageData,
} from "@/lib/server/brand-score-doc-data";
import {
  computeCategoryScores,
  computeFinalScore,
  computeSelfScore,
  selectActions,
} from "@/lib/server/quiz-scoring";
import {
  SECTORS,
  type BenchmarkResult,
  type QuizAnswers,
  type SectorValue,
} from "@/lib/quiz";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brand Score document — internal review",
  robots: { index: false, follow: false },
};

type Params = Promise<{ sessionId: string }>;
type SearchParams = Promise<{ k?: string }>;

/**
 * Internal review page for the Brand Score document. Gated by
 * DOC_REVIEW_KEY (?k=...); in production with no key configured it 404s.
 * `/brand-score-doc/preview` renders sample data for design review without
 * a database.
 */
export default async function BrandScoreDocPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { sessionId } = await params;
  const { k } = await searchParams;

  const requiredKey = process.env.DOC_REVIEW_KEY;
  if (requiredKey ? k !== requiredKey : process.env.NODE_ENV === "production") {
    notFound();
  }

  const data =
    sessionId === "preview" ? previewData() : await loadBrandScoreDoc(sessionId);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-[#181818] pb-16 print:min-h-0 print:bg-black print:pb-0">
      <DocToolbar
        sessionId={data.sessionId}
        reviewKey={k ?? ""}
        publishedUrl={data.publishedUrl}
      />
      <TermProvenance benchmark={data.doc.benchmark} sector={data.doc.sector} />
      <div className="pt-10 print:pt-0">
        <BrandScoreDocument data={data.doc} />
      </div>
    </div>
  );
}

/**
 * Internal-only provenance strip: how the market search terms were chosen,
 * and whether the business's inferred category disagrees with the sector the
 * lead picked (which drives the document's advice playbook). Hidden in print,
 * so it can never leak into the published PDF.
 */
function TermProvenance({
  benchmark,
  sector,
}: {
  benchmark: BenchmarkResult | null;
  sector: SectorValue;
}) {
  if (!benchmark?.termSource) return null;

  const sourceLabel: Record<string, string> = {
    inferred: `Terms inferred from the business's own site${
      benchmark.inferredCategory ? ` — ${benchmark.inferredCategory}` : ""
    }`,
    "sector-default": "Terms from the sector template",
    manual: "Terms set manually via rebenchmark",
  };
  const pickedLabel =
    SECTORS.find((s) => s.value === sector)?.label ?? sector;
  const inferredLabel = benchmark.inferredSector
    ? (SECTORS.find((s) => s.value === benchmark.inferredSector)?.label ??
      benchmark.inferredSector)
    : null;

  return (
    <div className="border-b border-white/10 bg-black/60 print:hidden">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-[11px] font-medium text-white/50">
        <span>
          {sourceLabel[benchmark.termSource] ?? benchmark.termSource}:{" "}
          <span className="text-white/75">
            {benchmark.terms.map((t) => `“${t}”`).join(" · ")}
          </span>
        </span>
        {benchmark.termSource === "sector-default" &&
          benchmark.inferredCategory && (
            <span>
              Site reads as{" "}
              <span className="text-white/75">{benchmark.inferredCategory}</span>{" "}
              (weak signal — defaults kept)
            </span>
          )}
        {inferredLabel && (
          <span className="font-bold text-brand">
            Sector mismatch: picked {pickedLabel}, business reads as{" "}
            {inferredLabel} — check the playbook advice before publishing
          </span>
        )}
      </div>
    </div>
  );
}

/** Sample data for design review without a database session. */
function previewData(): BrandScoreDocPageData {
  const answers: QuizAnswers = {
    consistency: "patchy",
    freshness: "3-5",
    resource: "freelance",
    social: "monthly",
    website: "okay",
    search: "no",
  };
  const categoryScores = computeCategoryScores(answers);
  const benchmark: BenchmarkResult = {
    tier: "full",
    terms: [
      "commercial fit-out london",
      "office refurbishment london",
      "design and build contractor london",
    ],
    competitors: [
      {
        domain: "example-projects.co.uk",
        name: "Example Projects",
        bestPosition: 1,
        bestTerm: "commercial fit-out london",
        brand: {
          domain: "example-projects.co.uk",
          name: "Example Projects",
          colors: ["#0A1F44", "#F5F1EA", "#C8A24B"],
          headline: "Workspaces that work harder.",
        },
      },
      {
        domain: "buildco-interiors.co.uk",
        name: "Buildco Interiors",
        bestPosition: 2,
        bestTerm: "office refurbishment london",
        brand: {
          domain: "buildco-interiors.co.uk",
          name: "Buildco Interiors",
          colors: ["#111111", "#E84E1B", "#FFFFFF"],
          headline: "London's design and build specialists.",
        },
      },
      {
        domain: "formandfit.co.uk",
        name: "Form & Fit",
        bestPosition: 3,
        bestTerm: "design and build contractor london",
        brand: {
          domain: "formandfit.co.uk",
          name: "Form & Fit",
          colors: ["#1D3A2F", "#DCE5DF", "#EFB63D"],
          headline: "From first sketch to final fix.",
        },
      },
    ],
    userBestPosition: 24,
    userBestTerm: "office refurbishment london",
    benchmarkScore: 31,
    userBrand: {
      domain: "harlandinteriors.example.co.uk",
      name: "Harland & Co Interiors",
      headline: "Harland & Co — Commercial interiors, fit-out and refurbishment",
      description:
        "Family-run commercial interior specialists working across London and the South East since 1998.",
      colors: ["#2F4858", "#C7452F", "#E8B33A", "#FFFFFF", "#767676"],
      colorRoles: [
        { role: "primary", hex: "#2F4858" },
        { role: "secondary", hex: "#C7452F" },
        { role: "accent", hex: "#E8B33A" },
        { role: "background", hex: "#FFFFFF" },
        { role: "textPrimary", hex: "#767676" },
      ],
      fonts: ["Open Sans", "Georgia"],
      fontRoles: [
        { family: "Open Sans", role: "body" },
        { family: "Georgia", role: "heading" },
      ],
      typeScale: { h1: "38px", h2: "32px", body: "16px" },
      radius: "6px",
      button: {
        label: "Request a quote",
        background: "#C7452F",
        textColor: "#FFFFFF",
        radius: "0px",
      },
      colorScheme: "light",
      tone: "traditional",
    },
  };
  const selfScore = computeSelfScore(categoryScores);

  return {
    sessionId: "preview",
    publishedUrl: null,
    completedAt: new Date().toISOString(),
    doc: {
      sessionId: "preview",
      company: "Harland & Co Interiors",
      contactName: "Sarah Harland",
      jobRole: "Managing Director",
      email: "sarah@example.co.uk",
      website: "harlandinteriors.example.co.uk",
      sector: "construction",
      region: "London",
      marketLeader: "Example Projects",
      score: computeFinalScore(selfScore, benchmark.benchmarkScore),
      categoryScores,
      actions: selectActions(categoryScores),
      benchmark,
      date: formatDate(new Date().toISOString()),
    },
  };
}

