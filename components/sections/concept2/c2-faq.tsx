"use client";

import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getFaqs } from "@/lib/site";
import { useCurrency } from "@/lib/use-currency";

/**
 * FAQ — minimal hairline accordion on white, editorial two-column layout
 * with the heading on the left and questions on the right.
 */
export function C2Faq() {
  const faqs = getFaqs(useCurrency());
  return (
    <section id="faq" className="border-t border-border">
      <div className="container-edge grid gap-12 py-24 md:grid-cols-12 md:py-36">
        <Reveal className="md:col-span-4">
          <p className="c2-label">(FAQ)</p>
          <h2 className="text-h2 mt-6 text-foreground">
            Questions, answered.
          </h2>
        </Reveal>

        <Reveal className="md:col-span-8">
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-border">
                <AccordionTrigger className="py-5 text-[1.05rem] font-bold tracking-tight text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-[0.95rem] font-medium leading-[1.65] text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
