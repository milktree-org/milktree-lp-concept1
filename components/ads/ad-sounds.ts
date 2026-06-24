"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdFormat, AdSlide, SfxType, SocialAd } from "@/lib/ads";
import { AD_FORMATS } from "@/lib/ads";
import { cn } from "@/lib/utils";

type AdSounds = Record<SfxType, () => void>;

export function useAdSounds(enabled: boolean): AdSounds {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(
    (type: SfxType) => {
      if (!enabled) return;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!ctxRef.current) ctxRef.current = new Ctx();
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      const t = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);

      if (type === "hit") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        gain.gain.setValueAtTime(0.55, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.2);
      } else if (type === "tick") {
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(1400, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.05);
      } else if (type === "whoosh") {
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(900, t);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        src.connect(filter);
        filter.connect(gain);
        src.start(t);
      } else if (type === "rise") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.45);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 0.6);
      }
    },
    [enabled],
  );

  useEffect(
    () => () => {
      void ctxRef.current?.close();
    },
    [],
  );

  return {
    hit: () => play("hit"),
    tick: () => play("tick"),
    whoosh: () => play("whoosh"),
    rise: () => play("rise"),
  };
}

export function useAdSlideshow(ad: SocialAd, playing: boolean, sounds: AdSounds, onEnd?: () => void) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    setIndex(0);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }

    const slide = ad.slides[index];
    if (slide?.sfx) sounds[slide.sfx]();

    timerRef.current = window.setTimeout(() => {
      if (index >= ad.slides.length - 1) {
        onEnd?.();
        setIndex(0);
      } else {
        setIndex((i) => i + 1);
      }
    }, slide.duration * 1000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [ad.slides, index, onEnd, playing, sounds]);

  return { index, slide: ad.slides[index], restart, setIndex };
}

export { AD_FORMATS };
export type { AdFormat, AdSlide, SocialAd };
