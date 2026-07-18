import {
  Sparkles,
  Wand2,
  Share2,
  Megaphone,
  Presentation,
  MonitorSmartphone,
  Package,
  Projector,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { included, includedFootnote } from "@/lib/site";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  brand: Sparkles,
  ai: Wand2,
  social: Share2,
  ads: Megaphone,
  decks: Presentation,
  web: MonitorSmartphone,
  print: Package,
  ooh: Projector,
};

/**
 * What's included (§3.6) — every deliverable the subscription covers, as an
 * 8-tile grid. Tiles lift on hover. Anchor for the "What's included" nav.
 */
export function Services() {
  return (
    <section id="services" className="container-edge scroll-mt-28 py-24 md:py-36">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>What&apos;s included</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">One subscription. Every kind of design.</h2>
          </Reveal>
        </div>
        <Reveal index={2}>
          <p className="text-body max-w-sm md:text-right">
            One design subscription across your whole brand — so everything you
            ship looks like it came from the same place.
          </p>
        </Reveal>
      </div>

      <StaggerGroup
        stagger={0.07}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {included.map((s) => {
          const Icon = icons[s.id];
          return (
            <StaggerItem
              key={s.id}
              data-cursor="hover"
              className="group flex flex-col rounded-[1.75rem] border border-border bg-card p-6 transition-[transform,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-white/25 motion-reduce:transform-none sm:rounded-[2rem] sm:p-7"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-white/5 text-foreground transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-tight">{s.title}</h3>
              <p className="text-body mt-2 text-[0.95rem]">{s.body}</p>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <Reveal className="mt-10">
        <p className="text-sm font-medium text-faint">{includedFootnote}</p>
      </Reveal>
    </section>
  );
}
