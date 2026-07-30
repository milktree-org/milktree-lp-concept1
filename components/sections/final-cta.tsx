import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { StartButton } from "@/components/layout/start-button";
import { AnchorLink } from "@/components/layout/anchor-link";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Final CTA (§7.13) — full-bleed, mostly black with the single yellow accent
 * (the primary CTA). The closing conversion moment.
 */
export function FinalCTA() {
  return (
    <section id="book" className="relative scroll-mt-28 overflow-hidden py-28 md:py-44">
      {/* subtle atmosphere — diffuse, so the CTA pill stays the crisp accent */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-0 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,220,4,0.08),transparent_65%)] blur-2xl"
      />

      <div className="container-edge relative z-10 flex flex-col items-center text-center">
        <Reveal>
          <h2 className="mx-auto max-w-[16ch] text-balance text-[clamp(2.5rem,7vw,6rem)] font-bold uppercase leading-[0.98] tracking-[-0.03em]">
            Your business has outgrown its brand.
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="text-body-lg mt-6 max-w-xl">
            Let&apos;s fix that. Answer six quick questions and we&apos;ll take
            it from there.
          </p>
        </Reveal>
        <Reveal index={2} className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
          <StartButton size="pill-lg" magnetic source="Final CTA" className="w-full sm:w-auto" />
          <AnchorLink
            href="#plans"
            className={cn(
              buttonVariants({ variant: "ghostPill", size: "pill-lg" }),
              "w-full sm:w-auto",
            )}
          >
            See plans
          </AnchorLink>
        </Reveal>
        <Reveal index={3}>
          <p className="mt-10 max-w-sm px-2 text-sm font-medium text-faint sm:max-w-none">
            {site.trustLine}
          </p>
        </Reveal>
        {/* Soft path for the not-ready majority — captures them as leads
            (Brand Ranking Report) instead of losing them entirely. */}
        <Reveal index={4}>
          <p className="mt-5 text-sm font-medium text-muted-foreground">
            Not ready yet?{" "}
            <Link
              href="/brand-report"
              data-cursor="hover"
              className="inline-flex min-h-11 items-center font-bold text-foreground underline underline-offset-4 transition-colors hover:text-brand"
            >
              Get your free brand report.
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
