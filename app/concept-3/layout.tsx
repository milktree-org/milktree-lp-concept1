import type { Metadata, Viewport } from "next";
import { Anton, Condiment } from "next/font/google";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const condiment = Condiment({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-condiment",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Concept — Cinematic",
  description:
    "Milktree cinematic concept. Your creative department, on demand — unlimited requests, senior work in 48 hours, one flat monthly fee.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050403",
  colorScheme: "dark",
};

/**
 * Dark cinematic concept (/concept-3) — video backgrounds, liquid-glass UI,
 * Anton display type with Condiment cursive accents, Milktree yellow as the
 * accent. Carries its own chrome; the global header/footer are hidden via
 * the `data-hide-chrome` rule in globals.css.
 */
export default function ConceptCinemaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      data-hide-chrome
      className={`theme-cinema ${anton.variable} ${condiment.variable}`}
    >
      {children}
    </div>
  );
}
