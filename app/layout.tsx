import type { Metadata, Viewport } from "next";
import { instrumentSans, satoshi } from "./fonts";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { CustomCursor } from "@/components/motion/custom-cursor";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TrackingScripts } from "@/components/analytics/tracking-scripts";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, organizationJsonLd, seo, webSiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: seo.title,
    template: "%s | Milktree",
  },
  description: seo.description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/logos/favicon.svg", type: "image/svg+xml" }],
  },
  keywords: seo.keywords,
  openGraph: {
    title: "Milktree | Your creative department. On demand.",
    description: seo.ogDescription,
    type: "website",
    url: SITE_URL,
    siteName: "Milktree",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Milktree | Your creative department. On demand.",
    description: seo.ogDescription,
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
    <html
      lang="en"
      className={`${instrumentSans.variable} ${satoshi.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
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
