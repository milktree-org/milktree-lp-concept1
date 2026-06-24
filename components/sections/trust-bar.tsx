import { LogoMarquee } from "@/components/ui/logo-marquee";
import { Reveal } from "@/components/motion/reveal";

/**
 * Trust bar (§7.2) — "the team behind 200+ growing brands" + infinite logo
 * marquee.
 */
export function TrustBar() {
  return (
    <section className="border-y border-border bg-surface/40 py-12">
      <div className="container-edge">
        <Reveal>
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-[0.16em] text-faint">
            The team behind 200+ growing brands
          </p>
        </Reveal>
        <LogoMarquee />
      </div>
    </section>
  );
}
