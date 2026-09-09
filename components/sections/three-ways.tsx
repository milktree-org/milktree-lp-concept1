"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { getLadder } from "@/lib/offer";
import { useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";

/**
 * Three ways to work with us (home §6.1.4): sprint, build, subscription as a
 * ladder. Each rung shows the price and where it leads. The middle rung
 * (Brand Build) carries the section's single yellow accent because it is
 * where most clients start.
 */
export function ThreeWays() {
  const ladder = getLadder(useCurrency());
  return (
    <section id="ways" className="container-edge scroll-mt-28 py-24 md:py-36">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Three ways to work with us</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">
              Fix one thing. Rebuild the lot. Or keep us on.
            </h2>
          </Reveal>
        </div>
        <Reveal index={2}>
          <p className="text-body max-w-sm md:text-right">
            Fixed prices on the page. No proposals, no quotes. Start where the
            problem is and step up when you&apos;re ready.
          </p>
        </Reveal>
      </div>

      <StaggerGroup className="mt-16 grid gap-5 lg:grid-cols-3">
        {ladder.map((rung) => {
          const featured = rung.id === "build";
          return (
            <StaggerItem
              key={rung.id}
              className={cn(
                "group relative flex flex-col rounded-[2rem] border p-8 transition-[transform,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 motion-reduce:transform-none md:p-9",
                featured
                  ? "border-brand/50 bg-brand/[0.05] hover:border-brand"
                  : "border-border bg-card hover:border-white/25",
              )}
            >
              <span
                className={cn(
                  "text-[0.78rem] font-bold uppercase tracking-[0.16em]",
                  featured ? "text-brand" : "text-faint",
                )}
              >
                {rung.step} · {rung.duration}
              </span>
              <h3 className="text-h3 mt-5">{rung.name}</h3>
              <p className="mt-3 text-[clamp(1.6rem,3vw,2rem)] font-bold tracking-tight text-foreground">
                {rung.priceLine}
              </p>
              <p className="text-body mt-4 flex-1">{rung.summary}</p>
              <Link
                href={rung.href}
                data-cursor="hover"
                className="mt-8 inline-flex min-h-11 items-center gap-2 font-bold text-foreground transition-colors group-hover:text-brand"
              >
                {rung.cta}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <Reveal className="mt-10">
        <p className="text-sm font-medium text-faint">
          Book a sprint, then step up within 30 days and the sprint fee comes off in full.{" "}
          <Link
            href="/pricing"
            data-cursor="hover"
            className="inline-flex min-h-11 items-center font-bold text-foreground underline underline-offset-4 hover:text-brand"
          >
            Compare everything on one page.
          </Link>
        </p>
      </Reveal>
    </section>
  );
}
