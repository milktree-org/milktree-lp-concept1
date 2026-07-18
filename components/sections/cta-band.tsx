import { Reveal } from "@/components/motion/reveal";
import { StartButton } from "@/components/layout/start-button";
import { site } from "@/lib/site";

/**
 * Mid-page CTA band — a slim conversion moment between the proof crescendo
 * and the comparison/pricing run-in, so visitors who are already convinced
 * don't have to scroll to the footer to act. The button is the one yellow
 * element in view.
 */
export function CtaBand() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-edge flex flex-col items-start gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <Reveal>
          <h2 className="max-w-[22ch] text-balance text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.025em]">
            Seen enough? Your first request could be back this week.
          </h2>
          <p className="text-body mt-3 max-w-md">
            Start today and send your first brief within the hour.
          </p>
        </Reveal>
        <Reveal index={1} className="flex shrink-0 flex-col items-start gap-4 md:items-end">
          <StartButton size="pill-lg" magnetic source="Mid-page CTA band">
            Get started
          </StartButton>
          <p className="text-sm font-medium text-faint">{site.trustLine}</p>
        </Reveal>
      </div>
    </section>
  );
}
