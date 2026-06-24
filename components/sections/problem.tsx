import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { problems } from "@/lib/site";

/**
 * The problem (§7.3) — the three painful status-quo options, staggered in.
 */
export function Problem() {
  return (
    <section className="relative z-10 bg-background container-edge py-24 md:py-36">
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>The problem</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6 text-balance">
            Your marketing team has the ideas. Not the firepower to ship them.
          </h2>
        </Reveal>
      </div>

      <StaggerGroup className="mt-16 grid gap-5 md:grid-cols-3">
        {problems.map((p) => (
          <StaggerItem
            key={p.label}
            className="group flex flex-col rounded-[1.75rem] border border-border bg-card p-6 transition-colors duration-300 hover:border-white/20 sm:rounded-[2rem] sm:p-8 md:p-9"
          >
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-faint">
              {p.label}
            </span>
            <h3 className="text-h3 mt-5">{p.title}</h3>
            <p className="text-body mt-3">{p.body}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
