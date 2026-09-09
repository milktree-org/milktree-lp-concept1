import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { StartButton } from "@/components/layout/start-button";
import { buttonVariants } from "@/components/ui/button";
import type { StartProduct } from "@/lib/offer";
import { cn } from "@/lib/utils";

/**
 * Closing CTA band for product pages. Full-bleed, mostly black, the yellow
 * pill is the accent. Same shape as the homepage's final CTA so the site
 * ends every page the same way.
 */
export function ProductCta({
  title,
  body,
  product,
  cta,
  secondary,
  trust,
  source,
}: {
  title: string;
  body: string;
  product: StartProduct;
  cta: string;
  secondary?: { label: string; href: string };
  trust?: string;
  source: string;
}) {
  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-0 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,220,4,0.08),transparent_65%)] blur-2xl"
      />
      <div className="container-edge relative z-10 flex flex-col items-center text-center">
        <Reveal>
          <h2 className="mx-auto max-w-[18ch] text-balance text-[clamp(2.25rem,6.5vw,5.5rem)] font-bold uppercase leading-[0.98] tracking-[-0.03em]">
            {title}
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="text-body-lg mt-6 max-w-xl">{body}</p>
        </Reveal>
        <Reveal
          index={2}
          className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center"
        >
          <StartButton
            size="pill-lg"
            magnetic
            product={product}
            source={source}
            className="w-full sm:w-auto"
          >
            {cta}
          </StartButton>
          {secondary && (
            <Link
              href={secondary.href}
              data-cursor="hover"
              className={cn(
                buttonVariants({ variant: "ghostPill", size: "pill-lg" }),
                "w-full sm:w-auto",
              )}
            >
              {secondary.label}
            </Link>
          )}
        </Reveal>
        {trust && (
          <Reveal index={3}>
            <p className="mt-10 max-w-sm px-2 text-sm font-medium text-faint sm:max-w-none">
              {trust}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
