"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WorkCard } from "@/components/ui/work-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import {
  DISCIPLINES,
  SECTORS,
  isDisciplineSlug,
  isSectorSlug,
  type DisciplineSlug,
  type SectorSlug,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/** The subset of WorkProject the index needs; keeps galleries out of the client bundle. */
export type WorkIndexItem = {
  slug: string;
  title: string;
  category: string;
  poster: string;
  sector: SectorSlug;
  disciplines: DisciplineSlug[];
  featured: boolean;
};

/**
 * Filterable work grid (spec §6.2). Filters are URL-addressable
 * (`/work?sector=hospitality&discipline=print`) so audience pages and links
 * can deep-link, and the browser back button works. Only sectors and
 * disciplines with at least one project are offered.
 */
export function WorkIndex({ items }: { items: WorkIndexItem[] }) {
  const params = useSearchParams();
  const sector = isSectorSlug(params.get("sector")) ? (params.get("sector") as SectorSlug) : null;
  const discipline = isDisciplineSlug(params.get("discipline")) ? (params.get("discipline") as DisciplineSlug) : null;

  const sectors = SECTORS.filter((s) => s.slug !== "other" && items.some((p) => p.sector === s.slug));
  const disciplines = DISCIPLINES.filter((d) => items.some((p) => p.disciplines.includes(d.slug)));

  // Cheap enough to run each render; the React Compiler memoises it.
  const filtered = items.filter(
    (p) => (!sector || p.sector === sector) && (!discipline || p.disciplines.includes(discipline)),
  );

  const href = (next: { sector?: SectorSlug | null; discipline?: DisciplineSlug | null }) => {
    const q = new URLSearchParams();
    const s = next.sector === undefined ? sector : next.sector;
    const d = next.discipline === undefined ? discipline : next.discipline;
    if (s) q.set("sector", s);
    if (d) q.set("discipline", d);
    const qs = q.toString();
    return qs ? `/work?${qs}` : "/work";
  };

  return (
    <>
      <div className="mt-12 flex flex-col gap-4">
        <FilterRow label="Sector">
          <Chip href={href({ sector: null })} active={!sector} label="All" />
          {sectors.map((s) => (
            <Chip key={s.slug} href={href({ sector: s.slug })} active={sector === s.slug} label={s.label} />
          ))}
        </FilterRow>
        <FilterRow label="Discipline">
          <Chip href={href({ discipline: null })} active={!discipline} label="All" />
          {disciplines.map((d) => (
            <Chip key={d.slug} href={href({ discipline: d.slug })} active={discipline === d.slug} label={d.label} />
          ))}
        </FilterRow>
      </div>

      <p className="mt-8 text-sm font-medium text-faint" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        {sector || discipline ? (
          <>
            {" · "}
            <Link
              href="/work"
              scroll={false}
              className="inline-flex min-h-11 items-center font-bold text-foreground underline underline-offset-4 hover:text-brand"
            >
              Clear filters
            </Link>
          </>
        ) : null}
      </p>

      {/* First row paints from the server HTML (no reveal, priority images):
          it holds the page's LCP element on mobile. */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, 3).map((p) => (
          <WorkCard key={p.slug} project={p} headingLevel="h2" priority />
        ))}
      </div>
      {filtered.length > 3 && (
        <StaggerGroup key={`${sector}-${discipline}`} className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(3).map((p) => (
            <StaggerItem key={p.slug}>
              <WorkCard project={p} headingLevel="h2" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-24 shrink-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      data-cursor="hover"
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold transition-colors",
        active
          ? "border-brand bg-brand text-brand-ink"
          : "border-border bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
