import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { Suspense } from "react";
import { WorkIndex, type WorkIndexItem } from "@/components/work/work-index";
import { StartButton } from "@/components/layout/start-button";
import { site } from "@/lib/site";
import { workProjects } from "@/lib/work";

export const metadata: Metadata = {
  title: "Our Work — Brand & Design Case Studies",
  description:
    "Case studies from 200+ brands built by Milktree: brand identity, campaigns, signage, packaging, print and web for real UK businesses.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Our Work — Brand & Design Case Studies — Milktree",
    description:
      "Case studies from 200+ brands built by Milktree: brand identity, campaigns, signage, packaging, print and web.",
    url: "/work",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work — Brand & Design Case Studies — Milktree",
    description:
      "Case studies from 200+ brands built by Milktree: brand identity, campaigns, signage, packaging, print and web.",
  },
};

const items: WorkIndexItem[] = workProjects.map((p) => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  poster: p.poster,
  sector: p.sector,
  disciplines: p.disciplines,
  featured: p.featured,
}));

export default function WorkIndexPage() {
  return (
    <>
      <section className="pb-24 pt-32 md:pb-36 md:pt-44">
        <div className="container-edge">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>Our work</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h1 className="text-h2 mt-6">The work speaks for itself.</h1>
            </Reveal>
            <Reveal index={2}>
              <p className="text-body-lg mt-6 max-w-xl">
                Some of the 200+ brands we&apos;ve built. Identity, campaigns,
                signage, packaging and web, for businesses people can see.
              </p>
            </Reveal>
          </div>

          <Suspense fallback={<div className="mt-12 min-h-[60vh]" aria-busy="true" />}>
            <WorkIndex items={items} />
          </Suspense>
        </div>
      </section>

      {/* Conversion band */}
      <div className="border-y border-border bg-surface">
        <div className="container-edge flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <Reveal>
            <h2 className="max-w-[20ch] text-balance text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.025em]">
              Want work like this on your brand?
            </h2>
            <p className="text-body mt-3 max-w-md">
              Fix one thing in two weeks, rebuild the brand in six, or keep us
              on. Fixed prices, no proposals.
            </p>
          </Reveal>
          <Reveal index={1} className="flex shrink-0 flex-col items-start gap-4 md:items-end">
            <StartButton size="pill-lg" magnetic source="Work index">
              Start a project
            </StartButton>
            <p className="text-sm font-medium text-faint">{site.trustLine}</p>
          </Reveal>
        </div>
      </div>
    </>
  );
}
