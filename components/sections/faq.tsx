import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { faqs } from "@/lib/site";

/**
 * FAQ (§3.10) — the practical mechanics of the subscription: unlimited
 * requests, turnaround, pause/cancel, scope and VAT.
 */
export function Faq() {
  return (
    <section id="faq" className="container-edge scroll-mt-28 py-24 md:py-36">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">Questions, answered straight.</h2>
          </Reveal>
          <Reveal index={2}>
            <p className="text-body mt-4 max-w-sm">
              The mechanics of how the subscription actually works. No small
              print, no surprises.
            </p>
          </Reveal>
        </div>

        <Reveal index={1}>
          <Accordion multiple={false}>
            {faqs.map((item) => (
              <AccordionItem
                key={item.q}
                className="border-border py-2"
              >
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
