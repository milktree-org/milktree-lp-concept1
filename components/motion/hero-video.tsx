"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Player from "@vimeo/player";

/**
 * Vimeo's background mode strips all chrome (controls, title, byline) and
 * forces muted looping autoplay. Official embed includes the privacy hash.
 */
const VIMEO_SRC =
  "https://player.vimeo.com/video/1212735848?background=1&autopause=0&app_id=58479";

/**
 * Poster matching the reel's opening shot, painted instantly via next/image
 * while the Vimeo iframe boots. The iframe fades in only once the player
 * reports actual playback, so the swap is a clean crossfade from the exact
 * same frame — never a black flash.
 */
const POSTER_SRC = "/work/portfolio/ejw-builttolast.webp";

export function HeroVideo() {
  const reduce = useReducedMotion();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (reduce || !iframeRef.current) return;

    const player = new Player(iframeRef.current);
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setPlaying(true);
    };

    // `play` often never fires for background/autoplay embeds — use timeupdate
    // + playing + getPaused as the reliable signals.
    player.on("timeupdate", (data) => {
      if (data.seconds > 0) reveal();
    });
    player.on("play", reveal);
    player.on("playing", reveal);

    // Kick playback if background autoplay is delayed; do not reveal on
    // resolve — wait for frames so we never crossfade onto Vimeo's white boot.
    void player
      .setVolume(0)
      .then(() => player.play())
      .catch(() => {
        // Autoplay blocked (e.g. iOS Low Power Mode) — keep the poster.
      });

    void player.getPaused().then((paused) => {
      if (!paused) reveal();
    });

    return () => {
      void player.destroy();
    };
  }, [reduce]);

  return (
    <div className="hero__video">
      <Image
        src={POSTER_SRC}
        alt=""
        fill
        sizes="(max-width: 1140px) 100vw, 1100px"
        quality={80}
        priority
        className="object-cover"
      />
      {/* Reduced motion: the poster alone is the hero media — no autoplaying video. */}
      {!reduce && (
        <iframe
          ref={iframeRef}
          src={VIMEO_SRC}
          className="hero__video-frame"
          style={{ opacity: playing ? 1 : 0 }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Milktree showreel"
          aria-hidden
          tabIndex={-1}
        />
      )}
    </div>
  );
}
