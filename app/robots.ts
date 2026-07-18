import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ads", "/book", "/start", "/login", "/concept-2", "/concept-3"],
    },
    sitemap: "https://www.milktreeagency.com/sitemap.xml",
  };
}
