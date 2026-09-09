/**
 * Shared definitions for the multistep start form (MILKTREE-STUDIO.md §6.10).
 * Pure data — safe to import from both client components and API routes.
 * Routing lives server-side in lib/server/qualification.ts.
 */
import type { StartProduct } from "@/lib/offer";

/** Step 1: what do you need? Maps straight onto the offer ladder. */
export const NEED_OPTIONS = [
  { value: "sprint", label: "Fix one thing", hint: "Homepage, deck or identity. Two weeks." },
  { value: "build", label: "Build or rebuild the brand", hint: "The whole thing, four to six weeks." },
  { value: "subscription", label: "Ongoing design support", hint: "A queue that never runs dry." },
  { value: "not-sure", label: "Not sure yet", hint: "We'll point you at the right one." },
] as const;

/** Step 2: sector. The six the portfolio proves, plus other. */
export const SECTOR_OPTIONS = [
  { value: "hospitality", label: "Hospitality and food" },
  { value: "property-finance", label: "Property and finance" },
  { value: "trades", label: "Trades and construction" },
  { value: "retail", label: "Retail and consumer" },
  { value: "automotive", label: "Automotive" },
  { value: "health", label: "Health and aesthetics" },
  { value: "other", label: "Something else" },
] as const;

/** Step 3: team size. Informs the conversation, never disqualifies. */
export const TEAM_OPTIONS = [
  { value: "just-me", label: "Just me" },
  { value: "2-9", label: "2–9" },
  { value: "10-50", label: "10–50" },
  { value: "51-100", label: "51–100" },
  { value: "100+", label: "100+" },
] as const;

/** Step 4: when? */
export const TIMING_OPTIONS = [
  { value: "this-month", label: "This month" },
  { value: "next-month", label: "Next month or so" },
  { value: "looking", label: "Just looking for now" },
] as const;

export type NeedValue = (typeof NEED_OPTIONS)[number]["value"];
export type SectorValue = (typeof SECTOR_OPTIONS)[number]["value"];
export type TeamValue = (typeof TEAM_OPTIONS)[number]["value"];
export type TimingValue = (typeof TIMING_OPTIONS)[number]["value"];

export type LeadSubmission = {
  need: NeedValue;
  sector: SectorValue;
  teamSize: TeamValue;
  timing: TimingValue;
  company: string;
  website: string;
  name: string;
  email: string;
  phone?: string;
  consent: boolean;
  attribution?: Record<string, string>;
};

/**
 * Where a submission goes next. Every submission is a lead; "nurture" is a
 * softer next step, not a rejection.
 */
export type LeadRoute = StartProduct | "nurture";

export const optionLabel = (
  options: readonly { value: string; label: string }[],
  value: string,
) => options.find((o) => o.value === value)?.label ?? value;

/** A "need" value that is also a product door on the ladder. */
export function needToProduct(need: NeedValue): StartProduct | null {
  return need === "not-sure" ? null : need;
}
