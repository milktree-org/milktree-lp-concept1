import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { symptoms } from "@/lib/site";

/**
 * Sound familiar? (home §6.1.3) — the four symptoms in the buyer's own words,
 * each pointing at the product that fixes it. No yellow in this section; the
 * arrow chip flips to yellow only on hover.
 */
export function Symptoms() {
  return (
    <section className="relative z-10 bg-background container-edge py-24 md:py-36">
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>Sound familiar?</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6 text-balance">
            The business moved on. The brand didn&apos;t.
          </h2>
        </Reveal>
      </div>

      <StaggerGroup className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {symptoms.map((s) => (
          <StaggerItem key={s.label}>
            <Link
              href={s.href}
              data-cursor="hover"
              className="group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-6 transition-[transform,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-white/25 motion-reduce:transform-none sm:rounded-[2rem] sm:p-8"
            >
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-faint">
                {s.label}
              </span>
              <h3 className="text-h3 mt-5">{s.title}</h3>
              <p className="text-body mt-3 flex-1">{s.body}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-foreground">
                {s.cta}
                <span className="grid size-8 place-items-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
