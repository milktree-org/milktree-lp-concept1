import "server-only";

import type { BrandExtract } from "@/lib/quiz";

/**
 * Firecrawl brand extraction (§5.3) — the report's signature move. One scrape
 * with the `branding` format returns the site's actual palette, typography
 * and (via metadata) headline messaging.
 */

const SCRAPE_URL = "https://api.firecrawl.dev/v2/scrape";

export async function extractBrand(
  domain: string,
  timeoutMs: number,
): Promise<BrandExtract | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(SCRAPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        url: `https://${domain}`,
        formats: ["branding"],
        onlyMainContent: true,
        timeout: Math.max(5000, timeoutMs - 1000),
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[firecrawl] scrape ${domain} failed:`, res.status);
      return null;
    }
    const json = (await res.json()) as {
      success?: boolean;
      data?: {
        branding?: {
          colors?: Record<string, string>;
          fonts?: { family?: string }[];
          typography?: { fontFamilies?: Record<string, string> };
        };
        metadata?: {
          title?: string;
          description?: string;
          ogTitle?: string;
          ogDescription?: string;
          ogSiteName?: string;
        };
      };
    };
    if (!json.success || !json.data) return null;

    const branding = json.data.branding;
    const meta = json.data.metadata;

    const colors = branding?.colors
      ? [...new Set(Object.values(branding.colors).filter(Boolean))].slice(0, 6)
      : undefined;
    const fonts = branding?.fonts
      ? [...new Set(branding.fonts.map((f) => f.family).filter((f): f is string => !!f))].slice(0, 4)
      : undefined;

    return {
      domain,
      name: meta?.ogSiteName || undefined,
      colors,
      fonts,
      headline: meta?.ogTitle || meta?.title || undefined,
      description: meta?.ogDescription || meta?.description || undefined,
    };
  } catch (e) {
    console.error(
      `[firecrawl] scrape ${domain} errored:`,
      e instanceof Error ? e.message : e,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
