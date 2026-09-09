"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { getProduct, type ProductId } from "@/lib/offer";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";

/**
 * "How you buy this" — the products that deliver a service or suit a sector,
 * with localised prices. The first item is the recommended one and carries
 * the section's single yellow accent.
 */
export function BoughtThrough({
  eyebrow = "How you buy this",
  title = "Three ways in. Fixed prices on all of them.",
  items,
}: {
  eyebrow?: string;
  title?: string;
  items: { product: ProductId; how: string }[];
}) {
  const currency = useCurrency();
  const taxSuffix = CURRENCIES[currency].taxSuffix;

  return (
    <section className="border-y border-border bg-surface py-20 md:py-28">
      <div className="container-edge">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">{title}</h2>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 grid gap-5 lg:grid-cols-3">
          {items.map((item, i) => {
            const p = getProduct(item.product, currency);
            const featured = i === 0;
            return (
              <StaggerItem key={item.product}>
                <Link
                  href={p.href}
                  data-cursor="hover"
                  className={cn(
                    "group flex h-full flex-col rounded-[2rem] border p-8 transition-[transform,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 motion-reduce:transform-none",
                    featured ? "border-brand/50 bg-brand/[0.05] hover:border-brand" : "border-border bg-card hover:border-white/25",
                  )}
                >
                  <span className={cn("text-[0.78rem] font-bold uppercase tracking-[0.16em]", featured ? "text-brand" : "text-faint")}>
                    {featured ? "Recommended" : p.kicker}
                  </span>
                  <h3 className="text-h3 mt-4">{p.name}</h3>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {p.price}
                    <span className="ml-1.5 text-sm font-medium text-faint">
                      {p.cadence === "/mo" ? "/mo" : "one-off"} {taxSuffix}
                    </span>
                  </p>
                  <p className="text-body mt-4 flex-1">{item.how}</p>
                  <span className="mt-8 inline-flex items-center gap-2 font-bold text-foreground transition-colors group-hover:text-brand">
                    See {p.name}
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
