import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandAudit } from "@/components/funnel/brand-audit";

export const metadata: Metadata = {
  title: "Free Automated Brand Audit",
  description:
    "We read your website and your market's live Google results, then tell you what's working, what's costing you, and what to fix first. Fully automated, takes about a minute, free.",
  alternates: {
    canonical: "/brand-audit",
  },
  openGraph: {
    title: "Free Automated Brand Audit | Milktree",
    description:
      "Enter your website. We read your brand and your market's live search results, and report what we actually found. Free, about a minute.",
    url: "/brand-audit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Automated Brand Audit | Milktree",
    description:
      "Enter your website. We read your brand and your market's live search results, and report what we actually found. Free, about a minute.",
  },
};

export default function BrandAuditPage() {
  return (
    <section className="relative py-28 md:py-32">
      <div className="container-edge">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Free Brand Audit
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            We&apos;ll audit your brand. Right now.
          </h1>
          <p className="text-body mx-auto mt-5 max-w-lg">
            No questionnaire. Enter your website and we read your actual brand
            — headline, palette, typography — and check your market&apos;s
            live Google results. What&apos;s working, what&apos;s costing you,
            what to fix first.
          </p>
        </div>
        <Suspense fallback={null}>
          <BrandAudit />
        </Suspense>
      </div>
    </section>
  );
}
