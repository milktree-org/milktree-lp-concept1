import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";

/**
 * About band (home §6.1.7): the founder, the core-team-plus-network model in
 * one line, link to /about. No yellow in this band.
 */
export function AboutBand() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-edge grid gap-8 py-16 md:grid-cols-[1fr_1.4fr] md:items-center md:gap-16 md:py-24">
        <div>
          <Reveal>
            <Eyebrow>The studio</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">Founder-led. Seven years in.</h2>
          </Reveal>
        </div>
        <Reveal index={2}>
          <p className="text-body-lg">
            A core team of senior designers, a network of 50+ more around the world,
            and one creative director who signs off every piece. That&apos;s how 200
            brands got built to one standard, and how a £799 sprint gets the same
            care as a full rebuild.
          </p>
          <Link
            href="/about"
            data-cursor="hover"
            className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-foreground transition-colors hover:text-brand"
          >
            About Milktree
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
