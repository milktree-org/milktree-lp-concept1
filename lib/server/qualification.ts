import "server-only";

import {
  NEED_OPTIONS,
  TEAM_OPTIONS,
  MARKETING_OPTIONS,
  BUDGET_OPTIONS,
  type LeadRoute,
  type LeadSubmission,
} from "@/lib/funnel";

/**
 * Qualification rules — evaluated ONLY here, server-side.
 * QUALIFIED   = budget ≥ the £1,000–£2,000 band → straight to the Cal booking.
 * UNQUALIFIED = budget under £1,000 → "not the right time" + Brand Score quiz.
 * Team size informs the sales conversation but never disqualifies a lead.
 * Any route value sent by the client is ignored.
 */
const QUALIFIED_BUDGETS = new Set(["1k-2k", "2k-4k", "4k+"]);

export function evaluateRoute(input: {
  teamSize: string;
  budget: string;
}): LeadRoute {
  return QUALIFIED_BUDGETS.has(input.budget) ? "qualified" : "unqualified";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const valueSet = (options: readonly { value: string }[]) =>
  new Set(options.map((o) => o.value));

const NEEDS = valueSet(NEED_OPTIONS);
const TEAMS = valueSet(TEAM_OPTIONS);
const MARKETING = valueSet(MARKETING_OPTIONS);
const BUDGETS = valueSet(BUDGET_OPTIONS);

export type ValidationResult =
  | { ok: true; data: LeadSubmission }
  | { ok: false; error: string };

/** Validate the raw request body into a LeadSubmission. */
export function validateLeadSubmission(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid payload" };
  }
  const b = body as Record<string, unknown>;

  const str = (v: unknown, max = 300) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const need = str(b.need);
  const teamSize = str(b.teamSize);
  const marketing = str(b.marketing);
  const budget = str(b.budget);
  const company = str(b.company);
  const website = str(b.website);
  const name = str(b.name);
  const email = str(b.email);
  const phone = str(b.phone, 40);
  const consent = b.consent === true;

  if (!NEEDS.has(need)) return { ok: false, error: "Invalid need" };
  if (!TEAMS.has(teamSize)) return { ok: false, error: "Invalid team size" };
  if (!MARKETING.has(marketing))
    return { ok: false, error: "Invalid marketing answer" };
  if (!BUDGETS.has(budget)) return { ok: false, error: "Invalid budget" };
  if (!company) return { ok: false, error: "Company name is required" };
  if (!name) return { ok: false, error: "Name is required" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Invalid email" };

  let attribution: Record<string, string> | undefined;
  if (typeof b.attribution === "object" && b.attribution !== null) {
    attribution = {};
    for (const [k, v] of Object.entries(b.attribution as Record<string, unknown>)) {
      if (typeof v === "string" && attribution && Object.keys(attribution).length < 40) {
        attribution[k.slice(0, 64)] = v.slice(0, 500);
      }
    }
  }

  return {
    ok: true,
    data: {
      need: need as LeadSubmission["need"],
      teamSize: teamSize as LeadSubmission["teamSize"],
      marketing: marketing as LeadSubmission["marketing"],
      budget: budget as LeadSubmission["budget"],
      company,
      website,
      name,
      email,
      phone: phone || undefined,
      consent,
      attribution,
    },
  };
}
