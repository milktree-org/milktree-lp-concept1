"use client";

import { ProductHero } from "@/components/product/product-hero";
import { PriceCard } from "@/components/product/price-card";
import { Steps } from "@/components/product/steps";
import { FaqAccordion } from "@/components/product/faq-accordion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import {
  buildPlusAdds,
  buildProcess,
  getBuildFaqs,
  getProductsForStart,
  paymentTerms,
} from "@/lib/offer";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";

/**
 * Client body of /brand-build: hero, the two tiers, the six-week process,
 * what Plus adds, what happens after, FAQ.
 */
export function BuildPage() {
  const currency = useCurrency();
  const money = CURRENCIES[currency];
  const [build, plus] = getProductsForStart("build", currency);

  return (
    <>
      <ProductHero
        eyebrow="Brand Build"
        lines={["The whole brand,", "rebuilt properly."]}
        sub="From a half-day workshop to a set of guidelines your whole team can use. A named senior designer, a creative director on every piece, and the price on this page is the price."
        priceLine={`from ${build.price}`}
        priceNote={[money.taxSuffix, "four to six weeks", "fixed"].filter(Boolean).join(" · ")}
        product="build"
        cta="Start a brand build"
        secondary={{ label: "Not ready? See the sprint", href: "/sprint" }}
        trust="200+ brands built this way · 7 years · No proposals"
      />

      {/* Tiers */}
      <section id="tiers" className="container-edge scroll-mt-28 py-20 md:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Two versions</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">Build the brand. Or build it and launch it.</h2>
          </Reveal>
        </div>
        <StaggerGroup className="mx-auto mt-14 grid max-w-4xl items-stretch gap-6 md:gap-8 lg:grid-cols-2">
          <StaggerItem>
            <PriceCard product={build} taxSuffix={money.taxSuffix} source="Brand Build — Build" />
          </StaggerItem>
          <StaggerItem>
            <PriceCard product={plus} taxSuffix={money.taxSuffix} source="Brand Build — Plus" />
          </StaggerItem>
        </StaggerGroup>
        <Reveal className="mx-auto mt-10 max-w-3xl text-center">
          <p className="text-sm font-medium text-faint">
            {paymentTerms.build} {money.vatNote}
          </p>
        </Reveal>
      </section>

      <Steps
        id="process"
        eyebrow="The six weeks"
        title="Workshop to handover."
        intro="Every build runs the same way. The big decision happens in week two, on rough drawings, before anything expensive is designed."
        steps={buildProcess.map((s) => ({ n: s.n, meta: s.week, title: s.title, body: s.body }))}
        layout="list"
        light
      />

      {/* What Plus adds */}
      <section className="container-edge py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>Brand Build Plus</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6">What Plus adds.</h2>
            </Reveal>
          </div>
          <Reveal index={2}>
            <p className="text-body max-w-sm md:text-right">
              A new identity is only half the job. Plus is the toolkit to put it in front of
              people: on screen, in print, on the street.
            </p>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {buildPlusAdds.map((a) => (
            <StaggerItem
              key={a.title}
              className="rounded-[1.75rem] border border-border bg-card p-6 transition-colors duration-300 hover:border-white/25 sm:rounded-[2rem] sm:p-7"
            >
              <h3 className="text-lg font-bold uppercase tracking-tight">{a.title}</h3>
              <p className="text-body mt-2 text-[0.95rem]">{a.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* After */}
      <section className="border-y border-border bg-surface py-20 md:py-28">
        <div className="container-edge grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>After the build</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6">Most clients keep us on.</h2>
            </Reveal>
          </div>
          <Reveal index={2}>
            <p className="text-body-lg">
              A brand drifts the moment nobody is looking after it. At handover we offer the
              subscription: unlimited design requests, back in around 48 hours, worked by people
              who already know your brand because they built it. From {money.essentialsMonthly} a
              month, pause or cancel any time. No onboarding, no drift.
            </p>
          </Reveal>
        </div>
      </section>

      <FaqAccordion
        id="faq"
        eyebrow="Brand Build FAQ"
        title="Straight answers."
        items={getBuildFaqs(currency)}
      />
    </>
  );
}
