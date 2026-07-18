import { C3Video } from "@/components/sections/concept3/c3-video";
import { Reveal } from "@/components/motion/reveal";

const blurb =
  "An embedded brand & design team. 200+ brands built over 6 years as an agency. Unlimited requests, one flat monthly fee.";

/**
 * About / intro — full-viewport video backdrop, Anton heading with a yellow
 * Condiment overlay, mono blurb right, faded decorative paragraphs below.
 */
export function C3About() {
  return (
    <section id="about" className="relative flex min-h-dvh flex-col overflow-hidden">
      <C3Video
        src="/work/hero-bg.mp4"
        poster="/work/hero-poster.webp"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1831px] flex-1 flex-col justify-between px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <Reveal>
            <div className="relative inline-block">
              <h2 className="c3-display leading-[1.05] text-(--c3-cream) [font-size:clamp(2rem,5vw,3.75rem)]">
                Hello!
                <br />
                We&rsquo;re Milktree
              </h2>
              <span
                aria-hidden
                className="c3-script absolute right-0 -bottom-12 -rotate-2 whitespace-nowrap text-(--c3-accent) drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] [font-size:clamp(2rem,4.5vw,3.5rem)] md:-bottom-14"
              >
                your creative team
              </span>
            </div>
          </Reveal>

          <Reveal index={2}>
            <p className="c3-mono max-w-[266px] text-sm uppercase leading-relaxed text-(--c3-cream) md:text-base">
              {blurb}
            </p>
          </Reveal>
        </div>

        {/* Decorative faded rows */}
        <div aria-hidden className="mt-24 flex justify-between gap-12">
          <div className="space-y-8">
            <p className="c3-mono max-w-[266px] text-sm uppercase leading-relaxed text-(--c3-cream) opacity-10">
              {blurb}
            </p>
            <p className="c3-mono max-w-[266px] text-sm uppercase leading-relaxed text-(--c3-cream) opacity-10">
              {blurb}
            </p>
          </div>
          <div className="hidden space-y-8 lg:block">
            <p className="c3-mono max-w-[266px] text-sm uppercase leading-relaxed text-(--c3-cream) opacity-10">
              {blurb}
            </p>
            <p className="c3-mono max-w-[266px] text-sm uppercase leading-relaxed text-(--c3-cream) opacity-10">
              {blurb}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
