import type { MetadataRoute } from "next";

/**
 * `/book` and `/start` are deliberately NOT disallowed here.
 *
 * Both set `robots: { index: false, follow: true }` in their page metadata,
 * which is the correct mechanism — and a Disallow actively defeats it, because
 * a crawler that is blocked from fetching the page never sees the noindex tag.
 * A Disallow would also block Meta's fetcher from crawling the pages paid ads
 * point at (Meta crawls destinations during ad review).
 *
 * Keep this list to things that genuinely must never be fetched by anyone:
 * API routes, the client login, and the internal Brand Score document, which
 * is opened with a secret in its query string.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/brand-score-doc"],
    },
    sitemap: "https://www.milktreeagency.com/sitemap.xml",
  };
}
