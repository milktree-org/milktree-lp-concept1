"use client";

import { Reveal } from "@/components/motion/reveal";
import { StartButton } from "@/components/layout/start-button";
import { foundingSpotsRemaining } from "@/lib/site";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";

/**
 * Mid-page CTA band — a slim conversion moment between the proof crescendo
 * and the comparison/pricing run-in, so visitors who are already convinced
 * don't have to scroll to the footer to act. The button is the one yellow
 * element in view. Carries the founding-rate urgency so scarcity is seen
 * well before the Plans section near the bottom of the page.
 */
export function CtaBand() {
  const money = CURRENCIES[useCurrency()];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-edge flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <Reveal>
          <h2 className="max-w-[22ch] text-balance text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold uppercase leading-[1.05] tracking-[-0.025em]">
            Your first request could be back this week.
          </h2>
          <p className="text-body mt-3 max-w-md">
            Start today and send your first brief within the hour.
          </p>
        </Reveal>
        <Reveal index={1} className="flex shrink-0 flex-col items-start gap-4 md:items-end">
          <StartButton size="pill-lg" magnetic source="Mid-page CTA band">
            Get started
          </StartButton>
          <p className="max-w-xs text-sm font-medium text-faint md:text-right">
            Founding rate: first 10 Design Lead clients lock{" "}
            {money.foundingMonthly}/mo for life · {foundingSpotsRemaining} spots
            left
          </p>
        </Reveal>
      </div>
    </section>
  );
}
