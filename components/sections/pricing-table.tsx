"use client";

import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { StartButton } from "@/components/layout/start-button";
import { getPricingMatrix, getProducts } from "@/lib/offer";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";

/**
 * Every product side by side (spec §6.7). Desktop: a six-column grid with the
 * featured product's column tinted. Below lg: one card per product listing
 * the same rows, so nothing scrolls sideways. Prices localise after hydration.
 */
export function PricingTable() {
  const currency = useCurrency();
  const products = getProducts(currency);
  const rows = getPricingMatrix(currency);
  const taxSuffix = CURRENCIES[currency].taxSuffix;

  return (
    <section id="compare" className="container-edge scroll-mt-28 pb-24 md:pb-36">
      {/* Mobile and tablet: cards */}
      <StaggerGroup className="space-y-5 lg:hidden">
        {products.map((product, pi) => (
          <StaggerItem
            key={product.id}
            className={cn(
              "overflow-hidden rounded-[1.75rem] border",
              product.featured ? "border-brand/50 bg-brand/[0.05]" : "border-border bg-card",
            )}
          >
            <div className="border-b border-border px-5 py-5">
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.16em]",
                  product.featured ? "text-brand" : "text-faint",
                )}
              >
                {product.kicker}
              </p>
              <h3 className="text-h3 mt-2">{product.name}</h3>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {product.price}
                <span className="ml-1.5 text-sm font-medium text-faint">
                  {product.cadence === "/mo" ? "/mo" : "one-off"} {taxSuffix}
                </span>
              </p>
            </div>
            <ul className="divide-y divide-border">
              {rows.slice(1).map((row) => (
                <li key={row.label} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <span className="shrink-0 text-sm font-bold text-faint">{row.label}</span>
                  <Cell value={row.values[pi]} align="right" />
                </li>
              ))}
            </ul>
            <div className="p-5">
              <StartButton
                product={product.startProduct}
                variant={product.featured ? "brand" : "ghostPill"}
                size="pill"
                className="w-full"
                source={`Pricing table — ${product.name}`}
              >
                {product.cta}
              </StartButton>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Desktop: grid */}
      <Reveal className="hidden lg:block">
        <div className="grid grid-cols-[minmax(10rem,0.9fr)_repeat(5,1fr)] items-stretch">
          <div />
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "px-4 pb-5 pt-6 text-center",
                product.featured &&
                  "rounded-t-2xl border-x border-t border-brand/40 bg-brand/[0.06]",
              )}
            >
              <p
                className={cn(
                  "text-[0.68rem] font-bold uppercase tracking-[0.16em]",
                  product.featured ? "text-brand" : "text-faint",
                )}
              >
                {product.kicker}
              </p>
              <p className="mt-2 text-base font-bold text-foreground">{product.name}</p>
            </div>
          ))}
        </div>

        <StaggerGroup className="divide-y divide-border border-t border-border">
          {rows.map((row, ri) => {
            const lastRow = ri === rows.length - 1;
            return (
              <StaggerItem
                key={row.label}
                className="grid grid-cols-[minmax(10rem,0.9fr)_repeat(5,1fr)] items-stretch"
              >
                <div className="flex items-center py-5 pr-4 text-sm font-bold uppercase tracking-[0.12em] text-faint">
                  {row.label}
                </div>
                {row.values.map((val, vi) => {
                  const featured = Boolean(products[vi].featured);
                  return (
                    <div
                      key={vi}
                      className={cn(
                        "flex items-center justify-center px-4 py-5 text-center text-[0.95rem]",
                        ri === 0 && "text-base font-bold text-foreground",
                        featured &&
                          cn("border-x border-brand/40 bg-brand/[0.06]", lastRow && "rounded-b-2xl border-b"),
                      )}
                    >
                      <Cell value={val} align="center" strong={ri === 0} />
                    </div>
                  );
                })}
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <div className="mt-8 grid grid-cols-[minmax(10rem,0.9fr)_repeat(5,1fr)] gap-4">
          <div />
          {products.map((product) => (
            <div key={product.id} className="px-2">
              <StartButton
                product={product.startProduct}
                variant={product.featured ? "brand" : "ghostPill"}
                size="pill"
                withIcon={false}
                className="w-full px-4 text-sm"
                source={`Pricing table — ${product.name}`}
              >
                {product.cta}
              </StartButton>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Cell({
  value,
  align,
  strong,
}: {
  value: string | boolean;
  align: "left" | "right" | "center";
  strong?: boolean;
}) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-2 text-foreground">
        <Check aria-hidden className="size-4 text-brand" />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center text-faint">
        <Minus aria-hidden className="size-4" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        "leading-snug",
        align === "right" && "text-right",
        strong ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}
