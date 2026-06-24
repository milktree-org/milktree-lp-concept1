/**
 * Media CDN helpers — serve video from Cloudflare R2 in production,
 * fall back to local `/public` paths when CDN is unset or misconfigured.
 */

const LOCAL_FALLBACK = "";

function getValidCdnBase(): string {
  const raw = process.env.NEXT_PUBLIC_MEDIA_CDN_URL?.trim().replace(/\/$/, "") ?? "";
  if (!raw) return LOCAL_FALLBACK;

  // The S3 API endpoint is for uploads only — browsers get 400/403 here.
  if (raw.includes("r2.cloudflarestorage.com")) return LOCAL_FALLBACK;

  return raw;
}

const CDN_BASE = getValidCdnBase();

/** Resolve a site-root path (`/work/...`) to CDN or local URL. */
export function mediaUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`mediaUrl expects a root path, got: ${path}`);
  }
  return CDN_BASE ? `${CDN_BASE}${path}` : path;
}

/** CDN first, then local — for client-side fallback when CDN fails. */
export function mediaCandidates(path: string): string[] {
  const local = path;
  if (!CDN_BASE) return [local];
  const remote = `${CDN_BASE}${path}`;
  return remote === local ? [local] : [remote, local];
}

/** Hero backdrop loop — optional explicit override for a full-quality master. */
export function heroVideoCandidates(): string[] {
  const override = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();
  if (override && !override.includes("r2.cloudflarestorage.com")) {
    return [...new Set([override, "/work/hero-bg.mp4"])];
  }
  return mediaCandidates("/work/hero-bg.mp4");
}

export function heroVideoSrc(): string {
  return heroVideoCandidates()[0];
}

/** Poster stays local — small, always in repo, instant LCP. */
export function heroPosterSrc(): string {
  return "/work/hero-poster.webp";
}

export function isMediaCdnEnabled(): boolean {
  return Boolean(CDN_BASE);
}

/** Probe whether a video URL is loadable in the browser (works cross-origin). */
export function probeVideoUrl(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const finish = (ok: boolean) => {
      video.removeAttribute("src");
      video.load();
      resolve(ok);
    };

    const timer = window.setTimeout(() => finish(false), 8000);

    video.onloadeddata = () => {
      window.clearTimeout(timer);
      finish(true);
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      finish(false);
    };

    video.src = src;
    video.load();
  });
}
