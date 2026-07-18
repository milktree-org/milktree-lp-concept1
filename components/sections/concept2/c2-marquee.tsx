"use client";

import { useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";

const LOGOS = Array.from({ length: 13 }, (_, i) => `/logos/logo-${i + 1}.png`);

/** Two identical sets — the -50% translate loops seamlessly. */
const TRACK = [...LOGOS, ...LOGOS];

/**
 * Trust bar — hairline-bounded infinite logo marquee on white, logos knocked
 * back to black. Pauses on hover; renders a static scrollable row under
 * reduced motion.
 */
export function C2Marquee() {
  const reduce = useReducedMotion();

  return (
    <section className="border-y border-border">
      <div className="container-edge py-10 md:py-12">
        <Reveal>
          <p className="c2-label">(The team behind 200+ growing brands)</p>
        </Reveal>
      </div>
      <div className="c2-marquee border-t border-border py-8 md:py-10">
        {reduce ? (
          <div className="c2-marquee__track c2-marquee__track--static">
            {LOGOS.map((src) => (
              <div key={src} className="c2-marquee__item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Client logo" className="c2-marquee__logo" />
              </div>
            ))}
          </div>
        ) : (
          <div className="c2-marquee__track">
            {TRACK.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="c2-marquee__item"
                aria-hidden={i >= LOGOS.length}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Client logo" className="c2-marquee__logo" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
