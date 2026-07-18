import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { stats, testimonials } from "@/lib/site";
import { workProjects } from "@/lib/work";
import { WorkDeckDialog } from "@/components/ui/work-deck-dialog";
import { cn } from "@/lib/utils";

/**
 * Proof (§3.9) — a 3×3 grid of case studies, each opening its own
 * /work/[slug] page, followed by testimonials and the stat bar.
 */
export function Proof() {
  return (
    <section id="work" className="scroll-mt-28 pt-24 md:pt-36">
      <div className="container-edge">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Proof</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">The work speaks for itself.</h2>
          </Reveal>
        </div>

        {/* 9-project grid */}
        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workProjects.map((project) => (
            <StaggerItem key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                data-cursor="hover"
                className={cn(
                  "group relative block overflow-hidden rounded-[2rem] border border-border bg-card",
                  "transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)]",
                  "hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]",
                  "motion-reduce:transform-none motion-reduce:transition-none",
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={project.poster}
                    alt={`${project.title} — ${project.category}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-faint">
                        {project.category}
                      </p>
                      <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                        {project.title}
                      </h3>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Full portfolio deck in a dialog */}
        <Reveal className="mt-10 flex justify-center">
          <WorkDeckDialog />
        </Reveal>

        {/* Testimonials [slot] — swap for named client quotes */}
        <StaggerGroup className="mt-20 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem
              key={t.quote}
              className="flex flex-col justify-between rounded-[2rem] border border-border bg-card p-8"
            >
              <p className="text-lg font-medium leading-relaxed text-foreground">
                <span className="text-brand">“</span>
                {t.quote}
                <span className="text-brand">”</span>
              </p>
              <div className="mt-8">
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-faint">{t.role}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      {/* Track record — editorial ledger, not a stat grid */}
      <div className="mt-24 border-y border-border bg-surface py-20 md:py-28">
        <div className="container-edge grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Track record</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h3 className="text-h2 mt-6 max-w-[14ch]">
                Six years of agency craft behind it.
              </h3>
            </Reveal>
          </div>

          <StaggerGroup className="divide-y divide-border border-t border-border lg:border-t-0">
            {stats.map((stat, i) => (
              <StaggerItem
                key={stat.label}
                className="flex flex-col gap-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10 md:py-10"
              >
                <div className={cn("order-2 sm:order-1", i === 0 && "sm:pt-0")}>
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">
                    {stat.label}
                  </p>
                  <p className="text-body mt-2 max-w-[34ch]">{stat.sub}</p>
                </div>
                <p className="order-1 shrink-0 font-heading text-[clamp(3.75rem,9vw,7rem)] font-bold leading-[0.85] tracking-[-0.01em] text-foreground [font-stretch:75%] sm:order-2 sm:text-right">
                  <span className="tabular-nums">
                    <CountUp value={stat.value} />
                  </span>
                  {stat.suffix && <span className="text-brand">{stat.suffix}</span>}
                </p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
