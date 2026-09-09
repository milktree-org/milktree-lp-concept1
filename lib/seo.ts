/**
 * SEO source of truth — site URL, titles, descriptions, keywords and all
 * schema.org JSON-LD builders. Import from here instead of hardcoding
 * metadata strings in layouts/pages so copy never drifts.
 */
import { CONTACT_EMAIL, faqs, site, socials } from "@/lib/site";
import { getProducts, type Faq, type Product } from "@/lib/offer";
import type { WorkProject } from "@/lib/work";

export const SITE_URL = "https://www.milktreeagency.com";

export const seo = {
  /** Root <title> — keyword-carrying but still on-brand. */
  title: "Milktree | UK Brand Design Studio | Brands you can see on the high street",
  description:
    "Milktree is a UK design studio that builds brands for real businesses and takes them all the way to signage, packaging and print. Fixed-price brand sprints and brand builds, plus a design subscription. 200+ brands built over 7 years.",
  ogDescription:
    "A UK design studio. Fix one thing in two weeks, rebuild the brand in six, or keep us on retainer. Fixed prices, no proposals.",
  keywords: [
    "brand design studio UK",
    "branding agency UK",
    "brand identity design",
    "rebrand small business UK",
    "brand sprint",
    "fixed price branding",
    "design subscription UK",
    "unlimited design service",
    "signage design",
    "packaging design",
    "logo and brand guidelines",
  ],
};

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
    foundingDate: "2019",
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

function offerFor(product: Product) {
  const base = {
    "@type": "Offer",
    name: product.name,
    description: product.summary,
    price: product.amount,
    priceCurrency: "GBP",
    url: `${SITE_URL}${product.href}`,
    availability: "https://schema.org/InStock",
  };
  if (product.kind === "subscription") {
    return {
      ...base,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: product.amount,
        priceCurrency: "GBP",
        unitText: "MONTH",
      },
    };
  }
  return base;
}

/** The whole ladder as one service with an offer catalogue. GBP: the billing currency. */
export function serviceJsonLd() {
  const products = getProducts("GBP");
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    name: "Brand design",
    serviceType: "Brand identity design, brand sprints and design subscription",
    description: seo.ogDescription,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "GB",
    url: `${SITE_URL}/pricing`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Milktree products",
      itemListElement: products.map(offerFor),
    },
  };
}

/** A single product page's structured data. */
export function productJsonLd(products: Product[], pageUrl: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${pageUrl}#service`,
    name,
    description,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: "GB",
    url: `${SITE_URL}${pageUrl}`,
    offers: products.map(offerFor),
  };
}

export function faqPageJsonLd(items: Faq[], pageUrl = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}${pageUrl}#faq`,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Homepage FAQ, kept for the existing import path. */
export function faqJsonLd() {
  return faqPageJsonLd(faqs, "/");
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Milktree", item: SITE_URL },
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: t.name,
        item: `${SITE_URL}${t.path}`,
      })),
    ],
  };
}

export function workBreadcrumbJsonLd(project: WorkProject) {
  return breadcrumbJsonLd([
    { name: "Our work", path: "/work" },
    { name: project.title, path: `/work/${project.slug}` },
  ]);
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

/** Standard per-page metadata builder so titles and OG stay consistent. */
export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}) {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${input.title} | Milktree`,
      description: input.description,
      url: input.path,
      siteName: "Milktree",
      locale: "en_GB",
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${input.title} | Milktree`,
      description: input.description,
    },
  };
}
