import type { Metadata, Viewport } from "next";
import { satoshi } from "./fonts";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { CustomCursor } from "@/components/motion/custom-cursor";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TrackingScripts } from "@/components/analytics/tracking-scripts";
import { RouteAnalytics } from "@/components/analytics/route-analytics";

const SITE_URL = "https://www.milktreeagency.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Milktree — Your creative department. On demand.",
    template: "%s — Milktree",
  },
  description:
    "Milktree becomes your embedded brand & design team — senior, on-brand and fast — for a flat monthly fee. 200+ brands built over 5 years.",
  icons: {
    icon: [{ url: "/logos/favicon.svg", type: "image/svg+xml" }],
  },
  keywords: [
    "brand design",
    "design subscription",
    "embedded creative team",
    "creative department",
    "brand identity",
  ],
  openGraph: {
    title: "Milktree — Your creative department. On demand.",
    description:
      "Your embedded brand & design team — senior, on-brand and fast — for a flat monthly fee.",
    type: "website",
    url: SITE_URL,
    siteName: "Milktree",
  },
  twitter: {
    card: "summary_large_image",
    title: "Milktree — Your creative department. On demand.",
    description:
      "Your embedded brand & design team — senior, on-brand and fast — for a flat monthly fee.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${satoshi.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <TrackingScripts />
        <RouteAnalytics />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID || "993503079134900"}&ev=PageView&noscript=1`}
          />
        </noscript>
        <SmoothScroll>
          <CustomCursor />
          <Header />
          <main id="top">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
