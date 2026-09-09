import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductHero } from "@/components/product/product-hero";
import { ProductCta } from "@/components/product/product-cta";
import { CaseStudyRow } from "@/components/product/case-study-row";
import { BoughtThrough } from "@/components/product/bought-through";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { Eyebrow } from "@/components/ui/eyebrow";
import { JsonLd } from "@/components/seo/json-ld";
import { getAudience, getPublishedAudiences } from "@/lib/audiences";
import { getProduct } from "@/lib/offer";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

type Params = Promise<{ audience: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedAudiences().map((a) => ({ audience: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const audience = getAudience((await params).audience);
  if (!audience) return {};
  return pageMeta({
    title: audience.seoTitle,
    description: audience.seoDescription,
    path: `/for/${audience.slug}`,
  });
}

/**
 * Who it's for (spec §6.8). One template, one entry per sector with at
 * least two case studies. Hero in the sector's language, the sector's
 * symptoms, its work, the recommended starting product, CTA.
 */
export default async function AudiencePage({ params }: { params: Params }) {
  const audience = getAudience((await params).audience);
  if (!audience) notFound();

  const start = getProduct(audience.start.product, "GBP");
  const alternatives = (["sprint", "essentials"] as const).filter((id) => id !== audience.start.product);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Who it's for", path: "/for/" + audience.slug },
          { name: audience.label, path: `/for/${audience.slug}` },
        ])}
      />
      <ProductHero
        eyebrow={`For ${audience.label.toLowerCase()}`}
        lines={audience.lines}
        sub={audience.intro}
        product={start.startProduct}
        cta="Start a project"
        secondary={{ label: "See the work", href: `/work?sector=${audience.slug}` }}
        trust={audience.clients}
      />

      {/* Symptoms in this sector's words */}
      <section className="container-edge pb-20 md:pb-28">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Sound familiar?</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6 text-balance">What we hear from {audience.label.toLowerCase()} businesses.</h2>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 grid gap-5 lg:grid-cols-3">
          {audience.symptoms.map((s) => (
            <StaggerItem
              key={s.title}
              className="rounded-[2rem] border border-border bg-card p-8 transition-colors duration-300 hover:border-white/25"
            >
              <h3 className="text-h3">{s.title}</h3>
              <p className="text-body mt-3">{s.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <CaseStudyRow
        title={`${audience.label} brands we've built.`}
        intro="Filtered to this sector. The full index is a click away."
        slugs={audience.work.slice(0, 3).map((p) => p.slug)}
      />

      <BoughtThrough
        eyebrow="Where to start"
        title={audience.start.why}
        items={[
          { product: audience.start.product, how: `${start.summary}` },
          ...alternatives.map((id) => {
            const p = getProduct(id, "GBP");
            return { product: id, how: p.summary };
          }),
        ]}
      />

      <ProductCta
        title="Your business has grown. Let's get the brand caught up."
        body="Two minutes to tell us what you need. Fixed price, a real person on the other end."
        product={start.startProduct}
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
        source={`Audience — ${audience.label}`}
      />
    </>
  );
}
