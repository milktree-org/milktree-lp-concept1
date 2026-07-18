import { LineMask } from "@/components/motion/line-mask";
import { Reveal } from "@/components/motion/reveal";
import { StartButton } from "@/components/layout/start-button";
import { AnchorLink } from "@/components/layout/anchor-link";
import { site } from "@/lib/site";

/**
 * Vucko-style hero — a massive black all-caps statement on white filling the
 * viewport, supporting copy pinned to the bottom. The single yellow element
 * is the magnetic Get started pill.
 */
export function C2Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col md:min-h-[calc(100dvh-5rem)]">
      <div className="container-edge flex flex-1 flex-col justify-between gap-14 pt-10 pb-10 md:pt-16 md:pb-12">
        <h1 className="c2-display text-foreground">
          <LineMask lines={["Your creative", "department.", "On demand."]} />
        </h1>

        <div className="grid items-end gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-5" index={4}>
            <p className="max-w-md text-[1.05rem] font-medium leading-[1.55] text-muted-foreground">
              Milktree becomes your embedded brand &amp; design team — unlimited
              requests, senior work back in 48 hours, for one flat monthly fee.
              No hiring. No freelancer roulette. No waiting weeks.
            </p>
            <p className="mt-5 text-sm font-medium text-faint">{site.trustLine}</p>
          </Reveal>

          <Reveal
            className="flex flex-wrap items-center gap-x-7 gap-y-4 md:col-span-5"
            index={5}
          >
            <StartButton size="pill-lg" magnetic source="Concept2 Hero">
              Get started
            </StartButton>
            <AnchorLink
              href="#plans"
              className="inline-flex min-h-11 items-center font-bold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              See plans
            </AnchorLink>
          </Reveal>

          <Reveal
            className="hidden justify-end md:col-span-2 md:flex"
            index={6}
            aria-hidden
          >
            <span className="c2-label">(Scroll)</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
