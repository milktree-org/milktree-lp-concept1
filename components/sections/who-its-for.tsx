import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { audiences, notAFit } from "@/lib/site";
import { isPublishedAudience } from "@/lib/audiences";

// Splits the row title around its hover keyword so the keyword can carry
// the yellow accent on hover without duplicating copy in the data file.
function KeywordTitle({ title, keyword }: { title: string; keyword: string }) {
  const [before, after] = title.split(keyword);
  if (after === undefined) return <h3 className="text-h3">{title}</h3>;
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
 * Who it's for — type-led editorial rows naming the six sectors the
 * portfolio proves, plus a one-line disqualifier. Phase 2 links each row
 * to its /for/[audience] page.
 */
export function WhoItsFor() {
  return (
    <section className="container-edge py-24 md:py-36">
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>Who it&apos;s for</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6 text-balance">Built for businesses people can see.</h2>
        </Reveal>
      </div>

      <StaggerGroup className="mt-16 divide-y divide-border border-y border-border">
        {audiences.map((a) => {
          const published = isPublishedAudience(a.slug);
          const inner = (
            <>
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-faint">
                {a.label}
              </span>
              <div className="max-w-2xl">
                <KeywordTitle title={a.title} keyword={a.keyword} />
                <p className="text-body mt-3">{a.body}</p>
                {published && (
                  <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-foreground transition-colors md:group-hover:text-brand">
                    See {a.label.toLowerCase()} work
                    <ArrowUpRight aria-hidden className="size-4" />
                  </span>
                )}
              </div>
            </>
          );
          const rowClass = "group grid gap-3 py-10 md:grid-cols-[16rem_1fr] md:gap-8 md:py-12";
          return (
            <StaggerItem key={a.label}>
              {published ? (
                <Link href={`/for/${a.slug}`} data-cursor="hover" className={rowClass}>
                  {inner}
                </Link>
              ) : (
                <div className={rowClass}>{inner}</div>
              )}
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <Reveal index={2}>
        <p className="mt-10 text-[0.95rem] text-muted-foreground">{notAFit}</p>
      </Reveal>
    </section>
  );
}
