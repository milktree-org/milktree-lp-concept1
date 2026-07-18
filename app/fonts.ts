import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * Instrument Sans — headline typeface, used condensed (width 75, weight 700).
 * Variable font: wght 400–700, wdth 75–100. Headings apply
 * `font-stretch: 75%` in globals.css; body text does NOT use this family.
 */
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-instrument",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

/**
 * Satoshi — body & UI typeface (buttons, nav, forms, paragraphs).
 * Self-hosted from Fontshare.
 */
export const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});
