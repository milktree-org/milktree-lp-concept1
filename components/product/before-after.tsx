"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import type { SprintCase } from "@/lib/sprints";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<SprintCase["kind"], string> = {
  homepage: "Homepage sprint",
  deck: "Deck sprint",
  identity: "Identity tighten-up",
};

/**
 * Before-and-after (PRD 3.2). A draggable divider over two stacked images,
 * keyboard operable (arrow keys move it), with the before and after images
 * both fully visible under reduced motion as a side-by-side pair. No
 * animation library involved: the divider is a range input driving a
 * clip-path, which is transform-free and stays at 60fps.
 */
export function BeforeAfter({
  cases,
  eyebrow = "Before and after",
  title = "Two weeks, one thing fixed.",
}: {
  cases: SprintCase[];
  eyebrow?: string;
  title?: string;
}) {
  if (cases.length === 0) return null;
  return (
    <section className="container-edge py-20 md:py-28">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6">{title}</h2>
        </Reveal>
      </div>
      <StaggerGroup className="mt-14 grid gap-8 lg:grid-cols-2">
        {cases.map((c) => (
          <StaggerItem key={c.slug}>
            <Compare item={c} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

function Compare({ item }: { item: SprintCase }) {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState(50);
  const id = useId();
  const frame = useRef<HTMLDivElement>(null);

  const setFromPointer = (clientX: number) => {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <figure className="rounded-[2rem] border border-border bg-card p-4 md:p-5">
      {reduce ? (
        <div className="grid grid-cols-2 gap-3">
          <Shot src={item.before.src} alt={item.before.alt} label="Before" />
          <Shot src={item.after.src} alt={item.after.alt} label="After" />
        </div>
      ) : (
        <div
          ref={frame}
          className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-[1.5rem]"
          onPointerDown={(e) => {
            (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
            setFromPointer(e.clientX);
          }}
          onPointerMove={(e) => e.buttons === 1 && setFromPointer(e.clientX)}
        >
          <Image src={item.after.src} alt={item.after.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Image src={item.before.src} alt={item.before.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-foreground backdrop-blur">Before</span>
          <span className="absolute right-4 top-4 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-ink">After</span>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-white"
            style={{ left: `${pos}%` }}
          >
            <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-lg">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
                <path d="M6 1 1 6l5 5M12 1l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <label htmlFor={id} className="sr-only">Drag to compare before and after</label>
          <input
            id={id}
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="absolute inset-x-0 bottom-0 h-11 w-full cursor-ew-resize opacity-0"
          />
        </div>
      )}
      <figcaption className="px-1 pt-5">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">
          {KIND_LABEL[item.kind]} · {item.client}
        </p>
        <p className="mt-2 text-lg font-bold tracking-tight text-foreground">{item.problem}</p>
        <p className="text-body mt-2">{item.fix}</p>
        {item.href && (
          <Link
            href={item.href}
            data-cursor="hover"
            className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-foreground transition-colors hover:text-brand"
          >
            See the full case
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        )}
      </figcaption>
    </figure>
  );
}

function Shot({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden rounded-[1.25rem]")}>
      <Image src={src} alt={alt} fill sizes="50vw" className="object-cover" />
      <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-foreground">{label}</span>
    </div>
  );
}
