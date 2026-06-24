import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { PortfolioCard } from "@/components/ui/portfolio-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { portfolio, testimonials } from "@/lib/site";

/**
 * Proof (§7.9) — "the work speaks for itself." Embla portfolio carousel of
 * case studies (each card hover-plays its loop) + testimonials.
 */
export function Proof() {
  return (
    <section id="work" className="scroll-mt-28 py-24 md:py-36">
      <div className="container-edge">
        <Carousel opts={{ align: "start", loop: true }}>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Reveal>
                <Eyebrow>Proof</Eyebrow>
              </Reveal>
              <Reveal index={1}>
                <h2 className="text-h2 mt-6">The work speaks for itself.</h2>
              </Reveal>
            </div>
            <Reveal index={2} className="hidden gap-3 md:flex">
              <CarouselPrevious className="static size-12 translate-x-0 translate-y-0 rounded-full border-border bg-white/5 hover:bg-white/10" />
              <CarouselNext className="static size-12 translate-x-0 translate-y-0 rounded-full border-border bg-white/5 hover:bg-white/10" />
            </Reveal>
          </div>

          <CarouselContent className="mt-12 -ml-5">
            {portfolio.map((item, i) => (
              <CarouselItem key={item.title} className="pl-5 sm:basis-1/2 lg:basis-1/3">
                <PortfolioCard item={item} index={i} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Testimonials */}
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
    </section>
  );
}
