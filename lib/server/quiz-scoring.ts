import "server-only";

import {
  QUIZ_QUESTIONS,
  type QuizAnswers,
  type QuizCategory,
} from "@/lib/quiz";

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

/* ------------------------ Rules-based action library ---------------------- */
// Keyed to categories; the 3 on-screen fixes come from the weakest categories,
// the email carries the full 10.

const ACTION_LIBRARY: Record<QuizCategory, string[]> = {
  consistency: [
    "Create a one-page brand sheet (logo rules, 2 fonts, 4 colours) and apply it to your next 10 posts.",
    "Audit your last 20 outputs (posts, decks, emails) against your brand sheet and bin every off-brand template.",
  ],
  freshness: [
    "List the 3 places your brand looks most dated (usually: website header, social templates, proposal deck) and refresh those first, not everything at once.",
    "Benchmark your logo and palette against the top 3 in your market; if you look 5 years older, a refresh is overdue.",
  ],
  resource: [
    "Stop DIY-ing hero assets. Keep Canva for internal docs; put anything customer-facing through a designer.",
    "Set a monthly design budget line, even £500, so design stops competing with ad spend for leftovers.",
  ],
  social: [
    "Build a 4-template posting system (tip, proof, offer, behind-the-scenes) so posting takes 15 minutes, not an afternoon.",
    "Commit to 2 posts a week for 6 weeks. Consistency beats volume, and the algorithm rewards the streak.",
  ],
  website: [
    "Rewrite your homepage headline to say what you do, for whom, in under 10 words. Clarity converts before beauty.",
    "Add one clear primary call-to-action above the fold and remove every competing button.",
  ],
  search: [
    "Google your main service + your area in an incognito window. Note who owns page 1: that's your real competitor set.",
    "Create one genuinely useful page per core service targeting '[service] + [area]'. Most local rivals still haven't.",
    "Claim and fully complete your Google Business Profile (photos, services, weekly posts). It's the fastest page-1 win.",
  ],
};

/** Ordered actions: weakest categories first, deduped, capped at 10. */
export function selectActions(
  scores: Record<QuizCategory, number>,
): string[] {
  const ordered = (Object.entries(scores) as [QuizCategory, number][]).sort(
    (a, b) => a[1] - b[1],
  );
  const actions: string[] = [];
  // First pass: one action per category, weakest first.
  for (const [category] of ordered) {
    const pool = ACTION_LIBRARY[category];
    if (pool[0]) actions.push(pool[0]);
  }
  // Second pass: remaining actions, weakest first.
  for (const [category] of ordered) {
    for (const action of ACTION_LIBRARY[category].slice(1)) {
      if (actions.length >= 10) break;
      if (!actions.includes(action)) actions.push(action);
    }
  }
  return actions.slice(0, 10);
}
