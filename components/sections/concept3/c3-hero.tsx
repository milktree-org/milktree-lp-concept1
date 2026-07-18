"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { C3Video } from "@/components/sections/concept3/c3-video";
import { AnchorLink } from "@/components/layout/anchor-link";
import { trackContact } from "@/lib/analytics/meta-tracking";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Plans", href: "/#plans" },
  { label: "Contact", href: "#connect" },
];

/** Splits text into characters and fades each in with a 0.07s stagger. */
function StaggeredFade({
  text,
  startDelay = 0,
}: {
  text: string;
  startDelay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  return (
    <span ref={ref} aria-label={text} role="text" className="inline-block">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={
            reduce
              ? { duration: 0.001 }
              : { duration: 0.4, delay: startDelay + i * 0.07 }
          }
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Cinematic hero — full-viewport looping reel, glass nav pill, character-
 * staggered Anton headline with a yellow Condiment overlay, liquid-glass CTA.
 */
export function C3Hero() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden rounded-b-[32px]">
      <C3Video
        src="/ads/cinematic/story/abstract-safe.mp4"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-black/45" />

      {/* Meta bar */}
      <header className="relative z-20 mx-auto flex w-full max-w-[1831px] items-center justify-between px-5 pt-6 md:px-10 lg:justify-center lg:gap-16">
        <Link
          href="/"
          className="c3-display text-base tracking-[0.25em] text-(--c3-cream) lg:tracking-[0.3em]"
        >
          Milktree
        </Link>

        <nav className="liquid-glass hidden rounded-[28px] px-[52px] py-[24px] lg:block">
          <ul className="flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.label}>
                <AnchorLink
                  href={link.href}
                  className="c3-display text-[13px] tracking-[0.2em] text-(--c3-cream)/80 transition-colors duration-300 hover:text-(--c3-accent)"
                >
                  {link.label}
                </AnchorLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="grid size-11 place-items-center text-(--c3-cream) lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mobile-menu-glass fixed inset-x-4 top-16 z-50 flex flex-col items-center gap-5 rounded-2xl py-8 md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06 }}
              >
                <AnchorLink
                  href={link.href}
                  onNavigate={() => setOpen(false)}
                  className="c3-display text-sm font-light uppercase tracking-[0.25em] text-(--c3-cream)/90 transition-colors hover:text-(--c3-accent)"
                >
                  {link.label}
                </AnchorLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Hero content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pt-12 text-center sm:px-8 sm:pt-16 md:pt-24">
        <div className="relative">
          <h1 className="c3-display leading-[1.05] text-(--c3-cream) [font-size:clamp(2.75rem,9vw,8.5rem)] sm:leading-[1]">
            <span className="block">
              <StaggeredFade text="YOUR CREATIVE" />
            </span>
            <span className="block">
              <StaggeredFade text="DEPARTMENT" startDelay={0.35} />
            </span>
          </h1>
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="c3-script absolute -right-4 -bottom-8 -rotate-2 whitespace-nowrap text-(--c3-accent) drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] [font-size:clamp(1.75rem,4.5vw,4rem)] sm:-right-10 sm:-bottom-12"
          >
            on demand
          </motion.span>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="c3-mono mt-8 max-w-xs text-sm font-light uppercase leading-relaxed text-(--c3-cream)/70 sm:mt-10 sm:max-w-md sm:text-base"
        >
          An embedded brand &amp; design team,
          <br className="hidden sm:block" /> senior work back in 48 hours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="mt-8 sm:mt-10"
        >
          <Link
            href="/start"
            onClick={() => trackContact({ eventSource: "Concept3 Hero" })}
            className="liquid-glass liquid-glass-hover c3-display inline-block rounded-full px-7 py-3.5 text-[13px] tracking-[0.18em] text-(--c3-cream)/90 sm:px-10 sm:py-4 sm:tracking-[0.2em]"
          >
            Get started
          </Link>
        </motion.div>
      </div>

      <div className="relative z-10 pb-10" />
    </section>
  );
}
