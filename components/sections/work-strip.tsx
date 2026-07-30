"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO, VIEWPORT_ONCE } from "@/lib/motion";
import { workShowcase } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Full-bleed work marquee — real portfolio pieces drifting across the page.
 * Lives mid-scroll (inside the "new way" band) so imagery is distributed down
 * the page instead of piled into the hero. Pauses on hover; static, swipeable
 * row under reduced motion.
 */
export function WorkStrip({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const items = reduce ? workShowcase : [...workShowcase, ...workShowcase, ...workShowcase];

  return (
    <motion.div
      className={cn("work-strip", className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
    >
      <div className={cn("work-strip__track", reduce && "work-strip__track--static")}>
        {items.map((item, i) => (
          <figure
            key={`${item.src}-${i}`}
            className="work-strip__card"
            aria-hidden={!reduce && i >= workShowcase.length}
          >
            <Image
              src={item.src}
              alt={`${item.title}, ${item.sub}`}
              width={720}
              height={900}
              sizes="(max-width: 640px) 220px, (max-width: 1024px) 240px, 280px"
              className="work-strip__img"
              loading="lazy"
              quality={90}
            />
            <figcaption className="work-strip__caption">
              <span className="work-strip__caption-title">{item.title}</span>
              <span className="work-strip__caption-sub">{item.sub}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </motion.div>
  );
}
