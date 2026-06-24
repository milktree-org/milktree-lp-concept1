import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ads", "/book"],
    },
    sitemap: "https://www.milktreeagency.com/sitemap.xml",
  };
}
