"use client";

import { Check } from "lucide-react";
import { ProductHero } from "@/components/product/product-hero";
import { PayButton } from "@/components/product/pay-button";
import { Steps } from "@/components/product/steps";
import { FaqAccordion } from "@/components/product/faq-accordion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import {
  creditRule,
  getProduct,
  getSprintFaqs,
  paymentTerms,
  sprintOptions,
  sprintTimeline,
} from "@/lib/offer";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";

/**
 * Client body of /sprint: hero, choose your sprint, what you get, the two
 * weeks, the credit rule, FAQ. Currency resolves after hydration.
 */
export function SprintPage({ stripeEnabled = false }: { stripeEnabled?: boolean }) {
  const currency = useCurrency();
  const money = CURRENCIES[currency];
  const sprint = getProduct("sprint", currency);

  return (
    <>
      <ProductHero
        eyebrow="Brand Reset Sprint"
        lines={["Fix the one thing", "that's been", "bothering you."]}
        sub="Your homepage, your pitch deck, or your identity, tightened up properly. Two weeks, one price, a creative director on it. Files you can use on day ten."
        priceLine={`${sprint.price} one-off`}
        priceNote={[money.taxSuffix, "two weeks", "one revision round"].filter(Boolean).join(" · ")}
        product="sprint"
        cta="Book a sprint"
        secondary={{ label: "See a brand build", href: "/brand-build" }}
        trust="200+ brands built · 7 years · Fixed price · No proposals"
      />

      {/* Choose your sprint */}
      <section className="container-edge py-20 md:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Choose your sprint</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">One sprint. One thing. Done properly.</h2>
          </Reveal>
          <Reveal index={2}>
            <p className="text-body mt-4 max-w-xl">
              Pick the one that&apos;s costing you. If it&apos;s all three, that&apos;s a brand
              problem and a Brand Build is the honest answer. The sprint fee comes off it.
              {stripeEnabled && currency === "GBP" && " Pay now and book your day one, or start with a call."}
            </p>
          </Reveal>
        </div>

        <StaggerGroup className="mt-14 grid gap-5 lg:grid-cols-3">
          {sprintOptions.map((o) => (
            <StaggerItem
              key={o.id}
              className="flex flex-col rounded-[2rem] border border-border bg-card p-8 transition-colors duration-300 hover:border-white/25 md:p-9"
            >
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-faint">
                {o.name}
              </span>
              <h3 className="text-h3 mt-4">{o.problem}</h3>
              <ul className="mt-6 flex-1 space-y-3">
                {o.deliver.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-[0.95rem] text-muted-foreground">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground" />
                    {d}
                  </li>
                ))}
              </ul>
              {stripeEnabled && currency === "GBP" && (
                <PayButton sprint={o.id} price={sprint.price} className="mt-8" />
              )}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* What every sprint includes */}
      <section className="border-y border-border bg-surface py-20 md:py-28">
        <div className="container-edge grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Every sprint</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6">What you get, whichever you pick.</h2>
            </Reveal>
          </div>
          <StaggerGroup className="divide-y divide-border border-y border-border">
            {sprint.features.map((f) => (
              <StaggerItem key={f} className="flex items-start gap-4 py-5">
                <Check aria-hidden className="mt-1 size-5 shrink-0 text-brand" />
                <p className="text-lg font-medium text-foreground">{f}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <Steps
        id="how"
        eyebrow="The two weeks"
        title="Day one to day ten."
        intro="Ten working days. You make two decisions and one round of notes. We do the rest."
        steps={sprintTimeline.map((t) => ({ n: t.day.replace("Day ", "D"), meta: t.day, title: t.title, body: t.body }))}
        layout="row"
        footnote={paymentTerms.sprint}
      />

      {/* Credit rule */}
      <section className="container-edge pb-8">
        <Reveal>
          <div className="rounded-[2rem] border border-brand/40 bg-brand/[0.06] p-8 md:p-10">
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-brand">
              The step-up rule
            </p>
            <p className="mt-4 max-w-3xl text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold leading-snug tracking-tight text-foreground">
              {creditRule}
            </p>
            <p className="text-body mt-4 max-w-2xl">
              Book a Brand Build and the {sprint.price} comes off the {money.build}. Start a
              subscription and it comes off your first month. The sprint is a way in, not a
              dead end.
            </p>
          </div>
        </Reveal>
      </section>

      <FaqAccordion
        id="faq"
        eyebrow="Sprint FAQ"
        title="Straight answers."
        items={getSprintFaqs(currency)}
      />
    </>
  );
}
