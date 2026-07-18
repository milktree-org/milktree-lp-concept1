/**
 * Design Hire Calculator — the cost model. Pure data + math, safe to import
 * from both the client component and the API route/email template.
 *
 * Every line item is defensible with a straight face:
 *  - Employer NI: 15% above the £5,000 secondary threshold (2025/26 rates).
 *  - Pension: 3% employer auto-enrolment minimum.
 *  - Recruitment: 20% agency fee, or ~£2,500 in job ads + screening time direct.
 *  - Software & kit: Figma/Adobe seats, stock, fonts, a laptop amortised.
 *  - Ramp-up: industry-standard ~3 months to full productivity ≈ half output.
 */

export const ROLE_OPTIONS = [
  { value: "mid", label: "Midweight designer", salary: 38000 },
  { value: "senior", label: "Senior designer", salary: 50000 },
  { value: "lead", label: "Design lead", salary: 65000 },
  { value: "head", label: "Head of design", salary: 80000 },
] as const;

export type RoleValue = (typeof ROLE_OPTIONS)[number]["value"];

export const LOCATION_OPTIONS = [
  { value: "london", label: "London", multiplier: 1.15 },
  { value: "uk", label: "Rest of UK", multiplier: 1 },
] as const;

export type LocationValue = (typeof LOCATION_OPTIONS)[number]["value"];

export const HIRING_OPTIONS = [
  { value: "agency", label: "Recruitment agency" },
  { value: "direct", label: "Hiring direct" },
] as const;

export type HiringValue = (typeof HIRING_OPTIONS)[number]["value"];

export const SALARY_MIN = 30000;
export const SALARY_MAX = 100000;
export const SALARY_STEP = 1000;

/** Employer NI secondary threshold + rate (2025/26). */
const NI_THRESHOLD = 5000;
const NI_RATE = 0.15;
const PENSION_RATE = 0.03;
const AGENCY_FEE_RATE = 0.2;
const DIRECT_HIRE_COST = 2500;
const SOFTWARE_AND_KIT = 3200;
/** First 3 months at ~half output = 12.5% of annual salary. */
const RAMP_RATE = 0.125;

export type CostLine = { label: string; detail: string; amount: number };

export type CostBreakdown = {
  lines: CostLine[];
  total: number;
  monthly: number;
};

export function defaultSalary(role: RoleValue, location: LocationValue): number {
  const base = ROLE_OPTIONS.find((r) => r.value === role)?.salary ?? 65000;
  const mult =
    LOCATION_OPTIONS.find((l) => l.value === location)?.multiplier ?? 1;
  return Math.round((base * mult) / 500) * 500;
}

export function calculateHireCost(input: {
  salary: number;
  hiring: HiringValue;
}): CostBreakdown {
  const { salary, hiring } = input;
  const ni = Math.max(0, Math.round((salary - NI_THRESHOLD) * NI_RATE));
  const pension = Math.round(salary * PENSION_RATE);
  const recruitment =
    hiring === "agency" ? Math.round(salary * AGENCY_FEE_RATE) : DIRECT_HIRE_COST;
  const ramp = Math.round(salary * RAMP_RATE);

  const lines: CostLine[] = [
    { label: "Base salary", detail: "What the job ad says", amount: salary },
    {
      label: "Employer National Insurance",
      detail: "15% above the £5,000 threshold",
      amount: ni,
    },
    {
      label: "Pension contribution",
      detail: "3% auto-enrolment minimum",
      amount: pension,
    },
    {
      label: "Recruitment",
      detail:
        hiring === "agency"
          ? "Typical 20% agency placement fee"
          : "Job ads, screening and interview time",
      amount: recruitment,
    },
    {
      label: "Software, kit & seat",
      detail: "Figma, Adobe, fonts, stock, laptop",
      amount: SOFTWARE_AND_KIT,
    },
    {
      label: "Ramp-up time",
      detail: "First 3 months at half speed",
      amount: ramp,
    },
  ];

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total, monthly: Math.round(total / 12) };
}

/** Milktree annual plan costs for the comparison block. */
export const PLAN_COSTS = {
  essentials: { name: "Essentials", monthly: 1999, annual: 1999 * 12 },
  designLead: { name: "Design Lead", monthly: 3999, annual: 3999 * 12 },
} as const;

export function formatGBP(value: number): string {
  return `£${Math.round(value).toLocaleString("en-GB")}`;
}
