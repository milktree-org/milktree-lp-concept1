import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { CountUp } from "@/components/motion/count-up";
import { stats } from "@/lib/site";

const work = [
  {
    title: "Hampshire Food Hub",
    category: "Out-of-Home",
    src: "/work/portfolio/hampshire-billboard.webp",
  },
  {
    title: "EazyPhone",
    category: "Brand Identity",
    src: "/work/portfolio/eazyphone-cards.webp",
  },
  {
    title: "Mint Mortgages",
    category: "Campaign",
    src: "/work/portfolio/mint-keys.webp",
  },
  {
    title: "Alltrad Roofing",
    category: "Out-of-Home",
    src: "/work/portfolio/alltrad-billboard.webp",
  },
  {
    title: "Melt Pizza",
    category: "Packaging",
    src: "/work/portfolio/melt-pizza.webp",
  },
  {
    title: "SaleSprout",
    category: "Brand & Campaign",
    src: "/work/portfolio/salesprout-billboard.webp",
  },
];

/**
 * Proof — Pentagram-style white case-study grid with small captions, closed
 * by a full-bleed dark stats band. The first stat carries the yellow underline.
 */
export function C2Proof() {
  return (
    <section id="work">
      <div className="container-edge py-24 md:py-36">
        <Reveal className="max-w-3xl">
          <p className="c2-label">(Selected work)</p>
          <h2 className="text-h2 mt-6 text-foreground">
            The work speaks for itself.
          </h2>
        </Reveal>

        <StaggerGroup className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
          {work.map((item) => (
            <StaggerItem key={item.src}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-surface">
                <Image
                  src={item.src}
                  alt={`${item.title} — ${item.category}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out-expo hover:scale-[1.03]"
                />
              </div>
              <p className="mt-4 text-[0.95rem] font-bold tracking-tight text-foreground">
                {item.title}
              </p>
              <p className="mt-0.5 text-sm font-medium text-faint">
                {item.category}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>

      </div>

      {/* Full-bleed dark stats band — the second ink contrast moment. */}
      <div className="bg-ink text-ink-foreground">
        <StaggerGroup className="container-edge grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 md:py-24">
          {stats.map((stat, i) => (
            <StaggerItem key={stat.label}>
              <span
                className={
                  "inline-block font-bold leading-none tracking-[-0.03em] [font-size:clamp(3.25rem,6.5vw,6rem)]" +
                  (i === 0 ? " border-b-[6px] border-brand pb-2" : "")
                }
              >
                <CountUp value={stat.value} suffix={stat.suffix} />
              </span>
              <p className="mt-4 text-sm font-medium text-ink-foreground/40">
                {stat.label}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
