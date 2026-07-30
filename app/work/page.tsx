import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { WorkCard } from "@/components/ui/work-card";
import { StartButton } from "@/components/layout/start-button";
import { site } from "@/lib/site";
import { workProjects } from "@/lib/work";

export const metadata: Metadata = {
  title: "Our Work — Brand & Design Case Studies",
  description:
    "Twelve case studies from 200+ brands built: brand identity, websites, event design and campaign creative by Milktree.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Our Work — Brand & Design Case Studies — Milktree",
    description:
      "Twelve case studies from 200+ brands built: brand identity, websites, event design and campaign creative.",
    url: "/work",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work — Brand & Design Case Studies — Milktree",
    description:
      "Twelve case studies from 200+ brands built: brand identity, websites, event design and campaign creative.",
  },
};

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
                Twelve of the 200+ brands we&apos;ve built. Every one shipped by
                the same team you get on subscription.
              </p>
            </Reveal>
          </div>

          <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workProjects.map((project) => (
              <StaggerItem key={project.slug}>
                <WorkCard project={project} />
              </StaggerItem>
            ))}
          </StaggerGroup>
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
              One subscription, every kind of design. Your first request could
              be back this week.
            </p>
          </Reveal>
          <Reveal index={1} className="flex shrink-0 flex-col items-start gap-4 md:items-end">
            <StartButton size="pill-lg" magnetic source="Work index">
              Get started
            </StartButton>
            <p className="text-sm font-medium text-faint">{site.trustLine}</p>
          </Reveal>
        </div>
      </div>
    </>
  );
}
