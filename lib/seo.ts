/**
 * SEO source of truth — site URL, titles, descriptions, keywords and all
 * schema.org JSON-LD builders. Import from here instead of hardcoding
 * metadata strings in layouts/pages so copy never drifts.
 */
import { CONTACT_EMAIL, faqs, plans, site, socials } from "@/lib/site";
import type { WorkProject } from "@/lib/work";

export const SITE_URL = "https://www.milktreeagency.com";

export const seo = {
  /** Root <title> — keyword-carrying but still on-brand. */
  title: "Milktree | Design Subscription UK | Your Creative Department, On Demand",
  description:
    "Milktree is a UK design subscription: your embedded brand & design team. Unlimited design requests, senior work back in 48 hours, one flat monthly fee. 200+ brands built over 6 years as an agency.",
  ogDescription:
    "A UK design subscription: unlimited requests, senior work in 48 hours, one flat monthly fee.",
  keywords: [
    "design subscription",
    "design subscription UK",
    "unlimited design service",
    "design agency subscription",
    "productised design service",
    "brand design retainer",
    "embedded design team",
    "flat-fee design agency",
    "brand design",
    "brand identity",
    "creative department",
  ],
};

/** Parse "£1,999" → 1999 for schema price fields. */
function planPrice(price: string): number {
  return Number(price.replace(/[^0-9.]/g, ""));
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logos/favicon.svg`,
    description: seo.description,
    email: CONTACT_EMAIL,
    slogan: site.tagline,
    areaServed: "GB",
    address: { "@type": "PostalAddress", addressCountry: "GB" },
    sameAs: socials.map((s) => s.href),
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-GB",
  };
}

/** The productised design-subscription service with both plans as offers. */
export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    name: "Design subscription",
    serviceType: "Design subscription: unlimited design requests on a flat monthly fee",
    description:
      "An embedded brand and design team on subscription. Unlimited design requests, senior work back in around 48 hours, pause or cancel any month.",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "GB",
    url: SITE_URL,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Milktree plans",
      itemListElement: plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.summary,
        price: planPrice(plan.price),
        priceCurrency: "GBP",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: planPrice(plan.price),
          priceCurrency: "GBP",
          unitText: "MONTH",
        },
        url: `${SITE_URL}/#plans`,
      })),
    },
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function workBreadcrumbJsonLd(project: WorkProject) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Milktree", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Our work", item: `${SITE_URL}/work` },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `${SITE_URL}/work/${project.slug}`,
      },
    ],
  };
}

export function workCreativeWorkJsonLd(project: WorkProject) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${project.title} — ${project.category}`,
    headline: `${project.title} — ${project.category}`,
    description: project.seoDescription,
    url: `${SITE_URL}/work/${project.slug}`,
    image: `${SITE_URL}${project.hero}`,
    creator: { "@id": `${SITE_URL}/#organization` },
    genre: project.category,
    keywords: project.services.join(", "),
    inLanguage: "en-GB",
  };
}
