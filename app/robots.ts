import type { MetadataRoute } from "next";

/**
 * `/ads`, `/book` and `/start` are deliberately NOT disallowed here.
 *
 * All three already set `robots: { index: false, follow: true }` in their page
 * metadata, which is the correct mechanism — and a Disallow actively defeats it,
 * because a crawler that is blocked from fetching the page never sees the
 * noindex tag. Worse for us: the Disallow also blocks Meta's fetcher, which
 * broke two things at once — it could not download the ad creatives served from
 * `/ads/...`, and it could not crawl `/start`, the landing page every paid ad
 * points at (Meta crawls destinations during ad review).
 *
 * Keep this list to things that genuinely must never be fetched by anyone:
 * API routes, the client login, the unshipped concept pages, and the internal
 * Brand Score document, which is opened with a secret in its query string.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login", "/concept-2", "/concept-3", "/brand-score-doc"],
    },
    sitemap: "https://www.milktreeagency.com/sitemap.xml",
  };
}
