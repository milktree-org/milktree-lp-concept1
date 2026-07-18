"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type C3VideoProps = {
  src: string;
  className?: string;
  poster?: string;
};

/**
 * Looping muted background video. Skipped entirely under reduced motion —
 * the section's dark background takes over.
 */
export function C3Video({ src, className, poster }: C3VideoProps) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <video
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
