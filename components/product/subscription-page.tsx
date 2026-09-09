"use client";

import { ProductHero } from "@/components/product/product-hero";
import { PriceCard } from "@/components/product/price-card";
import { FaqAccordion } from "@/components/product/faq-accordion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import {
  getProductsForStart,
  getSubscriptionAnchor,
  getSubscriptionFaqs,
  paymentTerms,
  queueRules,
  subscriptionMonth,
} from "@/lib/offer";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";

/**
 * Client body of /subscription: hero, the two plans, what a month looks
 * like, how the queue works, the hire anchor, FAQ.
 */
export function SubscriptionPage() {
  const currency = useCurrency();
  const money = CURRENCIES[currency];
  const [essentials, designLead] = getProductsForStart("subscription", currency);

  return (
    <>
      <ProductHero
        eyebrow="Subscription"
        lines={["Keep it alive.", "Design on tap,", "every month."]}
        sub="Once the brand is right, the work never stops: the menu, the ads, the deck, the signage for the second site. Send it to a queue, get it back in around 48 hours, checked by a creative director. Pause when it goes quiet."
        priceLine={`from ${essentials.price}/mo`}
        priceNote={[money.taxSuffix, "no contract", "pause or cancel any month"].filter(Boolean).join(" · ")}
        product="subscription"
        cta="Start a subscription"
        secondary={{ label: "Need a rebrand first?", href: "/brand-build" }}
        trust="Most subscribers come to us after a build. You can start here too."
      />

      {/* Plans */}
      <section id="plans" className="container-edge scroll-mt-28 py-20 md:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Two plans</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">A queue. Or your own designer.</h2>
          </Reveal>
          <Reveal index={2}>
            <p className="text-body mt-4 max-w-xl">
              Essentials is your design queue, handled. Design Lead adds the thing an in-house
              hire gives you: one senior person who knows your brand, the same every time,
              reachable on Slack.
            </p>
          </Reveal>
        </div>
        <StaggerGroup className="mx-auto mt-14 grid max-w-4xl items-stretch gap-6 md:gap-8 lg:grid-cols-2">
          <StaggerItem>
            <PriceCard product={essentials} taxSuffix={money.taxSuffix} source="Subscription — Essentials" />
          </StaggerItem>
          <StaggerItem>
            <PriceCard
              product={{ ...designLead, featured: true, note: "Your own designer" }}
              taxSuffix={money.taxSuffix}
              source="Subscription — Design Lead"
            />
          </StaggerItem>
        </StaggerGroup>
        <Reveal className="mx-auto mt-10 max-w-3xl text-center">
          <p className="text-body text-[0.95rem]">{getSubscriptionAnchor(currency)}</p>
          <p className="mt-4 text-sm font-medium text-faint">
            {paymentTerms.subscription} {money.vatNote}
          </p>
        </Reveal>
      </section>

      {/* A month */}
      <section className="border-y border-border bg-surface py-20 md:py-28">
        <div className="container-edge grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>A typical month</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6">The kind of thing that lands in the queue.</h2>
            </Reveal>
            <Reveal index={2}>
              <p className="text-body mt-4 max-w-sm">
                One request is one deliverable. Add as many as you like; we work through them in
                your priority order.
              </p>
            </Reveal>
          </div>
          <StaggerGroup className="grid gap-3 sm:grid-cols-2">
            {subscriptionMonth.map((item) => (
              <StaggerItem
                key={item}
                className="rounded-2xl border border-border bg-card px-5 py-4 text-[1.02rem] font-bold tracking-tight text-foreground"
              >
                {item}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Queue rules */}
      <section className="container-edge py-20 md:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>How the queue works</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">No small print. This is all of it.</h2>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 divide-y divide-border border-y border-border">
          {queueRules.map((r, i) => (
            <StaggerItem
              key={r.title}
              className="grid gap-3 py-8 md:grid-cols-[5rem_18rem_1fr] md:gap-8"
            >
              <span className="text-2xl font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h3">{r.title}</h3>
              <p className="text-body max-w-xl">{r.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <FaqAccordion
        id="faq"
        eyebrow="Subscription FAQ"
        title="Straight answers."
        items={getSubscriptionFaqs(currency)}
      />
    </>
  );
}
