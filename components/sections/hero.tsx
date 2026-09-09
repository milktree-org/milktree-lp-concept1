"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LineMask } from "@/components/motion/line-mask";
import { HeroVideo } from "@/components/motion/hero-video";
import { StartButton } from "@/components/layout/start-button";
import { LogoMarquee } from "@/components/ui/logo-marquee";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { site } from "@/lib/site";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay: i * 0.1 },
  }),
};

// The media card holds the page's LCP element (the showreel poster). It rises
// into place but never starts at opacity 0, so the poster paints from the
// server HTML instead of waiting for hydration. Transform-only keeps the
// motion and takes seconds off LCP on slow devices.
const riseOnly = {
  hidden: { y: 24 },
  visible: (i: number) => ({
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: i * 0.1 },
  }),
};

/**
 * Hero (spec §6.1.1) — the founder's problem in one line, the studio's answer
 * in one paragraph, the yellow CTA, the showreel in a media card, closed by
 * the client logo marquee. The CTA is the viewport's single yellow element.
 */
export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <div className="hero__shell">
          <div className="hero__copy">
            <motion.h1
              className="hero__headline"
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <LineMask
                className="inline-block text-center"
                lines={["Your business has grown.", "Your brand hasn't caught up."]}
                startDelay={0.05}
              />
            </motion.h1>

            <motion.p
              className="hero__subheadline"
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              Milktree is a UK design studio that builds brands you can see on the
              high street. Fix one thing in two weeks, rebuild the lot in six, or
              keep us on retainer. Fixed prices, no proposals.
            </motion.p>

            <motion.div
              className="hero__cta-group"
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <StartButton size="pill-lg" magnetic source="Hero" className="hero__cta-primary">
                Start a project
              </StartButton>
              <Link href="/work" data-cursor="hover" className="hero__cta-secondary">
                See the work
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </motion.div>

            <motion.p
              className="hero__cta-note"
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {site.ctaNote}
            </motion.p>

            <motion.p
              className="hero__trust"
              custom={3.5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              {site.trustLine}
            </motion.p>
          </div>

          <motion.div
            className="hero__media-card"
            custom={4}
            variants={riseOnly}
            initial="hidden"
            animate="visible"
          >
            <HeroVideo />
          </motion.div>
        </div>

        <motion.div
          className="hero__footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.55, duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          <p className="hero__marquee-caption">{site.marqueeCaption}</p>
          <LogoMarquee />
        </motion.div>
      </div>
    </section>
  );
}
