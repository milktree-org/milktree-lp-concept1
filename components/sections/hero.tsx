"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { LineMask } from "@/components/motion/line-mask";
import { HeroVideo } from "@/components/motion/hero-video";
import { StartButton } from "@/components/layout/start-button";
import { AnchorLink } from "@/components/layout/anchor-link";
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

/**
 * Hero — black canvas with centered copy, the showreel video framed in a
 * media card below the CTAs, closed by the client logo marquee. The work
 * showcase strip
 * lives further down the page (§WorkStrip) so imagery is spread across the
 * scroll instead of front-loaded here.
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
                lines={["Design shouldn\u2019t be", "your bottleneck."]}
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
              Your embedded brand &amp; design team. Unlimited requests, senior
              work back in 48 hours, one flat monthly fee.
            </motion.p>

            <motion.div
              className="hero__cta-group"
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <StartButton size="pill-lg" magnetic source="Hero" className="hero__cta-primary">
                Get started
              </StartButton>
              <AnchorLink href="#plans" className="hero__cta-secondary">
                <ArrowDown className="size-4" aria-hidden />
                See plans
              </AnchorLink>
            </motion.div>

            <motion.p
              className="hero__trust"
              custom={3}
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
            variants={fadeUp}
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
          <LogoMarquee />
        </motion.div>
      </div>
    </section>
  );
}
