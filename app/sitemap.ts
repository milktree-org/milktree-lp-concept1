import type { MetadataRoute } from "next";
import { workProjects } from "@/lib/work";
import { services } from "@/lib/services";
import { getPublishedAudiences } from "@/lib/audiences";

const BASE = "https://www.milktreeagency.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/sprint`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/brand-build`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/subscription`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/how-it-works`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/services`, changeFrequency: "monthly", priority: 0.8 },
    ...services.map((s) => ({
      url: `${BASE}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getPublishedAudiences().map((a) => ({
      url: `${BASE}/for/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/work`, changeFrequency: "monthly", priority: 0.8 },
    ...workProjects.map((p) => ({
      url: `${BASE}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${BASE}/brand-report`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/subscribe`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/careers`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
