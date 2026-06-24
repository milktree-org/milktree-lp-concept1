import type { Metadata } from "next";
import { AdPreviewGallery } from "@/components/ads/ad-preview-gallery";

export const metadata: Metadata = {
  title: "Social ads",
  description:
    "Five story and square ad concepts for Milktree — built from real portfolio work, with sound.",
  robots: { index: false, follow: true },
};

export default function AdsPage() {
  return <AdPreviewGallery />;
}
