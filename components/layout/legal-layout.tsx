import { Reveal } from "@/components/motion/reveal";

/**
 * Shared layout for legal/long-form pages (Privacy, Terms). Styles raw HTML
 * children with the brand tokens — no typography plugin needed.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative scroll-mt-28 py-28 md:py-36">
      <div className="container-edge relative z-10 mx-auto max-w-3xl">
        <Reveal>
          <h1 className="text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.0] tracking-[-0.03em]">
            {title}
          </h1>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-4 text-sm font-medium text-faint">Last updated: {updated}</p>
        </Reveal>
        <Reveal index={2}>
          <div
            className="mt-12 space-y-5 text-[1.0625rem] leading-relaxed text-muted-foreground
              [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-[var(--accent)]
              [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]
              [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground
              [&_li]:ml-1 [&_strong]:text-foreground
              [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          >
            {children}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
