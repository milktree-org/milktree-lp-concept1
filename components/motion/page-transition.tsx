"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Page transition (§5.7). Parked: with a single route there is nothing to
 * transition between yet. Built so that when routes land it can wrap the
 * route group with AnimatePresence for a quick yellow wipe / fade.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
