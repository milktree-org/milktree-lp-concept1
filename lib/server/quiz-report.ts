import "server-only";

import { docDownloadUrl, quizReportEmail } from "./emails";
import {
  computeCategoryScores,
  computeFinalScore,
  computeSelfScore,
  selectActions,
} from "./quiz-scoring";
import type { BenchmarkResult, QuizAnswers } from "@/lib/quiz";

/**
 * The lead's Brand Score email, composed from their stored answers.
 *
 * Shared by quiz completion (which schedules it) and document publishing
 * (which sends it early, once the document link is live) so the lead can only
 * ever receive one version of this email, no matter which path sends it.
 */
export function composeReportEmail(session: {
  id: string;
  company: string | null;
  answers: QuizAnswers;
  benchmark: BenchmarkResult | null;
}): { subject: string; html: string; text: string; score: number } {
  const categoryScores = computeCategoryScores(session.answers);
  const score = computeFinalScore(
    computeSelfScore(categoryScores),
    session.benchmark?.benchmarkScore ?? null,
  );

  const email = quizReportEmail({
    company: session.company ?? "Your brand",
    score,
    categoryScores,
    actions: selectActions(categoryScores),
    benchmark: session.benchmark,
    // Safe to include before the PDF exists: the link resolves to the document
    // once it's published, and holds a status page until then.
    docUrl: docDownloadUrl(session.id),
  });

  return { ...email, score };
}
