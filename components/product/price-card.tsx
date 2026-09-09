import { Check } from "lucide-react";
import { StartButton } from "@/components/layout/start-button";
import type { Product } from "@/lib/offer";
import { cn } from "@/lib/utils";

/**
 * One product as a card: kicker, name, price, summary, features, CTA.
 * Presentational only — the parent resolves currency and passes the product
 * in, so this renders identically in server and client trees.
 *
 * The featured card carries the section's yellow (badge + border tint);
 * every other card's CTA is a ghost pill so the viewport keeps one accent.
 */
export function PriceCard({
  product,
  taxSuffix,
  source,
  note,
  className,
}: {
  product: Product;
  taxSuffix: string;
  /** Attribution label for the CTA click, e.g. "Pricing — Brand Build". */
  source: string;
  /** Microcopy under the CTA. Defaults per kind. */
  note?: string;
  className?: string;
}) {
  const featured = Boolean(product.featured);
  const ctaNote =
    note ??
    (product.kind === "subscription"
      ? "No contracts · Pause or cancel any month"
      : "Fixed price · No proposals");

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[2rem] border p-8 md:p-9",
        featured
          ? "border-brand/50 bg-brand/[0.05] shadow-[0_50px_140px_-55px_rgba(255,220,4,0.32)]"
          : "border-border bg-card",
        className,
      )}
    >
      {featured && product.note && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-4 py-1 text-xs font-bold text-brand-ink">
          {product.note}
        </span>
      )}

      <p
        className={cn(
          "text-xs font-bold uppercase tracking-[0.16em]",
          featured ? "text-brand" : "text-faint",
        )}
      >
        {product.kicker}
      </p>
      <h3 className="text-h3 mt-4">{product.name}</h3>
      <p className="text-body mt-2 text-[0.95rem]">{product.summary}</p>

      <div className="mt-7 flex flex-wrap items-baseline gap-1.5">
        <span className="text-[clamp(2.25rem,8vw,2.75rem)] font-bold tracking-tight text-foreground">
          {product.price}
        </span>
        <span className="text-base font-medium text-faint">
          {product.cadence === "/mo" ? "/mo" : "one-off"}
        </span>
        {taxSuffix && (
          <span className="text-sm font-medium text-faint">{taxSuffix}</span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium text-faint">{product.duration}</p>

      <ul className="mt-8 flex-1 space-y-3.5">
        {product.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-[0.95rem] text-muted-foreground"
          >
            <Check
              aria-hidden
              className={cn(
                "mt-0.5 size-4 shrink-0",
                featured ? "text-brand" : "text-foreground",
              )}
            />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <StartButton
          product={product.startProduct}
          variant={featured ? "brand" : "ghostPill"}
          size="pill"
          className="w-full"
          source={source}
        >
          {product.cta}
        </StartButton>
        <p className="mt-3 text-center text-xs font-medium text-faint">{ctaNote}</p>
      </div>
    </div>
  );
}
