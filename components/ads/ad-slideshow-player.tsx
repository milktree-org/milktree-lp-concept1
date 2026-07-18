"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { AdFormat, SocialAd } from "@/lib/ads";
import { AD_FORMATS } from "@/lib/ads";
import { mediaCandidates, probeVideoUrl } from "@/lib/media";
import { useAdSlideshow, useAdSounds } from "@/components/ads/ad-sounds";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  ad: SocialAd;
  format: AdFormat;
  className?: string;
  preferVideo?: boolean;
};

export function AdSlideshowPlayer({ ad, format, className, preferVideo = true }: Props) {
  const [soundOn, setSoundOn] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const sounds = useAdSounds(soundOn && !videoReady);
  const { index, slide, restart } = useAdSlideshow(ad, playing && !videoReady, sounds);
  const dims = AD_FORMATS[format];
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    setVideoSrc(null);
    setVideoReady(false);
    if (!preferVideo) return;

    const cinematicCandidates = mediaCandidates(`/ads/cinematic/story/${ad.id}.mp4`);
    const standardCandidates = mediaCandidates(`/ads/${format}/${ad.id}.mp4`);
    const candidateLists =
      format === "story" ? [cinematicCandidates, standardCandidates] : [standardCandidates];

    let cancelled = false;

    (async () => {
      for (const candidates of candidateLists) {
        for (const src of candidates) {
          if (cancelled) return;
          const ok = await probeVideoUrl(src);
          if (ok) {
            setVideoSrc(src);
            setVideoReady(true);
            return;
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [preferVideo, ad.id, format]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "relative mx-auto w-full overflow-hidden rounded-[2rem] border border-border bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)]",
          format === "story" ? "max-w-[320px]" : "max-w-[360px]",
        )}
        style={{ aspectRatio: dims.ratio }}
      >
        {videoReady && videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted={!soundOn}
            playsInline
            controls={false}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${ad.id}-${index}`}
              initial={{ opacity: 0, scale: 1.04, filter: "brightness(0.7)" }}
              animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "brightness(0.5)" }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
              className="absolute inset-0"
            >
              <SlideVisual slide={slide} format={format} />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Progress ticks */}
        <div className="absolute inset-x-0 top-3 flex gap-1 px-3">
          {ad.slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors duration-200",
                i <= index || videoReady ? "bg-brand" : "bg-white/20",
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="grid size-11 place-items-center rounded-full border border-border bg-white/5 text-foreground transition hover:bg-white/10"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
        </button>
        <button
          type="button"
          onClick={() => {
            restart();
            setPlaying(true);
          }}
          className="grid size-11 place-items-center rounded-full border border-border bg-white/5 text-foreground transition hover:bg-white/10"
          aria-label="Restart"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setSoundOn((s) => !s)}
          className="grid size-11 place-items-center rounded-full border border-border bg-white/5 text-foreground transition hover:bg-white/10"
          aria-label={soundOn ? "Mute sound" : "Unmute sound"}
        >
          {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function SlideVisual({ slide }: { slide: SocialAd["slides"][number]; format?: AdFormat }) {
  if (slide.kind === "image" || slide.kind === "stat") {
    return (
      <div className="relative h-full w-full">
        <Image src={slide.src} alt="" fill className="object-cover" sizes="360px" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        {slide.kind === "stat" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[clamp(3rem,14vw,4.5rem)] font-bold leading-none tracking-tight text-brand">
              {slide.value}
            </p>
            <p className="mt-3 text-lg font-bold text-foreground">{slide.label}</p>
          </div>
        ) : slide.label ? (
          <div className="absolute inset-x-0 bottom-0 p-5">
            <span className="mb-2 block h-0.5 w-8 bg-brand" />
            <p className="text-sm font-bold text-foreground">{slide.label}</p>
          </div>
        ) : null}
      </div>
    );
  }

  if (slide.kind === "cta") {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-black px-8 text-center">
        <p className="text-[clamp(1.6rem,7vw,2.2rem)] font-bold tracking-tight text-foreground">
          {slide.headline}
        </p>
        <span className="mt-8 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-ink">
          {slide.sub}
        </span>
        <p className="mt-10 text-xs text-faint">milktree.agency</p>
      </div>
    );
  }

  const accent = slide.accentWord
    ? slide.headline.split(new RegExp(`(${slide.accentWord})`, "i"))
    : null;

  return (
    <div className="flex h-full flex-col items-center justify-center bg-black px-8 text-center">
      <span className="mb-6 block h-0.5 w-10 bg-brand" />
      <h3 className="max-w-[16ch] text-[clamp(1.8rem,8vw,2.6rem)] font-bold leading-[0.95] tracking-tight text-foreground">
        {accent ? (
          accent.map((part, i) =>
            part.toLowerCase() === slide.accentWord?.toLowerCase() ? (
              <span key={i} className="text-brand">
                {part}
              </span>
            ) : (
              part
            ),
          )
        ) : (
          slide.headline
        )}
      </h3>
      {slide.sub ? <p className="text-body mt-4 max-w-[22ch]">{slide.sub}</p> : null}
    </div>
  );
}
