import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { Button } from "@/components/ui/button";
import { WorkCard } from "@/components/ui/work-card";
import { stats, testimonials } from "@/lib/site";
import { featuredWorkProjects } from "@/lib/work";
import { cn } from "@/lib/utils";

/**
 * Proof (§3.9) — the six featured case studies, each opening its own
 * /work/[slug] page, followed by testimonials and the stat bar. The full
 * twelve live on /work.
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

        {/* Featured 6-project grid */}
        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredWorkProjects.map((project) => (
            <StaggerItem key={project.slug}>
              <WorkCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Full 12-case-study index */}
        <Reveal className="mt-10 flex justify-center">
          <Button
            variant="ghostPill"
            size="pill-lg"
            data-cursor="hover"
            nativeButton={false}
            render={<Link href="/work" />}
          >
            View all work
            <ArrowUpRight />
          </Button>
        </Reveal>

        {/* Testimonials [slot] — swap for named client quotes. Attribution
            fields (company, avatar, result) render automatically once real
            quotes land in lib/site.ts. */}
        <StaggerGroup className="mt-20 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem
              key={t.quote}
              className="flex flex-col justify-between rounded-[2rem] border border-border bg-card p-8"
            >
              <div>
                <p className="text-lg font-medium leading-relaxed text-foreground">
                  <span className="text-brand">“</span>
                  {t.quote}
                  <span className="text-brand">”</span>
                </p>
                {t.result && (
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.08em] text-brand">
                    {t.result}
                  </p>
                )}
              </div>
              <div className="mt-8 flex items-center gap-3">
                {t.avatar && (
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-sm text-faint">
                    {t.role}
                    {t.company ? ` · ${t.company}` : ""}
                  </p>
                </div>
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
