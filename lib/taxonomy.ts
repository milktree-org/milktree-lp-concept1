/**
 * Shared vocab for the studio site: the sectors the portfolio proves and the
 * disciplines the studio sells. Used by case studies (lib/work.ts), the /work
 * filters, the service pages and the audience pages so a tag means the same
 * thing everywhere. Pure data.
 */

export const SECTORS = [
  { slug: "hospitality", label: "Hospitality", short: "Hospitality and food" },
  { slug: "property-finance", label: "Property and finance", short: "Property and finance" },
  { slug: "trades", label: "Trades and construction", short: "Trades" },
  { slug: "retail", label: "Retail and consumer", short: "Retail" },
  { slug: "automotive", label: "Automotive", short: "Automotive" },
  { slug: "health", label: "Health and aesthetics", short: "Health" },
  { slug: "other", label: "Other", short: "Other" },
] as const;

export type SectorSlug = (typeof SECTORS)[number]["slug"];

export const DISCIPLINES = [
  { slug: "brand-identity", label: "Brand identity" },
  { slug: "campaigns", label: "Campaigns and social" },
  { slug: "web", label: "Web and product" },
  { slug: "print", label: "Print, packaging and outdoor" },
  { slug: "decks", label: "Decks and collateral" },
] as const;

export type DisciplineSlug = (typeof DISCIPLINES)[number]["slug"];

export function isSectorSlug(v: unknown): v is SectorSlug {
  return typeof v === "string" && SECTORS.some((s) => s.slug === v);
}

export function isDisciplineSlug(v: unknown): v is DisciplineSlug {
  return typeof v === "string" && DISCIPLINES.some((d) => d.slug === v);
}

export function sectorLabel(slug: SectorSlug): string {
  return SECTORS.find((s) => s.slug === slug)?.label ?? slug;
}

export function disciplineLabel(slug: DisciplineSlug): string {
  return DISCIPLINES.find((d) => d.slug === slug)?.label ?? slug;
}
