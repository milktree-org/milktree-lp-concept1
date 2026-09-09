"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type Step = {
  /** Big marker in the circle, e.g. "01" or "Day 1". */
  n: string;
  title: string;
  body: string;
  /** Small label above the title, e.g. "Week 1". */
  meta?: string;
};

/**
 * Numbered steps connected by a yellow line that draws as you scroll.
 *
 * `layout="row"` lays up to four steps across on desktop (vertical on mobile);
 * `layout="list"` is the vertical timeline at every width, for longer
 * processes like the six-week brand build. The drawing line is the section's
 * single yellow element. Honors reduced motion (line renders complete).
 */
export function Steps({
  id,
  eyebrow,
  title,
  intro,
  steps,
  footnote,
  layout = "row",
  light = false,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  steps: Step[];
  footnote?: string;
  layout?: "row" | "list";
  /** Render on the light band (as the old "how it works" did). */
  light?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 65%"],
  });
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const row = layout === "row";

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 py-24 md:py-36",
        light ? "theme-light bg-background text-foreground" : "",
        className,
      )}
    >
      <div className="container-edge">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">{title}</h2>
          </Reveal>
          {intro && (
            <Reveal index={2}>
              <p className="text-body mt-4 max-w-xl">{intro}</p>
            </Reveal>
          )}
        </div>

        <div ref={ref} className="relative mt-16">
          {row && (
            <>
              <div className="absolute left-0 right-0 top-9 hidden h-px bg-border md:block" />
              <motion.div
                aria-hidden
                style={{ scaleX: reduce ? 1 : grow }}
                className="absolute left-0 right-0 top-9 hidden h-px origin-left bg-brand md:block"
              />
            </>
          )}
          <div
            className={cn(
              "absolute bottom-9 left-9 top-9 w-px bg-border",
              row && "md:hidden",
            )}
          />
          <motion.div
            aria-hidden
            style={{ scaleY: reduce ? 1 : grow }}
            className={cn(
              "absolute bottom-9 left-9 top-9 w-px origin-top bg-brand",
              row && "md:hidden",
            )}
          />

          <div
            className={cn(
              "flex flex-col gap-12",
              row && "md:grid md:gap-8",
              row && steps.length === 3 && "md:grid-cols-3",
              row && steps.length === 4 && "md:grid-cols-4",
              !row && "gap-10 md:gap-12",
            )}
          >
            {steps.map((step, i) => (
              <Reveal
                key={step.n + step.title}
                index={i}
                className={cn("relative flex gap-6", row && "md:block")}
              >
                <div
                  className={cn(
                    "relative z-10 grid size-[4.5rem] shrink-0 place-items-center rounded-full bg-ink text-center font-bold leading-none text-brand",
                    step.n.length > 2 ? "text-sm" : "text-2xl",
                    row && "md:mb-8",
                  )}
                >
                  {step.n}
                </div>
                <div className={cn("pt-3", row && "md:pr-6 md:pt-0", !row && "max-w-2xl")}>
                  {step.meta && (
                    <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">
                      {step.meta}
                    </p>
                  )}
                  <h3 className="text-h3">{step.title}</h3>
                  <p className="text-body mt-3">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {footnote && (
          <Reveal className="mt-14">
            <p className="text-lg font-bold tracking-tight text-foreground">{footnote}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
