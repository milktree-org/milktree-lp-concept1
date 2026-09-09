import type { Metadata } from "next";
import { PricingPage } from "@/components/product/pricing-page";
import { PricingTable } from "@/components/sections/pricing-table";
import { PricingFaq } from "@/components/product/pricing-faq";
import { ProductCta } from "@/components/product/product-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getPricingFaqs } from "@/lib/offer";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, faqPageJsonLd, pageMeta, serviceJsonLd } from "@/lib/seo";

const description =
  "Every Milktree product on one page. Brand Reset Sprint £799, Brand Build from £3,499, design subscription from £1,499 a month. Fixed prices, no proposals, no hourly billing.";

export const metadata: Metadata = pageMeta({
  title: "Pricing — fixed prices for every product",
  description,
  path: "/pricing",
});

/** All five products side by side (spec §6.7). */
export default function Pricing() {
  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(),
          faqPageJsonLd(getPricingFaqs("GBP"), "/pricing"),
          breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }]),
        ]}
      />
      <PricingPage />
      <PricingTable />
      <PricingFaq />
      <ProductCta
        title="Start where the problem is."
        body="Two minutes to tell us what you need. We'll point you at the right product and book a call."
        product="sprint"
        cta="Start a project"
        trust={site.trustLine}
        source="Pricing — final CTA"
      />
    </>
  );
}
