"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";

type LineMaskProps = {
  /** each entry is rendered as its own clipped line */
  lines: React.ReactNode[];
  className?: string;
  /** delay before the first line starts */
  startDelay?: number;
};

/**
 * Hero headline reveal (§5.4) — each line sits in an overflow-hidden mask;
 * its child rises from y:110% to 0, staggered. The signature opening moment.
 * Under reduced motion the lines simply fade in.
 */
export function LineMask({ lines, className, startDelay = 0 }: LineMaskProps) {
  const reduce = useReducedMotion();

  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em]">
          {reduce ? (
            <motion.span
              className="block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: startDelay + i * 0.05 }}
            >
              {line}
            </motion.span>
          ) : (
            <motion.span
              className="block will-change-transform"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: startDelay + 0.15 + i * 0.09 }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </span>
  );
}
