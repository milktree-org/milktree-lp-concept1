"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { LineMask } from "@/components/motion/line-mask";
import { BookButton } from "@/components/layout/book-button";
import { AnchorLink } from "@/components/layout/anchor-link";
import { LogoMarquee } from "@/components/ui/logo-marquee";
import { heroPosterSrc, heroVideoCandidates } from "@/lib/media";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { heroShowcase, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay: i * 0.1 },
  }),
};

/**
 * Hero — centered copy over a video backdrop, then a full-bleed work reel and
 * client logos. Nav stays in the site header.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const showcaseItems = reduce
    ? heroShowcase
    : [...heroShowcase, ...heroShowcase, ...heroShowcase];

  return (
    <section id="hero" className="hero">
      <HeroVideoBackground />

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
                lines={["Your creative", "department.", "On demand."]}
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
              A senior brand and design team, embedded in your business.
              On-brand work shipped fast, for one flat monthly fee.
            </motion.p>

            <motion.div
              className="hero__cta-group"
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <BookButton size="pill-lg" magnetic withIcon className="hero__cta-primary">
                Book a free brand audit
              </BookButton>
              <AnchorLink href="#work" className="hero__cta-secondary">
                <Play className="size-4 fill-current" aria-hidden />
                See our work
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
        </div>

        <motion.div
          className="hero__showcase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.55, duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          <div
            className={cn(
              "hero__showcase-track",
              reduce && "hero__showcase-track--static",
            )}
          >
            {showcaseItems.map((item, i) => (
              <div
                key={`${item.src}-${i}`}
                className="hero__showcase-card"
                aria-hidden={!reduce && i >= heroShowcase.length}
              >
                <img
                  src={item.src}
                  alt={`${item.title} — ${item.sub}`}
                  className="hero__card-img"
                  loading={i < 6 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.65, duration: 0.8 }}
        >
          <LogoMarquee />
        </motion.div>
      </div>
    </section>
  );
}

function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const candidates = heroVideoCandidates();
  const [srcIndex, setSrcIndex] = useState(0);
  const src = candidates[srcIndex] ?? candidates[0];

  useEffect(() => {
    setSrcIndex(0);
  }, [candidates.join("|")]);

  useEffect(() => {
    if (reduce) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().catch(() => undefined);
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });

    return () => video.removeEventListener("loadeddata", play);
  }, [reduce, src]);

  function handleVideoError() {
    setSrcIndex((current) => (current + 1 < candidates.length ? current + 1 : current));
  }

  return (
    <div aria-hidden className="hero__media">
      {!reduce && (
        <video
          key={src}
          ref={videoRef}
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={heroPosterSrc()}
          onError={handleVideoError}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
      <div className="hero__media-scrim" />
    </div>
  );
}
