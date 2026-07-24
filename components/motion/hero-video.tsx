"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Vimeo's background mode strips all chrome (controls, title, byline) and
 * forces muted looping autoplay — no player.js script needed.
 */
const VIMEO_SRC =
  "https://player.vimeo.com/video/1212678355?background=1&autopause=0&app_id=58479";

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
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes("vimeo.com")) return;
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.event === "ready") {
          // Subscribe to play via Vimeo's postMessage API (no SDK needed).
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ method: "addEventListener", value: "play" }),
            "https://player.vimeo.com"
          );
        }
        if (data.event === "play") setPlaying(true);
      } catch {
        // Non-JSON messages from other embeds — ignore.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Safety net: if the play event never arrives (blocked messaging, slow
  // network), reveal the video shortly after the iframe itself has loaded.
  const onIframeLoad = () => {
    window.setTimeout(() => setPlaying(true), 1200);
  };

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
          onLoad={onIframeLoad}
          aria-hidden
          tabIndex={-1}
        />
      )}
    </div>
  );
}
