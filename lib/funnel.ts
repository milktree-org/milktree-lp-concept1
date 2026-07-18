/**
 * Shared definitions for the multistep qualification form (§4).
 * Pure data — safe to import from both client components and API routes.
 * Qualification EVALUATION lives server-side in lib/server/qualification.ts.
 */

export const NEED_OPTIONS = [
  { value: "ongoing", label: "Ongoing design support" },
  { value: "brand-build", label: "A full brand build" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const TEAM_OPTIONS = [
  { value: "just-me", label: "Just me" },
  { value: "2-9", label: "2–9" },
  { value: "10-50", label: "10–50" },
  { value: "51-100", label: "51–100" },
  { value: "100+", label: "100+" },
] as const;

export const MARKETING_OPTIONS = [
  { value: "team", label: "Yes, a team" },
  { value: "one", label: "One marketer" },
  { value: "founder", label: "No — founder does it" },
] as const;

export const BUDGET_OPTIONS = [
  { value: "under-1k", label: "Under £1,000" },
  { value: "1k-2k", label: "£1,000–£2,000" },
  { value: "2k-4k", label: "£2,000–£4,000" },
  { value: "4k+", label: "£4,000+" },
] as const;

export type NeedValue = (typeof NEED_OPTIONS)[number]["value"];
export type TeamValue = (typeof TEAM_OPTIONS)[number]["value"];
export type MarketingValue = (typeof MARKETING_OPTIONS)[number]["value"];
export type BudgetValue = (typeof BUDGET_OPTIONS)[number]["value"];

export type LeadSubmission = {
  need: NeedValue;
  teamSize: TeamValue;
  marketing: MarketingValue;
  budget: BudgetValue;
  company: string;
  website: string;
  name: string;
  email: string;
  phone?: string;
  consent: boolean;
  attribution?: Record<string, string>;
};

export type LeadRoute = "qualified" | "unqualified";

export const optionLabel = (
  options: readonly { value: string; label: string }[],
  value: string,
) => options.find((o) => o.value === value)?.label ?? value;
