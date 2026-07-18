import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandReportQuiz } from "@/components/funnel/brand-report-quiz";

export const metadata: Metadata = {
  title: "Free Brand Ranking Report",
  description:
    "See how your brand stacks up against the top three players in your market: live search positions, a side-by-side brand comparison, and fixes you can action this week. Free, takes two minutes.",
  alternates: {
    canonical: "/brand-report",
  },
  openGraph: {
    title: "Free Brand Ranking Report | Milktree",
    description:
      "See who owns page 1 in your market, how their brands compare to yours, and what to fix first. Free, takes two minutes.",
    url: "/brand-report",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Brand Ranking Report | Milktree",
    description:
      "See who owns page 1 in your market, how their brands compare to yours, and what to fix first. Free, takes two minutes.",
  },
};

export default function BrandReportPage() {
  return (
    <section className="relative py-28 md:py-32">
      <div className="container-edge">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Free Brand Ranking Report
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            How does your brand really rank?
          </h1>
          <p className="text-body mx-auto mt-5 max-w-lg">
            Two minutes, real Google data. See who owns page 1 in your market,
            how their brands compare to yours, and exactly what to fix first.
          </p>
        </div>
        <Suspense fallback={null}>
          <BrandReportQuiz />
        </Suspense>
      </div>
    </section>
  );
}
