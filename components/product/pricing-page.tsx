"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductHero } from "@/components/product/product-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { creditRule, getLadder } from "@/lib/offer";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";

/**
 * Client top of /pricing: hero, the three-rung overview, the credit rule and
 * the comparison heading. The table and FAQ follow as siblings in the page.
 */
export function PricingPage() {
  const currency = useCurrency();
  const money = CURRENCIES[currency];
  const ladder = getLadder(currency);

  return (
    <>
      <ProductHero
        eyebrow="Pricing"
        lines={["The price on", "the page is", "the price."]}
        sub="Three ways to work with us, five products, no proposals. Every figure below is fixed. Third-party costs like printing are passed through at cost and agreed first."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "Jump to the comparison", href: "#compare" }}
        trust={money.vatNote}
      />

      <section className="container-edge pb-20 md:pb-28">
        <StaggerGroup className="grid gap-5 lg:grid-cols-3">
          {ladder.map((rung) => {
            const featured = rung.id === "build";
            return (
              <StaggerItem
                key={rung.id}
                className={cn(
                  "group flex flex-col rounded-[2rem] border p-8 transition-colors duration-300 md:p-9",
                  featured ? "border-brand/50 bg-brand/[0.05]" : "border-border bg-card hover:border-white/25",
                )}
              >
                <span className={cn("text-[0.78rem] font-bold uppercase tracking-[0.16em]", featured ? "text-brand" : "text-faint")}>
                  {rung.step} · {rung.duration}
                </span>
                <h2 className="text-h3 mt-5">{rung.name}</h2>
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
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal className="mt-10">
          <div className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
            <Eyebrow>The step-up rule</Eyebrow>
            <p className="mt-4 max-w-3xl text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold leading-snug tracking-tight text-foreground">
              {creditRule}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="container-edge pb-6">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Compare</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">Everything, side by side.</h2>
          </Reveal>
        </div>
      </section>
    </>
  );
}
