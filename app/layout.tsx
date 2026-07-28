import type { Metadata, Viewport } from "next";
import { instrumentSans, satoshi } from "./fonts";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { CustomCursor } from "@/components/motion/custom-cursor";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TrackingScripts, TRACKING_ENABLED } from "@/components/analytics/tracking-scripts";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { ConsentBanner } from "@/components/analytics/consent-banner";
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
      <head>
        {/* Warm up Vimeo origins so the hero showreel iframe boots faster */}
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        <TrackingScripts />
        <RouteAnalytics enabled={TRACKING_ENABLED} />
        {TRACKING_ENABLED && <ConsentBanner />}
        {/* The <noscript> Meta pixel that used to sit here has been removed.
            It fires on HTML parse, so no JavaScript consent gate can hold it —
            it would have logged a PageView for every visitor before they were
            asked. It only ever covered no-JS visitors, who can't use the funnel
            anyway, so the compliance hole was not worth the coverage. */}
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
