"use client";

import { FaqAccordion } from "@/components/product/faq-accordion";
import { getFaqs } from "@/lib/site";
import { useCurrency } from "@/lib/use-currency";

/** Homepage FAQ — studio-level questions. Product mechanics live on each product page. */
export function Faq() {
  return (
    <FaqAccordion
      id="faq"
      eyebrow="FAQ"
      title="Questions, answered straight."
      intro="How the studio works and what it costs. No small print, no surprises."
      items={getFaqs(useCurrency())}
    />
  );
}
