import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { problems } from "@/lib/site";

/**
 * The problem — quiet centred editorial statement (COLLINS-style restraint),
 * one word marked with the yellow underline, then the three pains as compact
 * hairline-topped columns.
 */
export function C2Problem() {
  return (
    <section className="container-edge py-24 md:py-36">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="c2-label">(The problem)</p>
        <h2 className="mt-8 text-balance font-bold leading-[1.05] tracking-[-0.03em] text-foreground [font-size:clamp(2rem,4.6vw,3.6rem)]">
          Your marketing team has the ideas. Not the{" "}
          <span className="underline decoration-brand decoration-[0.08em] underline-offset-[0.14em]">
            firepower
          </span>{" "}
          to ship them.
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-body-lg">
          There&rsquo;s a better way to get design done. An embedded creative
          team you can switch on, scale and direct.
        </p>
      </Reveal>

      <StaggerGroup className="mt-20 grid gap-10 md:grid-cols-3 md:gap-8">
        {problems.map((problem) => (
          <StaggerItem key={problem.label} className="border-t border-border pt-6">
            <p className="c2-label">({problem.label})</p>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
              {problem.title}
            </h3>
            <p className="mt-3 text-[0.95rem] font-medium leading-[1.6] text-muted-foreground">
              {problem.body}
            </p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
