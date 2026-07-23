import type { MetadataRoute } from "next";
import { workProjects } from "@/lib/work";

const BASE = "https://www.milktreeagency.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    ...workProjects.map((p) => ({
      url: `${BASE}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${BASE}/brand-report`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/hire-calculator`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/brand-audit`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/subscribe`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/careers`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
