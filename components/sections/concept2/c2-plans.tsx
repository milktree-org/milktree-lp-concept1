"use client";

import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { StartButton } from "@/components/layout/start-button";
import { getPlans, getPlanVatNote } from "@/lib/site";
import { useCurrency } from "@/lib/use-currency";

/**
 * Plans — Ditto-style flat off-white cards, big black price type, black pill
 * CTAs. The founding-rate banner on Design Lead is the section's single
 * yellow moment.
 */
export function C2Plans() {
  const currency = useCurrency();
  const plans = getPlans(currency);
  return (
    <section id="plans" className="border-t border-border">
      <div className="container-edge py-24 md:py-36">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-block bg-ink px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ink-foreground">
            Pricing
          </span>
          <h2 className="text-h2 mt-7 text-balance text-foreground">
            A whole creative department for less than one hire.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-lg">
            No proposals, no quotes, no hourly billing. Pick a plan, start
            requesting the same day.
          </p>
        </Reveal>

        <StaggerGroup className="mx-auto mt-16 grid max-w-5xl gap-6 md:mt-20 md:grid-cols-2">
          {plans.map((plan) => (
            <StaggerItem
              key={plan.name}
              className="flex flex-col overflow-hidden rounded-[28px] bg-surface"
            >
              {plan.banner ? (
                <p className="bg-brand px-8 py-3 text-center text-[0.85rem] font-bold text-brand-ink">
                  {plan.banner}
                </p>
              ) : null}

              <div className="flex flex-1 flex-col p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <span className="inline-block border border-border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {plan.name}
                  </span>
                  {plan.note ? (
                    <span className="text-xs font-bold text-faint">
                      {plan.note}
                    </span>
                  ) : null}
                </div>

                <p className="mt-7 font-bold leading-none tracking-[-0.03em] text-foreground [font-size:clamp(3rem,5vw,4.25rem)]">
                  {plan.price}
                  <span className="text-xl font-bold tracking-normal text-faint">
                    {plan.cadence}
                  </span>
                </p>
                <p className="mt-2 text-sm font-medium text-faint">{plan.kicker}</p>

                <p className="mt-6 text-[1.05rem] font-bold tracking-tight text-foreground">
                  {plan.summary}
                </p>

                <ul className="mt-7 space-y-3 border-t border-border pt-7">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[0.95rem] font-medium text-muted-foreground"
                    >
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <p className="mt-7 text-sm font-medium leading-[1.6] text-faint">
                  {plan.anchor}
                </p>

                <div className="mt-8 flex flex-1 items-end">
                  <StartButton
                    variant="default"
                    size="pill-lg"
                    source={`Concept2 Plans — ${plan.name}`}
                    className="w-full"
                  >
                    {plan.cta}
                  </StartButton>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-8 text-center">
          <p className="text-sm font-medium text-faint">
            {getPlanVatNote(currency)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
