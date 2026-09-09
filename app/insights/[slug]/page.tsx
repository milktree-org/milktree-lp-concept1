import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CaseStudyRow } from "@/components/product/case-study-row";
import { ProductCta } from "@/components/product/product-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { articles, getArticle, sortedArticles } from "@/lib/insights";
import { getProduct } from "@/lib/offer";
import { site } from "@/lib/site";
import { SITE_URL, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  if (!article) return {};
  return pageMeta({ title: article.title, description: article.seoDescription, path: `/insights/${article.slug}` });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Article template (PRD 3.1): type-led, one column, a pull line, the work, the product CTA. */
export default async function ArticlePage({ params }: { params: Params }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();

  const product = getProduct(article.product, "GBP");
  const others = sortedArticles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <article>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.seoDescription,
            datePublished: article.date,
            dateModified: article.date,
            author: { "@type": "Organization", name: "Milktree", url: SITE_URL },
            publisher: { "@id": `${SITE_URL}/#organization` },
            mainEntityOfPage: `${SITE_URL}/insights/${article.slug}`,
            inLanguage: "en-GB",
          },
          breadcrumbJsonLd([
            { name: "Insights", path: "/insights" },
            { name: article.title, path: `/insights/${article.slug}` },
          ]),
        ]}
      />

      <header className="container-edge pb-12 pt-32 md:pb-16 md:pt-44">
        <div className="max-w-3xl">
          <Reveal>
            <Link
              href="/insights"
              data-cursor="hover"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Insights
            </Link>
          </Reveal>
          <Reveal index={1}>
            <p className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">
              {formatDate(article.date)} · {article.readMinutes} min read
            </p>
          </Reveal>
          <Reveal index={2}>
            <h1 className="mt-5 text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.025em] text-foreground">
              {article.title}
            </h1>
          </Reveal>
          <Reveal index={3}>
            <p className="text-body-lg mt-6">{article.standfirst}</p>
          </Reveal>
        </div>
      </header>

      <div className="container-edge pb-20 md:pb-28">
        <div className="max-w-3xl space-y-7">
          {article.body.map((block, i) => {
            switch (block.type) {
              case "h2":
                return (
                  <Reveal key={i}>
                    <h2 className="pt-6 text-[clamp(1.5rem,3vw,2.1rem)] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
                      {block.text}
                    </h2>
                  </Reveal>
                );
              case "pull":
                return (
                  <Reveal key={i}>
                    <p className="border-l-2 border-brand py-2 pl-6 text-[clamp(1.4rem,2.8vw,2rem)] font-bold leading-snug tracking-tight text-foreground">
                      {block.text}
                    </p>
                  </Reveal>
                );
              case "list":
                return (
                  <Reveal key={i}>
                    <ul className="space-y-3">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-4 text-lg leading-relaxed text-muted-foreground">
                          <span aria-hidden className="mt-3.5 h-px w-5 shrink-0 bg-brand" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                );
              default:
                return (
                  <Reveal key={i}>
                    <p className="text-lg leading-relaxed text-muted-foreground">{block.text}</p>
                  </Reveal>
                );
            }
          })}
        </div>
      </div>

      <CaseStudyRow
        eyebrow="Related work"
        title="What it looks like when it's done."
        slugs={article.workSlugs}
        className="container-edge border-t border-border py-20 md:py-28"
      />

      {/* More reading */}
      {others.length > 0 && (
        <section className="container-edge pb-12">
          <Reveal>
            <Eyebrow>More reading</Eyebrow>
          </Reveal>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {others.map((a) => (
              <Link
                key={a.slug}
                href={`/insights/${a.slug}`}
                data-cursor="hover"
                className="group flex items-center justify-between gap-6 py-6"
              >
                <span className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-brand">
                  {a.title}
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-ink">
                  <ArrowUpRight aria-hidden className="size-5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductCta
        title={`${product.name}. ${product.price}${product.cadence === "/mo" ? " a month" : ", fixed"}.`}
        body={product.summary}
        product={product.startProduct}
        cta={product.cta}
        secondary={{ label: `See ${product.name}`, href: product.href }}
        trust={site.trustLine}
        source={`Article — ${article.slug}`}
      />
    </article>
  );
}
