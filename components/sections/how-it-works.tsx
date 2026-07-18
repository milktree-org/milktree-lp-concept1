"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { steps, stepsFootnote } from "@/lib/site";

/**
 * How it works (§3.5) — four steps (Subscribe → Request → Receive → Approve or
 * revise) connected by a yellow line that draws as you scroll. Horizontal
 * track on desktop, vertical on mobile. The drawing line is the single yellow
 * in this section.
 */
export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 65%"],
  });
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="how"
      className="theme-light scroll-mt-28 bg-background py-24 text-foreground md:py-36"
    >
      <div className="container-edge">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6">Senior design in four steps.</h2>
        </Reveal>
      </div>

      <div ref={ref} className="relative mt-16">
        {/* horizontal track (desktop) */}
        <div className="absolute left-0 right-0 top-9 hidden h-px bg-border md:block" />
        <motion.div
          aria-hidden
          style={{ scaleX: reduce ? 1 : grow }}
          className="absolute left-0 right-0 top-9 hidden h-px origin-left bg-brand md:block"
        />
        {/* vertical track (mobile) */}
        <div className="absolute bottom-9 left-9 top-9 w-px bg-border md:hidden" />
        <motion.div
          aria-hidden
          style={{ scaleY: reduce ? 1 : grow }}
          className="absolute bottom-9 left-9 top-9 w-px origin-top bg-brand md:hidden"
        />

        <div className="flex flex-col gap-12 md:grid md:grid-cols-4 md:gap-8">
          {steps.map((step, i) => (
            <Reveal
              key={step.n}
              index={i}
              className="relative flex gap-6 md:block"
            >
              <div className="relative z-10 grid size-[4.5rem] shrink-0 place-items-center rounded-full bg-ink text-2xl font-bold text-brand md:mb-8">
                {step.n}
              </div>
              <div className="md:pr-6">
                <h3 className="text-h3">{step.title}</h3>
                <p className="text-body mt-3">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-14">
        <p className="text-lg font-bold tracking-tight text-foreground">
          {stepsFootnote}
        </p>
      </Reveal>
      </div>
    </section>
  );
}
