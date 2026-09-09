import type { Metadata } from "next";
import { SprintPage } from "@/components/product/sprint-page";
import { CaseStudyRow } from "@/components/product/case-study-row";
import { ProductCta } from "@/components/product/product-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getProduct, getSprintFaqs } from "@/lib/offer";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, faqPageJsonLd, pageMeta, productJsonLd } from "@/lib/seo";

const description =
  "Fix the one thing that's been bothering you. Your homepage, your pitch deck or your identity, tightened up properly in two weeks for £799. Fixed price, one revision round, creative director on it.";

export const metadata: Metadata = pageMeta({
  title: "Brand Reset Sprint — one thing fixed in two weeks",
  description,
  path: "/sprint",
});

/**
 * The page every ad and cold email lands on (spec §6.4). One product, one
 * price, one button. Prices localise client-side inside <SprintPage>.
 */
export default function Sprint() {
  const sprint = getProduct("sprint", "GBP");
  return (
    <>
      <JsonLd
        data={[
          productJsonLd([sprint], "/sprint", sprint.name, description),
          faqPageJsonLd(getSprintFaqs("GBP"), "/sprint"),
          breadcrumbJsonLd([{ name: "Brand Reset Sprint", path: "/sprint" }]),
        ]}
      />
      <SprintPage />
      <CaseStudyRow
        eyebrow="The standard"
        title="Work from the same studio."
        intro="Every sprint is worked by the team behind these. Same designers, same creative director, smaller scope."
        slugs={["remigo", "salesprout", "orange-rooms"]}
      />
      <ProductCta
        title="Two weeks from now, it's fixed."
        body="Pick the thing. Book the sprint. Brief us on day one."
        product="sprint"
        cta="Book a sprint"
        secondary={{ label: "Compare all products", href: "/pricing" }}
        trust={site.trustLine}
        source="Sprint — final CTA"
      />
    </>
  );
}
