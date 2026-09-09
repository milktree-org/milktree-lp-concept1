"use client";

import { FaqAccordion } from "@/components/product/faq-accordion";
import { getPricingFaqs } from "@/lib/offer";
import { useCurrency } from "@/lib/use-currency";

/** Pricing FAQ with localised figures; sits after the comparison table. */
export function PricingFaq() {
  return (
    <FaqAccordion
      id="faq"
      eyebrow="Pricing FAQ"
      title="Straight answers."
      items={getPricingFaqs(useCurrency())}
    />
  );
}
