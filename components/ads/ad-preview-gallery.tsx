"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { AdSlideshowPlayer } from "@/components/ads/ad-slideshow-player";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import type { AdFormat } from "@/lib/ads";
import {
  AD_FORMATS,
  adBookingUrl,
  adVideoSrc,
  cinematicAdVideoSrc,
  socialAds,
} from "@/lib/ads";
import { cn } from "@/lib/utils";

export function AdPreviewGallery() {
  const [activeId, setActiveId] = useState(socialAds[0].id);
  const [format, setFormat] = useState<AdFormat>("story");

  const active = socialAds.find((a) => a.id === activeId) ?? socialAds[0];

  return (
    <div className="container-edge py-24 md:py-32">
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>Social ads</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h1 className="text-display mt-6 max-w-[14ch]">Five ways to stop the scroll.</h1>
        </Reveal>
        <Reveal index={2}>
          <p className="text-body mt-6 max-w-2xl">
            Interactive story and square ads built from real Milktree work — 10–15 seconds,
            sound on, ready to drive traffic to the homepage or brand audit booking.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <Reveal index={3} className="order-2 lg:order-1">
          <AdSlideshowPlayer ad={active} format={format} />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={adBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "brand", size: "pill" })}
            >
              {(() => {
                const last = active.slides.at(-1);
                return last?.kind === "cta" ? last.sub : "Book a free brand audit";
              })()}
              <ArrowUpRight className="size-4" />
            </a>
            <Link href="/" className={buttonVariants({ variant: "ghostPill", size: "pill" })}>
              milktree.agency
            </Link>
            <a
              href={
                format === "story"
                  ? cinematicAdVideoSrc(active.id)
                  : adVideoSrc(active.id, format)
              }
              download
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              <Download className="size-4" />
              Download {AD_FORMATS[format].label}
            </a>
          </div>
        </Reveal>

        <div className="order-1 space-y-6 lg:order-2">
          <Reveal index={3}>
            <div className="flex gap-2 rounded-full border border-border bg-surface p-1">
              {(Object.keys(AD_FORMATS) as AdFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 text-sm font-bold transition",
                    format === f ? "bg-brand text-brand-ink" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {AD_FORMATS[f].label}
                </button>
              ))}
            </div>
          </Reveal>

          <ul className="space-y-2">
            {socialAds.map((ad, i) => (
              <Reveal key={ad.id} index={4 + i}>
                <button
                  type="button"
                  onClick={() => setActiveId(ad.id)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition duration-300",
                    activeId === ad.id
                      ? "border-border bg-white/[0.04]"
                      : "border-transparent bg-white/[0.02] opacity-70 hover:opacity-100",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-faint">
                        Option {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-1 text-lg font-bold tracking-tight">{ad.title}</h2>
                      <p className="text-body mt-1 text-[0.95rem]">{ad.description}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      {ad.duration}s
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
