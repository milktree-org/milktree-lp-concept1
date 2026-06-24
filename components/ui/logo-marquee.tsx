"use client";

import { useReducedMotion } from "framer-motion";

const LOGOS = Array.from(
  { length: 13 },
  (_, i) => `/logos/logo-${i + 1}.png`,
);

/** Three identical sets for a seamless infinite loop. */
const MARQUEE_LOGOS = [...LOGOS, ...LOGOS, ...LOGOS];

/**
 * Auto-scroll client logo marquee — infinite horizontal loop, pauses on hover.
 */
export function LogoMarquee() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="hero__marquee-wrap" style={{ opacity: 1 }}>
        <div className="hero__marquee-track hero__marquee-track--static">
          {LOGOS.map((src) => (
            <div key={src} className="hero__marquee-item">
              <img src={src} alt="client logo" className="hero__marquee-logo" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hero__marquee-wrap" style={{ opacity: 1 }}>
      <div className="hero__marquee-track">
        {MARQUEE_LOGOS.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="hero__marquee-item"
            aria-hidden={i >= LOGOS.length}
          >
            <img src={src} alt="client logo" className="hero__marquee-logo" />
          </div>
        ))}
      </div>
    </div>
  );
}
