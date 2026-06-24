import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { insights } from "@/lib/site";

/**
 * Insights teaser (§7.12) — three latest journal cards. Editorial teasers;
 * wire to /insights when that route ships.
 */
export function Insights() {
  return (
    <section id="insights" className="container-edge scroll-mt-28 py-24 md:py-36">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Insights</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">Notes on brand &amp; design.</h2>
          </Reveal>
        </div>
      </div>

      <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-3">
        {insights.map((post) => (
          <StaggerItem
            key={post.title}
            data-cursor="hover"
            className="group flex flex-col rounded-[1.75rem] border border-border bg-card p-6 transition-[transform,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:border-white/25 motion-reduce:transform-none sm:rounded-[2rem] sm:p-8"
          >
            <div className="flex items-center justify-between text-[0.78rem] font-bold uppercase tracking-[0.14em] text-faint">
              <span>{post.category}</span>
              <span>{post.readTime}</span>
            </div>
            <h3 className="text-h3 mt-8 text-balance transition-colors group-hover:text-brand">
              {post.title}
            </h3>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
