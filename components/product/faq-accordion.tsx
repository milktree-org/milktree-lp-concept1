"use client";

import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { Faq } from "@/lib/offer";
import { cn } from "@/lib/utils";

/**
 * Two-column FAQ: eyebrow + heading on the left, accordion on the right.
 * Shared by the homepage and every product page. Emit the matching FAQPage
 * JSON-LD from the page, not here, so it renders server-side.
 */
export function FaqAccordion({
  id = "faq",
  eyebrow = "FAQ",
  title = "Questions, answered straight.",
  intro,
  items,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  items: Faq[];
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("container-edge scroll-mt-28 py-24 md:py-36", className)}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">{title}</h2>
          </Reveal>
          {intro && (
            <Reveal index={2}>
              <p className="text-body mt-4 max-w-sm">{intro}</p>
            </Reveal>
          )}
        </div>

        <Reveal index={1}>
          <Accordion multiple={false}>
            {items.map((item) => (
              <AccordionItem key={item.q} className="border-border py-2">
                <AccordionTrigger className="py-4 text-base font-bold tracking-tight text-foreground hover:no-underline md:text-lg">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 pr-8 text-[0.98rem] leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
