"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { heroShowreel } from "@/lib/site";

const SLIDE_SECONDS = 6;
const CROSSFADE_SECONDS = 1.6;

/**
 * Hero backdrop — a slow Ken Burns crossfade loop through curated case-study
 * stills, replacing the single hero-bg.mp4 master. Every frame stays mounted
 * so advancing the reel is a pure opacity/scale swap (no mid-loop image pop),
 * and only `transform`/`opacity` are animated (§5.1). Reduced motion shows a
 * single static frame.
 */
export function HeroShowreel() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroShowreel.length);
    }, SLIDE_SECONDS * 1000);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="hero__showreel">
      {heroShowreel.map((slide, i) => {
        const active = reduce ? i === 0 : i === index;
        return (
          <motion.div
            key={slide.src}
            className="hero__showreel-slide"
            style={{ zIndex: active ? 2 : 1 }}
            initial={false}
            animate={{
              opacity: active ? 1 : 0,
              scale: reduce ? 1 : active ? 1.09 : 1,
            }}
            transition={
              reduce
                ? { duration: 0.001 }
                : {
                    opacity: { duration: CROSSFADE_SECONDS, ease: EASE_OUT_EXPO },
                    scale: { duration: SLIDE_SECONDS, ease: "linear" },
                  }
            }
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="100vw"
              quality={80}
              priority={i === 0}
              className="object-cover"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
