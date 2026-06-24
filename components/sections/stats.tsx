import { CountUp } from "@/components/motion/count-up";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { stats } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Stats bar (§7.10) — count-up numbers. The single yellow is the headline
 * stat (200+ brands); the rest stay white.
 */
export function Stats() {
  return (
    <section id="stats" className="scroll-mt-28 border-y border-border bg-surface py-20 md:py-28">
      <StaggerGroup className="container-edge grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 md:gap-10">
        {stats.map((stat, i) => (
          <StaggerItem key={stat.label} className="text-center md:text-left">
            <p
              className={cn(
                "text-[clamp(2.25rem,12vw,5rem)] font-black leading-none tracking-tight",
                i === 0 ? "text-brand" : "text-foreground",
              )}
            >
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-3 text-sm font-medium uppercase tracking-[0.14em] text-faint">
              {stat.label}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
