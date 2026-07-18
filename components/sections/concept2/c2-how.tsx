import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { steps, stepsFootnote } from "@/lib/site";

/**
 * How it works — OFF+BRAND-style numbered rows with hairline dividers, set on
 * the warm-black ink block as the first dark contrast moment of the page.
 */
export function C2How() {
  return (
    <section id="how" className="bg-ink text-ink-foreground">
      <div className="container-edge py-24 md:py-36">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-medium text-ink-foreground/40">
            (How it works)
          </p>
          <h2 className="text-h2 mt-6">No proposals. No quotes.</h2>
        </Reveal>

        <StaggerGroup className="mt-16 md:mt-20">
          {steps.map((step) => (
            <StaggerItem
              key={step.n}
              className="grid gap-3 border-t border-white/10 py-8 md:grid-cols-12 md:items-baseline md:gap-6 md:py-10"
            >
              <span className="text-sm font-medium text-ink-foreground/40 md:col-span-2">
                ({step.n})
              </span>
              <h3 className="font-bold uppercase leading-none tracking-[-0.02em] [font-size:clamp(1.6rem,3.4vw,2.75rem)] md:col-span-5">
                {step.title}
              </h3>
              <p className="max-w-md text-[0.95rem] font-medium leading-[1.6] text-ink-foreground/60 md:col-span-5">
                {step.body}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="border-t border-white/10 pt-8">
          <p className="text-sm font-medium text-ink-foreground/40">
            {stepsFootnote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
