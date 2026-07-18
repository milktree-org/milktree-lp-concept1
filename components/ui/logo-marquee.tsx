"use client";

import { useReducedMotion } from "framer-motion";

const LOGOS = Array.from(
  { length: 12 },
  (_, i) => `/logos/logo-${i + 1}.png`,
);

/** One sequence — doubled so a single half always fills wide viewports. */
const SEQUENCE = [...LOGOS, ...LOGOS];

function LogoRow({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="hero__marquee-group" aria-hidden={ariaHidden || undefined}>
      {SEQUENCE.map((src, i) => (
        <div key={`${src}-${i}`} className="hero__marquee-item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="hero__marquee-logo" />
        </div>
      ))}
    </div>
  );
}

/**
 * Auto-scroll client logo marquee — seamless infinite loop, pauses on hover.
 * Two identical groups; CSS translates by exactly 50% so the seam is invisible.
 */
export function LogoMarquee() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="hero__marquee-wrap" role="presentation">
        <div className="hero__marquee-track hero__marquee-track--static" aria-hidden>
          {LOGOS.map((src) => (
            <div key={src} className="hero__marquee-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="hero__marquee-logo" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hero__marquee-wrap">
      <div className="hero__marquee-track">
        <LogoRow />
        <LogoRow ariaHidden />
      </div>
    </div>
  );
}
