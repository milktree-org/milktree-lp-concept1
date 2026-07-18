"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WorkStrip } from "@/components/sections/work-strip";
import { staggerParent, staggerItem, fadeUpReduced, VIEWPORT_ONCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The new way (§7.4) — the category reframe as a centered manifesto statement,
 * revealed word by word. The single yellow word is the keyword "embedded".
 */
const PARTS: { text: string; brand?: boolean }[] = [
  { text: "There's a better way to get design done. An" },
  { text: "embedded", brand: true },
  { text: "creative team you switch on, scale and direct. No headcount, no risk." },
];

export function NewWay() {
  const reduce = useReducedMotion();
  // flatten into words while tracking which should be branded
  const words = PARTS.flatMap((part) =>
    part.text.split(" ").map((w) => ({ w, brand: part.brand })),
  );

  return (
    <section className="border-y border-border bg-surface pb-20 pt-28 md:pb-28 md:pt-40">
      <div className="container-edge flex flex-col items-center text-center">
        <Eyebrow>A better way</Eyebrow>

        <motion.h2
          className="mt-8 max-w-[24ch] text-balance text-[clamp(2.5rem,7.5vw,5.75rem)] font-bold leading-[1.02] tracking-[-0.025em]"
          variants={staggerParent(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          {words.map((item, i) => (
            <motion.span
              key={i}
              variants={reduce ? fadeUpReduced : staggerItem}
              className={cn("inline-block", item.brand && "text-brand")}
            >
              {item.w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </motion.h2>

        <motion.p
          className="text-body-lg mt-8 max-w-md"
          variants={reduce ? fadeUpReduced : staggerItem}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
        >
          You direct. We design. Nothing ships off-brand.
        </motion.p>
      </div>

      {/* The proof under the claim — real work drifting across the full bleed */}
      <WorkStrip className="mt-16 md:mt-24" />
    </section>
  );
}
