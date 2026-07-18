import type { Metadata } from "next";
import { CareersForm } from "@/components/funnel/careers-form";
import { careers } from "@/lib/careers";

export const metadata: Metadata = {
  title: { absolute: "Design Careers at Milktree" },
  description:
    "Milktree hires world-class designers from anywhere in the world. Fully remote, senior team, real brands shipped fast. Apply in a couple of minutes.",
  alternates: {
    canonical: "/careers",
  },
  openGraph: {
    title: "Design Careers at Milktree",
    description:
      "World-class designers, anywhere in the world. Fully remote, senior team, real brands shipped fast.",
    url: "/careers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Careers at Milktree",
    description:
      "World-class designers, anywhere in the world. Fully remote, senior team, real brands shipped fast.",
  },
};

export default function CareersPage() {
  return (
    <section className="relative py-28 md:py-32">
      <div className="container-edge">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            {careers.eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            {careers.headline}
          </h1>
          <p className="text-body mx-auto mt-5 max-w-lg">
            Applying takes a couple of minutes — a few quick questions and a
            link to your portfolio. That&apos;s it. No CV required.
          </p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-faint">
            {careers.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <span aria-hidden className="inline-block size-1 rounded-full bg-brand" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <CareersForm />
      </div>
    </section>
  );
}
