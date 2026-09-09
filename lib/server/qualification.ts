import "server-only";

import {
  NEED_OPTIONS,
  SECTOR_OPTIONS,
  TEAM_OPTIONS,
  TIMING_OPTIONS,
  needToProduct,
  type LeadRoute,
  type LeadSubmission,
} from "@/lib/funnel";

/**
 * Routing rules — evaluated ONLY here, server-side (MILKTREE-STUDIO.md §6.10).
 *
 *   sprint / build / subscription  → the product they chose. Book a call.
 *   not-sure, or "just looking"    → nurture: Brand Score quiz + follow-up.
 *
 * Nothing is "unqualified". Team size and sector inform the sales
 * conversation but never change the route. Any route value sent by the
 * client is ignored.
 */
export function evaluateRoute(input: {
  need: LeadSubmission["need"];
  timing: LeadSubmission["timing"];
}): LeadRoute {
  const product = needToProduct(input.need);
  if (!product) return "nurture";
  if (input.timing === "looking") return "nurture";
  return product;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const valueSet = (options: readonly { value: string }[]) =>
  new Set(options.map((o) => o.value));

const NEEDS = valueSet(NEED_OPTIONS);
const SECTORS = valueSet(SECTOR_OPTIONS);
const TEAMS = valueSet(TEAM_OPTIONS);
const TIMINGS = valueSet(TIMING_OPTIONS);

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
  const sector = str(b.sector);
  const teamSize = str(b.teamSize);
  const timing = str(b.timing);
  const company = str(b.company);
  const website = str(b.website);
  const name = str(b.name);
  const email = str(b.email);
  const phone = str(b.phone, 40);
  const consent = b.consent === true;

  if (!NEEDS.has(need)) return { ok: false, error: "Invalid need" };
  if (!SECTORS.has(sector)) return { ok: false, error: "Invalid sector" };
  if (!TEAMS.has(teamSize)) return { ok: false, error: "Invalid team size" };
  if (!TIMINGS.has(timing)) return { ok: false, error: "Invalid timing" };
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
      sector: sector as LeadSubmission["sector"],
      teamSize: teamSize as LeadSubmission["teamSize"],
      timing: timing as LeadSubmission["timing"],
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
