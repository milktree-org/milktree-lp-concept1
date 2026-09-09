"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LineMask } from "@/components/motion/line-mask";
import { StartButton } from "@/components/layout/start-button";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE_OUT_EXPO } from "@/lib/motion";
import type { StartProduct } from "@/lib/offer";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay: i * 0.1 },
  }),
};

// The intro paragraph is the LCP element on every product page. It rises
// into place without fading so it paints from the server HTML.
const riseOnly = {
  hidden: { y: 20 },
  visible: (i: number) => ({
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay: i * 0.1 },
  }),
};

/**
 * Opening block for every product and pricing page: eyebrow, line-masked
 * headline, one paragraph, the price on its own line, then the yellow CTA.
 * The CTA is the viewport's single yellow element.
 */
export function ProductHero({
  eyebrow,
  lines,
  sub,
  priceLine,
  priceNote,
  product,
  cta,
  secondary,
  trust,
}: {
  eyebrow: string;
  /** Headline split into lines for the mask reveal. */
  lines: string[];
  sub: string;
  /** e.g. "£799 one-off" — rendered large. */
  priceLine?: string;
  /** e.g. "+VAT · two weeks". */
  priceNote?: string;
  product: StartProduct;
  cta: string;
  secondary?: { label: string; href: string };
  trust?: string;
}) {
  return (
    <section className="container-edge pb-16 pt-32 md:pb-24 md:pt-44">
      <div className="max-w-4xl">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>

        <h1 className="mt-6 text-balance text-[clamp(2.6rem,7.5vw,6rem)] font-bold uppercase leading-[0.96] tracking-[-0.025em] [font-family:var(--font-heading)] [font-stretch:75%]">
          <LineMask lines={lines} startDelay={0.05} />
        </h1>

        <motion.p
          className="text-body-lg mt-7 max-w-2xl"
          custom={1}
          variants={riseOnly}
          initial="hidden"
          animate="visible"
        >
          {sub}
        </motion.p>

        {priceLine && (
          <motion.p
            className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1"
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <span className="text-[clamp(2rem,5vw,3.25rem)] font-bold tracking-tight text-foreground">
              {priceLine}
            </span>
            {priceNote && (
              <span className="text-base font-medium text-faint">{priceNote}</span>
            )}
          </motion.p>
        )}

        <motion.div
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <StartButton size="pill-lg" magnetic product={product} source={`Hero — ${eyebrow}`}>
            {cta}
          </StartButton>
          {secondary && (
            <Link
              href={secondary.href}
              data-cursor="hover"
              className={cn(buttonVariants({ variant: "ghostPill", size: "pill-lg" }))}
            >
              {secondary.label}
              <ArrowRight aria-hidden />
            </Link>
          )}
        </motion.div>

        {trust && (
          <motion.p
            className="mt-6 text-sm font-medium text-faint"
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            {trust}
          </motion.p>
        )}
      </div>
    </section>
  );
}
