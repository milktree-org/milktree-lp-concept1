"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { staggerParent, staggerItem, fadeUpReduced, STAGGER, VIEWPORT_ONCE } from "@/lib/motion";

type GroupProps = HTMLMotionProps<"div"> & {
  stagger?: number;
  delayChildren?: number;
};

/**
 * Parent that cascades its <StaggerItem> children on scroll-in (§5.1).
 */
export function StaggerGroup({
  stagger = STAGGER.base,
  delayChildren = 0,
  children,
  ...props
}: GroupProps) {
  return (
    <motion.div
      variants={staggerParent(stagger, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT_ONCE}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = HTMLMotionProps<"div"> & {
  as?: "div" | "li" | "span" | "tr";
};

export function StaggerItem({ as = "div", children, ...props }: ItemProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag variants={reduce ? fadeUpReduced : staggerItem} {...props}>
      {children}
    </MotionTag>
  );
}
