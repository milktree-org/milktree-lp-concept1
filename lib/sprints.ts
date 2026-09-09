/**
 * Completed Brand Reset Sprints, for the before-and-after component
 * (docs/PRD.md 3.2). Empty until two real sprints have shipped: the sprint
 * page renders the section only when this has entries. Never add a sprint
 * that didn't happen. Images live in /public/sprints/<slug>/.
 */
export type SprintCase = {
  slug: string;
  client: string;
  /** Which sprint: homepage, deck or identity. */
  kind: "homepage" | "deck" | "identity";
  /** The one thing that was bothering them, in their words if possible. */
  problem: string;
  /** What changed, in one or two sentences. */
  fix: string;
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  /** Optional link to a fuller case study. */
  href?: string;
};

export const sprintCases: SprintCase[] = [];
