import type { Variants, Transition } from "framer-motion";

/**
 * Centralised motion language (§5).
 * "Alive, not animated" — slow, eased, restrained. One move at a time.
 * Only ever animate `transform` and `opacity`.
 */

// Signature easing — expo-out. Use everywhere.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  reveal: 0.8,
  revealSlow: 0.9,
  hover: 0.3,
  fast: 0.2,
} as const;

export const STAGGER = {
  tight: 0.06,
  base: 0.08,
  loose: 0.1,
} as const;

// Default reveal: fade + rise. `custom` index drives the stagger delay.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_OUT_EXPO, delay: i * STAGGER.base },
  }),
};

// Reduced-motion variant: opacity only, near-instant (§5.8).
export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.001 } },
};

// Plain fade (no translate) — used for overlays, media.
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { duration: DURATION.reveal, ease: EASE_OUT_EXPO, delay: i * STAGGER.base },
  }),
};

// Parent that staggers its children (use with StaggerGroup).
export const staggerParent = (
  stagger: number = STAGGER.base,
  delayChildren: number = 0,
): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Child item paired with staggerParent.
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_OUT_EXPO },
  },
};

// Line-mask child for the hero headline (§5.4): rises from below a clip.
export const lineMaskChild: Variants = {
  hidden: { y: "110%" },
  show: (i = 0) => ({
    y: "0%",
    transition: { duration: DURATION.revealSlow, ease: EASE_OUT_EXPO, delay: 0.15 + i * 0.09 },
  }),
};

// Shared spring for magnetic / cursor interactions.
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 150, damping: 15, mass: 0.1 };
export const SPRING_SNAP: Transition = { type: "spring", stiffness: 350, damping: 25, mass: 0.4 };

// Standard scroll-reveal viewport config — reveal once, slightly early.
export const VIEWPORT_ONCE = { once: true, margin: "-10% 0px" } as const;
