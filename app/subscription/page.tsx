import type { Metadata } from "next";
import { SubscriptionPage } from "@/components/product/subscription-page";
import { CaseStudyRow } from "@/components/product/case-study-row";
import { ProductCta } from "@/components/product/product-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductsForStart, getSubscriptionFaqs } from "@/lib/offer";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, faqPageJsonLd, pageMeta, productJsonLd } from "@/lib/seo";

const description =
  "Ongoing design on tap. Unlimited requests, back in around 48 hours, every piece checked by a creative director. Essentials from £1,499 a month; Design Lead gives you a named senior designer on Slack. Pause or cancel any month.";

export const metadata: Metadata = pageMeta({
  title: "Design subscription — unlimited requests, pause any month",
  description,
  path: "/subscription",
});

/**
 * Essentials and Design Lead (spec §6.6), framed as what happens after a
 * build rather than as the front door.
 */
export default function Subscription() {
  const plans = getProductsForStart("subscription", "GBP");
  return (
    <>
      <JsonLd
        data={[
          productJsonLd(plans, "/subscription", "Design subscription", description),
          faqPageJsonLd(getSubscriptionFaqs("GBP"), "/subscription"),
          breadcrumbJsonLd([{ name: "Subscription", path: "/subscription" }]),
        ]}
      />
      <SubscriptionPage />
      <CaseStudyRow
        title="The ongoing work looks like this."
        intro="Campaigns, signage, print, social. The same studio that builds the brand keeps it moving."
        slugs={["mint-mortgages", "alltrad-roofing", "powerforce"]}
      />
      <ProductCta
        title="Design that's never the thing that's late."
        body="Pick a plan, send the first request, get it back this week."
        product="subscription"
        cta="Start a subscription"
        secondary={{ label: "Compare all products", href: "/pricing" }}
        trust={site.trustLine}
        source="Subscription — final CTA"
      />
    </>
  );
}
