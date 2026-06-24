"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Custom cursor (§5.7) — a small ring that trails the pointer and scales up
 * over interactive elements, using mix-blend difference so it inverts against
 * whatever is beneath it. Desktop fine-pointer only; hidden on touch (CSS)
 * and disabled under reduced motion. The native cursor is kept visible for
 * usability — this is an accent, not a replacement.
 */
export function CustomCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const t = e.target as Element | null;
      setActive(!!t?.closest('a, button, [role="button"], [data-cursor="hover"]'));
    };
    const leave = () => setHidden(true);

    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="mt-cursor pointer-events-none fixed left-0 top-0 z-[100] rounded-full"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        mixBlendMode: "difference",
        backgroundColor: "#fff",
      }}
      animate={{
        width: active ? 56 : 14,
        height: active ? 56 : 14,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.5 }}
    />
  );
}
