/**
 * Careers application — shared definitions for the multistep form.
 * Pure data, safe to import anywhere. Field names mirror the original
 * Formspree careers form so submissions stay consistent in the same inbox.
 */

/** Formspree endpoint the old careers form posted to. */
export const CAREERS_FORM_ENDPOINT = "https://formspree.io/f/xrejwdnk";

export const ROLE_OPTIONS = [
  { value: "graphic-designer", label: "Graphic designer" },
  { value: "brand-designer", label: "Brand designer" },
  { value: "web-designer", label: "Web & digital designer" },
  { value: "motion-designer", label: "Motion designer" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: "0-2", label: "0–2 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "6-9", label: "6–9 years" },
  { value: "10+", label: "10+ years" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Freelance", label: "Freelance / project-based" },
] as const;

export const AI_USAGE_OPTIONS = [
  { value: "Daily user", label: "Daily — it's part of my workflow" },
  { value: "Occasionally", label: "Occasionally, for the right task" },
  { value: "Not yet", label: "Not yet, but keen to learn" },
] as const;

export const HEARD_FROM_OPTIONS = [
  { value: "Instagram", label: "Instagram" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Referral", label: "A friend or colleague" },
  { value: "Search", label: "Google search" },
  { value: "Other", label: "Somewhere else" },
] as const;

export const careers = {
  eyebrow: "Careers",
  headline: "World-class talent, wherever it lives.",
  sub: "Milktree is a senior, remote-first design team building 200+ brands and counting. If you sweat the details and ship fast, we want to see your work.",
  perks: [
    "Fully remote — work from anywhere",
    "Senior team, zero busywork",
    "Real brands, shipped fast",
  ],
} as const;
