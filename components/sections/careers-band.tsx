import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { buttonVariants } from "@/components/ui/button";
import { careers, ROLE_OPTIONS } from "@/lib/careers";
import { cn } from "@/lib/utils";

/**
 * Careers band — a slim talent moment between the FAQ and the closing client
 * CTA. Deliberately ghost-pill (not yellow) so it never competes with the
 * conversion ask; the audience here is designers, not buyers.
 */
export function CareersBand() {
  return (
    <section id="careers" className="scroll-mt-28 border-y border-border bg-surface">
      <div className="container-edge flex flex-col items-start gap-10 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <Reveal className="max-w-xl">
          <Eyebrow>{careers.eyebrow}</Eyebrow>
          <h2 className="mt-5 max-w-[20ch] text-balance text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.025em]">
            {careers.headline}
          </h2>
          <p className="text-body mt-3 max-w-lg">{careers.sub}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((role) => (
              <li
                key={role.value}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground"
              >
                {role.label}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal index={1} className="flex shrink-0 flex-col items-start gap-4 md:items-end">
          <Link
            href="/careers"
            data-cursor="hover"
            className={cn(buttonVariants({ variant: "ghostPill", size: "pill-lg" }))}
          >
            Join the team
            <ArrowRight />
          </Link>
          <p className="text-sm font-medium text-faint">
            Fully remote · Hiring worldwide
          </p>
        </Reveal>
      </div>
    </section>
  );
}
