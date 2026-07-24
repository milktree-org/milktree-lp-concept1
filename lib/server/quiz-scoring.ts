import "server-only";

import {
  QUIZ_QUESTIONS,
  selectActions,
  type QuizAnswers,
  type QuizCategory,
} from "@/lib/quiz";

// The action library lives in lib/quiz.ts so the Brand Score document
// (client-side) can use the same fixes engine.
export { selectActions };

/**
 * Self-assessment scoring (§5.2/§5.4). Each answer maps to a 0–10 category
 * score; the self score is the mean scaled to /100. When benchmark data
 * exists, the final Brand Score is 50% self-assessment / 50% benchmark.
 */

export function computeCategoryScores(
  answers: QuizAnswers,
): Record<QuizCategory, number> {
  const scores = {} as Record<QuizCategory, number>;
  for (const q of QUIZ_QUESTIONS) {
    const answer = answers[q.id];
    const option = q.options.find((o) => o.value === answer);
    scores[q.id] = option ? option.score : 0;
  }
  return scores;
}

export function computeSelfScore(scores: Record<QuizCategory, number>): number {
  const values = Object.values(scores);
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10);
}

export function computeFinalScore(
  selfScore: number,
  benchmarkScore: number | null,
): number {
  if (benchmarkScore === null) return selfScore;
  return Math.round(selfScore * 0.5 + benchmarkScore * 0.5);
}

export function weakestCategories(
  scores: Record<QuizCategory, number>,
  count = 3,
): QuizCategory[] {
  return (Object.entries(scores) as [QuizCategory, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, count)
    .map(([category]) => category);
}

