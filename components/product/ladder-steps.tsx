"use client";

import { Steps } from "@/components/product/steps";
import { getLadder } from "@/lib/offer";
import { useCurrency } from "@/lib/use-currency";

/** The three ways to work with us as a drawn-line process, prices localised. */
export function LadderSteps() {
  const ladder = getLadder(useCurrency());
  return (
    <Steps
      id="ways"
      eyebrow="Three ways to work with us"
      title="Start where the problem is. Step up when you're ready."
      intro="Each one leads naturally to the next, and the sprint fee comes off whatever you do within 30 days."
      steps={ladder.map((r) => ({
        n: r.step,
        meta: `${r.priceLine} · ${r.duration}`,
        title: r.name,
        body: r.summary,
      }))}
      layout="row"
      light
    />
  );
}
