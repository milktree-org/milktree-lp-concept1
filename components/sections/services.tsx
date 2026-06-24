import { Sparkles, Share2, Presentation, Megaphone, MonitorSmartphone, Compass } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { services } from "@/lib/site";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  brand: Sparkles,
  social: Share2,
  decks: Presentation,
  ads: Megaphone,
  web: MonitorSmartphone,
  direction: Compass,
};

/**
 * What we do (§7.5) — "One team. Every kind of design." 6-tile grid; tiles
 * lift on hover. Section anchor for the "What we do" nav dropdown.
 */
export function Services() {
  return (
    <section id="services" className="container-edge scroll-mt-28 py-24 md:py-36">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>What we do</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">One team. Every kind of design.</h2>
          </Reveal>
        </div>
        <Reveal index={2}>
          <p className="text-body max-w-sm md:text-right">
            One partner across your whole brand — so everything you ship looks
            like it came from the same place.
          </p>
        </Reveal>
      </div>

      <StaggerGroup
        stagger={0.07}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((s) => {
          const Icon = icons[s.id];
          return (
            <StaggerItem
              key={s.id}
              data-cursor="hover"
              className="group flex flex-col rounded-[1.75rem] border border-border bg-card p-6 transition-[transform,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-white/25 motion-reduce:transform-none sm:rounded-[2rem] sm:p-8"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-white/5 text-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
                <Icon className="size-6" />
              </span>
              <h3 className="text-h3 mt-7">{s.title}</h3>
              <p className="text-body mt-3">{s.body}</p>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
