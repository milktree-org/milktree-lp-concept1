"use client";

import { Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { getComparison } from "@/lib/site";
import { useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";

type Comparison = ReturnType<typeof getComparison>;

/**
 * Why Milktree (§3.8) — four-way comparison (freelancer / hire / budget
 * subscriptions / Milktree) on desktop; stacked cards on mobile so nothing
 * requires horizontal scrolling.
 */
const GRID = "grid grid-cols-[0.9fr_1fr_1fr_1.15fr_1.15fr]";

export function WhyMilktree() {
  const comparison = getComparison(useCurrency());
  return (
    <section id="why" className="container-edge scroll-mt-28 py-24 md:py-36">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>Why Milktree</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6">The maths is simple.</h2>
        </Reveal>
        <Reveal index={2}>
          <p className="text-body mt-4">
            Compare the options most teams weigh up, and where an embedded
            creative partner lands.
          </p>
        </Reveal>
      </div>

      {/* Mobile — one card per row, scrolls vertically */}
      <ComparisonMobile comparison={comparison} />

      {/* Desktop — full comparison grid */}
      <Reveal index={1} className="relative mt-14 hidden lg:block">
        <ComparisonTable comparison={comparison} />
      </Reveal>
    </section>
  );
}

function ComparisonMobile({ comparison }: { comparison: Comparison }) {
  return (
    <StaggerGroup className="mt-12 space-y-4 lg:hidden">
      {comparison.rows.map((row) => (
        <StaggerItem
          key={row.label}
          className="overflow-hidden rounded-[1.75rem] border border-border bg-card"
        >
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-faint">
              {row.label}
            </p>
          </div>
          <ul className="divide-y divide-border">
            {row.values.map((val, vi) => {
              const isMilk = vi === comparison.columns.length - 1;
              const col = comparison.columns[vi];
              return (
                <li
                  key={col}
                  className={cn(
                    "flex items-start justify-between gap-4 px-5 py-4",
                    isMilk && "border-l-2 border-brand bg-brand/[0.06]",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold",
                      isMilk ? "text-brand" : "text-faint",
                    )}
                  >
                    {col}
                  </span>
                  <span
                    className={cn(
                      "flex items-start gap-2 text-right text-[0.95rem] leading-snug",
                      isMilk
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {isMilk && (
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    )}
                    {val}
                  </span>
                </li>
              );
            })}
          </ul>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function ComparisonTable({ comparison }: { comparison: Comparison }) {
  return (
    <div>
      <div className={cn(GRID, "items-stretch")}>
        <div />
        {comparison.columns.map((col, i) => {
          const isMilk = i === comparison.columns.length - 1;
          return (
            <div
              key={col}
              className={cn(
                "px-5 pb-5 pt-6 text-center text-base font-bold",
                isMilk
                  ? "rounded-t-2xl border-x border-t border-brand/40 bg-brand/[0.06] text-brand"
                  : "text-muted-foreground",
              )}
            >
              {col}
            </div>
          );
        })}
      </div>

      <StaggerGroup className="divide-y divide-border border-t border-border">
        {comparison.rows.map((row, ri) => {
          const lastRow = ri === comparison.rows.length - 1;
          return (
            <StaggerItem key={row.label} className={cn(GRID, "items-stretch")}>
              <div className="flex items-center px-1 py-5 text-sm font-bold uppercase tracking-[0.12em] text-faint">
                {row.label}
              </div>
              {row.values.map((val, vi) => {
                const isMilk = vi === row.values.length - 1;
                return (
                  <div
                    key={vi}
                    className={cn(
                      "flex items-center gap-2 px-5 py-5 text-[0.95rem]",
                      isMilk
                        ? cn(
                            "border-x border-brand/40 bg-brand/[0.06] font-semibold text-foreground",
                            lastRow && "rounded-b-2xl border-b",
                          )
                        : "text-muted-foreground",
                    )}
                  >
                    {isMilk && <Check className="size-4 shrink-0 text-brand" />}
                    {val}
                  </div>
                );
              })}
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}
