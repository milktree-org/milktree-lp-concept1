"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortfolioItem = {
  title: string;
  category: string;
  href?: string;
  /** poster still (preferred). Falls back to a generated gradient. */
  poster?: string;
  /** short looping muted mp4; plays on hover, pauses on leave. */
  video?: string;
  /** tailwind gradient classes for the placeholder when no poster */
  tint?: string;
};

/**
 * Portfolio card (§5.7, §9) — lifts on hover (scale + soft shadow); its video
 * loop plays on hover and pauses on leave. Poster image for instant paint;
 * video is lazy (preload="none"). Falls back to a tasteful gradient block
 * until real assets land in /public/work.
 */
export function PortfolioCard({
  item,
  index = 0,
  className,
}: {
  item: PortfolioItem;
  index?: number;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function play() {
    videoRef.current?.play().catch(() => {});
  }
  function pause() {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }

  const Wrapper = item.href ? Link : "div";
  const wrapperProps = item.href ? { href: item.href } : {};

  return (
    <Wrapper
      {...(wrapperProps as { href: string })}
      onMouseEnter={play}
      onMouseLeave={pause}
      data-cursor="hover"
      className={cn(
        "group relative block overflow-hidden rounded-[2rem] border border-border bg-card",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)]",
        "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]",
        "motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* placeholder gradient (always present, sits behind media) */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            item.tint ?? "from-neutral-800 via-neutral-900 to-black",
          )}
        />
        {item.poster && (
          <Image
            src={item.poster}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        {item.video && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            muted
            loop
            playsInline
            preload="none"
            poster={item.poster}
          >
            <source src={item.video} type="video/mp4" />
          </video>
        )}

        {/* readability scrim — keeps the label legible over any artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-faint">
              {item.category}
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">
              {item.title}
            </h3>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Wrapper>
  );
}
