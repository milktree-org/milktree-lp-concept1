"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, fadeUpReduced, VIEWPORT_ONCE } from "@/lib/motion";

type RevealProps = HTMLMotionProps<"div"> & {
  /** stagger index — multiplies the base delay */
  index?: number;
  /** render as a different element if needed */
  as?: "div" | "section" | "li" | "span";
};

/**
 * The reveal primitive (§5.3). Drop around ~any block that should
 * fade + rise once on scroll-in. Honors reduced motion (opacity only).
 */
export function Reveal({ index = 0, as = "div", children, ...props }: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      variants={reduce ? fadeUpReduced : fadeUp}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT_ONCE}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
