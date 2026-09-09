import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductHero } from "@/components/product/product-hero";
import { ProductCta } from "@/components/product/product-cta";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { JsonLd } from "@/components/seo/json-ld";
import { sortedArticles } from "@/lib/insights";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

const description =
  "Straight talk on brand and design for owner-led businesses: what things cost, what actually fixes a homepage, and what a design subscription is for.";

export const metadata: Metadata = pageMeta({
  title: "Insights — straight talk on brand and design",
  description,
  path: "/insights",
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Insights index (PRD 3.1). Typed data, no CMS. */
export default function InsightsIndex() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Insights", path: "/insights" }])} />
      <ProductHero
        eyebrow="Insights"
        lines={["Straight talk", "on brand", "and design."]}
        sub="What things cost, what actually fixes a homepage, what a subscription is for. Written for the people who run the business, not the people who run the marketing department."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See the work", href: "/work" }}
        trust={site.trustLine}
      />

      <section className="container-edge pb-24 md:pb-36">
        <StaggerGroup className="divide-y divide-border border-y border-border">
          {sortedArticles.map((a) => (
            <StaggerItem key={a.slug}>
              <Link
                href={`/insights/${a.slug}`}
                data-cursor="hover"
                className="group grid gap-4 py-10 md:grid-cols-[12rem_1fr_3rem] md:items-start md:gap-10 md:py-14"
              >
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">
                  {formatDate(a.date)} · {a.readMinutes} min
                </p>
                <div>
                  <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground transition-colors group-hover:text-brand">
                    {a.title}
                  </h2>
                  <p className="text-body mt-3 max-w-2xl">{a.standfirst}</p>
                </div>
                <span className="hidden size-11 place-items-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink md:grid">
                  <ArrowUpRight aria-hidden className="size-5" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <ProductCta
        title="Let's fix the thing that's been bothering you."
        body="Two minutes to tell us what you need. Fixed prices, a real person on the other end."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
        source="Insights — final CTA"
      />
    </>
  );
}
