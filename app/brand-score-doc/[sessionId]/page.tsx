import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BrandScoreDocument,
  type BrandScoreDocData,
} from "@/components/doc/brand-score-document";
import { DocToolbar } from "@/components/doc/doc-toolbar";
import { getSupabase } from "@/lib/server/supabase";
import {
  computeCategoryScores,
  computeFinalScore,
  computeSelfScore,
  selectActions,
} from "@/lib/server/quiz-scoring";
import type { BenchmarkResult, QuizAnswers, SectorValue } from "@/lib/quiz";

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
    sessionId === "preview" ? previewData() : await loadSession(sessionId);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-[#181818] pb-16 print:min-h-0 print:bg-black print:pb-0">
      <DocToolbar
        sessionId={data.sessionId}
        reviewKey={k ?? ""}
        publishedUrl={data.publishedUrl}
      />
      <div className="pt-10 print:pt-0">
        <BrandScoreDocument data={data.doc} />
      </div>
    </div>
  );
}

type PageData = {
  sessionId: string;
  publishedUrl: string | null;
  doc: BrandScoreDocData;
};

async function loadSession(sessionId: string): Promise<PageData | null> {
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: session, error } = await supabase
    .from("quiz_sessions")
    .select(
      "id, name, job_role, company, website, sector, region, email, market_leader, answers, self_score, final_score, benchmark, doc_url, completed_at, created_at",
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !session) return null;

  const answers = (session.answers ?? {}) as QuizAnswers;
  const categoryScores = computeCategoryScores(answers);
  const selfScore = (session.self_score as number | null) ?? computeSelfScore(categoryScores);
  const benchmark = (session.benchmark as BenchmarkResult | null) ?? null;
  const score =
    (session.final_score as number | null) ??
    computeFinalScore(selfScore, benchmark?.benchmarkScore ?? null);

  return {
    sessionId: session.id as string,
    publishedUrl: (session.doc_url as string | null) ?? null,
    doc: {
      sessionId: session.id as string,
      company: (session.company as string | null) ?? "Your company",
      contactName: (session.name as string | null) ?? "",
      jobRole: (session.job_role as string | null) ?? "",
      email: (session.email as string | null) ?? "",
      website: (session.website as string | null) ?? "",
      sector: ((session.sector as string | null) ?? "other") as SectorValue,
      region: (session.region as string | null) ?? "",
      marketLeader: (session.market_leader as string | null) ?? "",
      score,
      categoryScores,
      actions: selectActions(categoryScores),
      benchmark,
      date: formatDate(
        (session.completed_at as string | null) ??
          (session.created_at as string | null),
      ),
    },
  };
}

/** Sample data for design review without a database session. */
function previewData(): PageData {
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
  };
  const selfScore = computeSelfScore(categoryScores);

  return {
    sessionId: "preview",
    publishedUrl: null,
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

function formatDate(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
