import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductHero } from "@/components/product/product-hero";
import { ProductCta } from "@/components/product/product-cta";
import { CaseStudyRow } from "@/components/product/case-study-row";
import { BoughtThrough } from "@/components/product/bought-through";
import { FaqAccordion } from "@/components/product/faq-accordion";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { Eyebrow } from "@/components/ui/eyebrow";
import { JsonLd } from "@/components/seo/json-ld";
import { getService, services } from "@/lib/services";
import { getProduct } from "@/lib/offer";
import { workByDiscipline } from "@/lib/work";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, faqPageJsonLd, pageMeta } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return pageMeta({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/services/${service.slug}`,
  });
}

/** Service page template (spec §6.3). */
export default async function ServicePage({ params }: { params: Params }) {
  const service = getService((await params).slug);
  if (!service) notFound();

  const recommended = getProduct(service.boughtThrough[0].product, "GBP");
  const work = workByDiscipline(service.slug, 3).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
          faqPageJsonLd(service.faqs, `/services/${service.slug}`),
        ]}
      />
      <ProductHero
        eyebrow={service.name}
        lines={service.lines}
        sub={service.intro}
        product={recommended.startProduct}
        cta="Start a project"
        secondary={{ label: "All services", href: "/services" }}
        trust={site.trustLine}
      />

      {/* What it includes */}
      <section className="container-edge pb-20 md:pb-28">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>What it includes</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="text-h2 mt-6">{service.tagline}</h2>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {service.includes.map((inc, i) => (
            <StaggerItem
              key={inc.title}
              className="rounded-[1.75rem] border border-border bg-card p-6 transition-colors duration-300 hover:border-white/25 sm:rounded-[2rem] sm:p-8"
            >
              <span className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-h3 mt-4">{inc.title}</h3>
              <p className="text-body mt-3">{inc.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <CaseStudyRow
        title="The work that proves it."
        intro="Real clients, real streets. Every piece on this page shipped."
        slugs={work.map((p) => p.slug)}
      />

      <BoughtThrough items={service.boughtThrough} />

      <FaqAccordion
        id="faq"
        eyebrow={`${service.name} FAQ`}
        title="Straight answers."
        items={service.faqs}
      />

      <ProductCta
        title="Let's make this the thing that's finally right."
        body="Two minutes to tell us what you need. Fixed price, no proposals, a real person on the other end."
        product={recommended.startProduct}
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
        source={`Service — ${service.name}`}
      />
    </>
  );
}
