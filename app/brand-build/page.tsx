import type { Metadata } from "next";
import { BuildPage } from "@/components/product/build-page";
import { CaseStudyRow } from "@/components/product/case-study-row";
import { ProductCta } from "@/components/product/product-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getBuildFaqs, getProductsForStart } from "@/lib/offer";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, faqPageJsonLd, pageMeta, productJsonLd } from "@/lib/seo";

const description =
  "A complete brand identity from strategy to guidelines in four to six weeks, at a fixed price from £3,499. Positioning workshop, logo system, colour, type, five applications, guidelines. Brand Build Plus adds the campaign toolkit to launch it.";

export const metadata: Metadata = pageMeta({
  title: "Brand Build — the whole brand, rebuilt, fixed price",
  description,
  path: "/brand-build",
});

/**
 * Brand Build and Brand Build Plus (spec §6.5). The product 200 businesses
 * have already bought from Milktree, back on the page with a price.
 */
export default function BrandBuild() {
  const tiers = getProductsForStart("build", "GBP");
  return (
    <>
      <JsonLd
        data={[
          productJsonLd(tiers, "/brand-build", "Brand Build", description),
          faqPageJsonLd(getBuildFaqs("GBP"), "/brand-build"),
          breadcrumbJsonLd([{ name: "Brand Build", path: "/brand-build" }]),
        ]}
      />
      <BuildPage />
      <CaseStudyRow
        title="Brands we've built this way."
        intro="Workshop, direction, identity, applications, guidelines. Then out into the world."
        slugs={["eazyphone", "mint-mortgages", "latimers"]}
      />
      <ProductCta
        title="Your business has outgrown its brand. Let's fix that."
        body="Six weeks from the workshop to the guidelines. A named designer, a creative director, a fixed price."
        product="build"
        cta="Start a brand build"
        secondary={{ label: "Not ready? See the sprint", href: "/sprint" }}
        trust={site.trustLine}
        source="Brand Build — final CTA"
      />
    </>
  );
}
