import "server-only";

import { getSupabase } from "@/lib/server/supabase";
import {
  computeCategoryScores,
  computeFinalScore,
  computeSelfScore,
  selectActions,
} from "@/lib/server/quiz-scoring";
import type { BrandScoreDocData } from "@/components/doc/brand-score-document";
import type { BenchmarkResult, QuizAnswers, SectorValue } from "@/lib/quiz";

/**
 * Loads a quiz session as Brand Score document data. Shared by the internal
 * review page (which adds the toolbar and provenance strip) and the
 * lead-facing document page at /brand-score-doc/[sessionId]/download.
 */

export type BrandScoreDocPageData = {
  sessionId: string;
  publishedUrl: string | null;
  /** Set once the lead finished the quiz — the document is only real then. */
  completedAt: string | null;
  doc: BrandScoreDocData;
};

export async function loadBrandScoreDoc(
  sessionId: string,
): Promise<BrandScoreDocPageData | null> {
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
  const selfScore =
    (session.self_score as number | null) ?? computeSelfScore(categoryScores);
  const benchmark = (session.benchmark as BenchmarkResult | null) ?? null;
  const score =
    (session.final_score as number | null) ??
    computeFinalScore(selfScore, benchmark?.benchmarkScore ?? null);

  return {
    sessionId: session.id as string,
    publishedUrl: (session.doc_url as string | null) ?? null,
    completedAt: (session.completed_at as string | null) ?? null,
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

export function formatDate(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
