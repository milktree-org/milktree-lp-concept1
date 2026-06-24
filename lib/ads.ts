import adsData from "./ads.json";
import { mediaUrl } from "./media";
import { CAL_URL } from "./site";

export type SfxType = "hit" | "whoosh" | "tick" | "rise";

export type AdSlide =
  | {
      kind: "hook" | "tagline";
      headline: string;
      sub?: string;
      accentWord?: string;
      duration: number;
      sfx?: SfxType;
    }
  | {
      kind: "image";
      src: string;
      label?: string;
      duration: number;
      sfx?: SfxType;
    }
  | {
      kind: "stat";
      value: string;
      label: string;
      src: string;
      duration: number;
      sfx?: SfxType;
    }
  | {
      kind: "cta";
      headline: string;
      sub: string;
      duration: number;
      sfx?: SfxType;
    };

export type SocialAd = {
  id: string;
  title: string;
  description: string;
  duration: number;
  slides: AdSlide[];
};

export type AdFormat = "story" | "square";

export const AD_FORMATS: Record<
  AdFormat,
  { label: string; width: number; height: number; ratio: string }
> = {
  story: { label: "Story 9:16", width: 1080, height: 1920, ratio: "9/16" },
  square: { label: "Square 1:1", width: 1080, height: 1080, ratio: "1/1" },
};

export const socialAds = adsData.ads as SocialAd[];
export const adLandingUrl = adsData.landingUrl;
export const adCtaLabel = adsData.ctaLabel;
export const adBookingUrl = CAL_URL;

export function adVideoSrc(adId: string, format: AdFormat) {
  return mediaUrl(`/ads/${format}/${adId}.mp4`);
}

/** Seedance 2.0 multi-reference cinematic export (story 9:16). */
export function cinematicAdVideoSrc(adId: string) {
  return mediaUrl(`/ads/cinematic/story/${adId}.mp4`);
}

export function adPosterSrc(adId: string, format: AdFormat) {
  return mediaUrl(`/ads/${format}/${adId}-poster.webp`);
}
