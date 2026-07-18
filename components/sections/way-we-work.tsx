"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { FileStack, Library, Zap, MessageSquare } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Step = {
  title: string;
  body: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const PANEL_IMAGES = [
  {
    src: "/work/way-we-work/01-queue.webp",
    alt: "Managed design queue showing briefs moving from queued to delivered",
  },
  {
    src: "/work/way-we-work/02-library.webp",
    alt: "Organised brand library with logos, colours, type and templates",
  },
  {
    src: "/work/way-we-work/03-speed.webp",
    alt: "Turnaround dashboard highlighting 48-hour average delivery",
  },
  {
    src: "/work/way-we-work/04-review.webp",
    alt: "In-review screen with comments and approve controls",
  },
] as const;

const STEPS: Step[] = [
  {
    title: "One managed queue",
    body: "Drop briefs in and watch them move from requested to in progress to delivered. Add as many as you like.",
    Icon: FileStack,
  },
  {
    title: "A living brand library",
    body: "Every logo, asset, template and guideline in one organised place. Always current, never lost in inboxes.",
    Icon: Library,
  },
  {
    title: "Senior work, fast",
    body: "Real senior designers and creative direction, delivered in days. No juniors, no hand-holding.",
    Icon: Zap,
  },
  {
    title: "Direct and revise",
    body: "Comment, adjust and approve in place. The control of an in-house team without the back-and-forth.",
    Icon: MessageSquare,
  },
];

export function WayWeWork() {
  const reduce = useReducedMotion();

  // Reduced-motion: a normal stacked layout, no pinning.
  if (reduce) {
    return (
      <section id="way" className="container-edge scroll-mt-28 py-24">
        <Stacked />
      </section>
    );
  }

  // Single #way anchor wrapping both variants: stacked on mobile (clean, no
  // awkward pin on small screens), the pinned scroll-experience on desktop.
  return (
    <section id="way" className="scroll-mt-28">
      <div className="container-edge py-24 lg:hidden">
        <Stacked />
      </div>
      <div className="hidden lg:block">
        <PinnedShowcase />
      </div>
    </section>
  );
}

function Stacked() {
  return (
    <>
      <Header />
      <div className="mt-12 space-y-12">
        {STEPS.map((step, i) => (
          <div key={step.title} className="grid gap-6 md:grid-cols-2 md:items-center">
            <StepCopy step={step} index={i} active />
            <Panel index={i} />
          </div>
        ))}
      </div>
    </>
  );
}

function PinnedShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
    setActive(idx);
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${STEPS.length * 90}vh` }}>
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden border-y border-border bg-surface py-16">
        <div className="container-edge grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: copy that swaps */}
          <div>
            <Header />
            <div className="mt-10 space-y-1">
              {STEPS.map((step, i) => (
                <button
                  key={step.title}
                  onClick={() => scrollToStep(ref, i)}
                  className="block w-full text-left"
                  aria-current={active === i}
                >
                  <StepRow step={step} index={i} active={active === i} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: visual panel that swaps */}
          <div className="relative h-[420px] sm:h-[460px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                className="absolute inset-0"
              >
                <Panel index={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function scrollToStep(ref: React.RefObject<HTMLElement | null>, i: number) {
  const el = ref.current;
  if (!el) return;
  const start = el.offsetTop;
  const total = el.offsetHeight - window.innerHeight;
  const y = start + (total * (i + 0.5)) / STEPS.length;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function Header() {
  return (
    <div className="max-w-xl">
      <Reveal>
        <Eyebrow>The way we work</Eyebrow>
      </Reveal>
      <Reveal index={1}>
        <h2 className="text-h2 mt-6">Everything in one place.</h2>
      </Reveal>
      <Reveal index={2}>
        <p className="text-body mt-4">
          Briefs, assets, delivery and feedback in one managed workspace, so
          your brand stays consistent and nothing slips through the cracks.
        </p>
      </Reveal>
    </div>
  );
}

/* Active-aware copy row (pinned variant) */
function StepRow({ step, index, active }: { step: Step; index: number; active: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-transparent p-4 transition-all duration-300",
        active ? "border-border bg-white/[0.03]" : "opacity-50 hover:opacity-80",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-300",
          active ? "bg-brand text-brand-ink" : "bg-white/5 text-foreground",
        )}
      >
        <step.Icon className="size-5" />
      </span>
      <div>
        <h3 className="text-lg font-bold tracking-tight">
          <span className="mr-2 text-faint">{String(index + 1).padStart(2, "0")}</span>
          {step.title}
        </h3>
        <p className="text-body mt-1 text-[0.98rem]">{step.body}</p>
      </div>
    </div>
  );
}

/* Static copy (reduced-motion stacked variant) */
function StepCopy({ step, index, active }: { step: Step; index: number; active: boolean }) {
  return <StepRow step={step} index={index} active={active} />;
}

/* ----------------------------- Product UI panels ------------------------- */
function Panel({ index }: { index: number }) {
  const image = PANEL_IMAGES[index] ?? PANEL_IMAGES[0];
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover object-top"
        sizes="(max-width: 1024px) 100vw, 560px"
        priority={index === 0}
      />
    </div>
  );
}
