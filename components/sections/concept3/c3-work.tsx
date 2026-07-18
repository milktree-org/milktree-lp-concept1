import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { C3Video } from "@/components/sections/concept3/c3-video";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

const cards = [
  {
    src: "/ads/square/flash-cut.mp4",
    label: "Brand identity",
    meta: "48h turnaround",
  },
  {
    src: "/ads/square/full-stack.mp4",
    label: "Campaign creative",
    meta: "48h turnaround",
  },
  {
    src: "/ads/square/ooh-power.mp4",
    label: "Out-of-home",
    meta: "48h turnaround",
  },
];

/**
 * Work grid — liquid-glass cards with looping square reels, each closed by a
 * glass overlay bar with a yellow chevron button, on the solid dark canvas.
 */
export function C3Work() {
  return (
    <section id="work" className="bg-(--c3-bg)">
      <div className="mx-auto w-full max-w-[1831px] px-5 py-20 md:px-10 md:py-28">
        {/* Header row */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h2 className="c3-display uppercase leading-[1.05] text-(--c3-cream) [font-size:clamp(2rem,5vw,3.75rem)]">
              Collection of
              <br />
              <span className="ml-12 md:ml-24 lg:ml-32">
                <span className="c3-script normal-case text-(--c3-accent)">
                  brand
                </span>{" "}
                work
              </span>
            </h2>
          </Reveal>

          <Reveal index={2}>
            <Link href="/#work" className="group inline-block">
              <span className="flex items-end gap-3">
                <span className="c3-display leading-none text-(--c3-cream) [font-size:clamp(2rem,5vw,3.75rem)]">
                  SEE
                </span>
                <span className="c3-display flex flex-col leading-[1.05] text-(--c3-cream) [font-size:clamp(1.25rem,2.5vw,2.25rem)]">
                  <span>ALL</span>
                  <span>WORK</span>
                </span>
              </span>
              <span className="mt-2 block h-[6px] w-full bg-(--c3-accent) transition-transform duration-300 group-hover:scale-x-105 md:h-[10px]" />
            </Link>
          </Reveal>
        </div>

        {/* Card grid */}
        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
          {cards.map((card) => (
            <StaggerItem
              key={card.src}
              className="liquid-glass liquid-glass-hover rounded-[32px] p-[18px]"
            >
              <div className="relative overflow-hidden rounded-[24px] pb-[100%]">
                <C3Video
                  src={card.src}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="liquid-glass mt-4 flex items-center justify-between rounded-[20px] px-5 py-4">
                <div>
                  <p className="c3-mono text-[11px] uppercase tracking-wide text-(--c3-cream)/70">
                    {card.label}
                  </p>
                  <p className="c3-display mt-1 text-base uppercase text-(--c3-cream)">
                    {card.meta}
                  </p>
                </div>
                <Link
                  href="/#work"
                  aria-label={`View ${card.label} work`}
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ffdc04] to-[#e0b400] text-black shadow-lg shadow-yellow-500/40 transition-transform duration-300 hover:scale-110"
                >
                  <ChevronRight className="size-5" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
