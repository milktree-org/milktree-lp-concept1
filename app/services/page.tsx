import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductHero } from "@/components/product/product-hero";
import { ProductCta } from "@/components/product/product-cta";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WorkCard } from "@/components/ui/work-card";
import { JsonLd } from "@/components/seo/json-ld";
import { services } from "@/lib/services";
import { workByDiscipline } from "@/lib/work";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

const description =
  "Brand identity, campaigns and social, web and product, print, packaging and outdoor, decks and collateral. Five disciplines, one studio, fixed prices.";

export const metadata: Metadata = pageMeta({
  title: "Services — brand identity, campaigns, web, print, decks",
  description,
  path: "/services",
});

/**
 * Each tile shows two pieces of work, spread across the portfolio so the
 * same featured projects don't repeat down the page.
 */
function makeWorkPicker() {
  const used = new Set<string>();
  return (slug: Parameters<typeof workByDiscipline>[0]) => {
    const pool = workByDiscipline(slug, 6);
    const fresh = pool.filter((p) => !used.has(p.slug));
    const pick = [...fresh, ...pool].slice(0, 2);
    pick.forEach((p) => used.add(p.slug));
    return pick;
  };
}

/** Services overview (spec §6.3): five tiles, each with two pieces of work. */
export default function ServicesIndex() {
  const pickWork = makeWorkPicker();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Services", path: "/services" }])} />
      <ProductHero
        eyebrow="Services"
        lines={["Everything a brand", "needs to be seen."]}
        sub="Five disciplines under one creative director, so the signage matches the website and the deck matches both. Every one of them is bought at a fixed price: as a sprint, a build, or a request on subscription."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
      />

      <section className="container-edge pb-24 md:pb-36">
        <StaggerGroup className="grid gap-6">
          {services.map((s, i) => {
            const work = pickWork(s.slug);
            return (
              <StaggerItem
                key={s.slug}
                className="grid gap-8 rounded-[2rem] border border-border bg-card p-6 md:grid-cols-[1.1fr_1fr] md:p-10 lg:grid-cols-[1fr_1.2fr]"
              >
                <div className="flex flex-col">
                  <Eyebrow>{String(i + 1).padStart(2, "0")}</Eyebrow>
                  <h2 className="text-h2 mt-5">
                    <Link
                      href={`/services/${s.slug}`}
                      data-cursor="hover"
                      className="inline-flex min-h-11 items-center transition-colors hover:text-brand"
                    >
                      {s.name}
                    </Link>
                  </h2>
                  <p className="text-body mt-4 max-w-md">{s.intro}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.includes.slice(0, 4).map((inc) => (
                      <li key={inc.title} className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground">
                        {inc.title}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services/${s.slug}`}
                    data-cursor="hover"
                    className="mt-8 inline-flex min-h-11 items-center gap-2 font-bold text-foreground transition-colors hover:text-brand"
                  >
                    See {s.name.toLowerCase()}
                    <ArrowUpRight aria-hidden className="size-4" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {work.map((p) => (
                    <WorkCard key={p.slug} project={p} />
                  ))}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal className="mt-10">
          <p className="text-sm font-medium text-faint">
            Development, video production, 3D and complex motion are out of scope. We design; we&apos;ll introduce partners for the rest.
          </p>
        </Reveal>
      </section>

      <ProductCta
        title="Not sure which one you need?"
        body="Two minutes to tell us what's bothering you. We'll point you at the right product."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
        source="Services — final CTA"
      />
    </>
  );
}
