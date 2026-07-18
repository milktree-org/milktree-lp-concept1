import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { audiences, notAFit } from "@/lib/site";

// Splits the row title around its hover keyword so the keyword can carry
// the yellow accent on hover without duplicating copy in the data file.
function KeywordTitle({ title, keyword }: { title: string; keyword: string }) {
  const [before, after] = title.split(keyword);
  return (
    <h3 className="text-h3">
      {before}
      <span className="transition-colors duration-300 md:group-hover:text-brand">
        {keyword}
      </span>
      {after}
    </h3>
  );
}

/**
 * Who it's for — type-led editorial rows naming the three audiences,
 * plus a one-line disqualifier. Sits between WhyMilktree and Plans so
 * "is this for me?" is answered right before pricing.
 */
export function WhoItsFor() {
  return (
    <section className="container-edge py-24 md:py-36">
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>Who it&apos;s for</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6 text-balance">Built for teams that ship.</h2>
        </Reveal>
      </div>

      <StaggerGroup className="mt-16 divide-y divide-border border-y border-border">
        {audiences.map((a) => (
          <StaggerItem
            key={a.label}
            className="group grid gap-3 py-10 md:grid-cols-[16rem_1fr] md:gap-8 md:py-12"
          >
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-faint">
              {a.label}
            </span>
            <div className="max-w-2xl">
              <KeywordTitle title={a.title} keyword={a.keyword} />
              <p className="text-body mt-3">{a.body}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal index={2}>
        <p className="mt-10 text-[0.95rem] text-muted-foreground">{notAFit}</p>
      </Reveal>
    </section>
  );
}
