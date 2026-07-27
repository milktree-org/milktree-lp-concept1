import "server-only";

import { logoLuminance } from "@/lib/server/logo";
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
          colorScheme?: string;
          colors?: Record<string, string>;
          fonts?: { family?: string; role?: string }[];
          typography?: {
            fontFamilies?: Record<string, string>;
            fontSizes?: { h1?: string; h2?: string; body?: string };
          };
          spacing?: { borderRadius?: string };
          components?: {
            buttonPrimary?: {
              background?: string;
              textColor?: string;
              borderRadius?: string;
            };
          };
          images?: { logo?: string | null; logoAlt?: string | null };
          personality?: { tone?: string; targetAudience?: string };
          __llm_button_reasoning?: { primary?: { text?: string } };
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

    const colorRoles = branding?.colors
      ? dedupeColors(branding.colors)
      : undefined;
    const colors = colorRoles?.map((c) => c.hex);

    const fontRoles = branding?.fonts
      ? dedupeFonts(branding.fonts, branding.typography?.fontFamilies)
      : undefined;
    const fonts = fontRoles?.map((f) => f.family);

    const button = branding?.components?.buttonPrimary;
    const logo = branding?.images?.logo || undefined;

    return {
      domain,
      name:
        meta?.ogSiteName ||
        branding?.images?.logoAlt?.replace(/\s+logo$/i, "") ||
        undefined,
      colors,
      fonts,
      headline: realHeadline(meta?.ogTitle) ?? realHeadline(meta?.title),
      description: meta?.ogDescription || meta?.description || undefined,
      colorRoles,
      fontRoles,
      typeScale: branding?.typography?.fontSizes,
      logo,
      logoLuminance: logo ? await logoLuminance(logo) : null,
      radius: branding?.spacing?.borderRadius || undefined,
      button: button
        ? {
            label: branding?.__llm_button_reasoning?.primary?.text || undefined,
            background: button.background,
            textColor: button.textColor,
            radius: button.borderRadius,
          }
        : undefined,
      colorScheme: branding?.colorScheme || undefined,
      tone: branding?.personality?.tone || undefined,
      audience: branding?.personality?.targetAudience || undefined,
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

/**
 * Server boilerplate is not a headline. A broken competitor site must show as
 * having no headline, not quote "Web Server's Default Page" at the lead.
 */
function realHeadline(value?: string): string | undefined {
  if (!value) return undefined;
  if (
    /default page|default web|under construction|coming soon|index of|untitled|placeholder|parked|domain for sale|apache|nginx|iis|plesk|cpanel/i.test(
      value,
    )
  ) {
    return undefined;
  }
  return value;
}

/** One entry per distinct hex, keeping the first (most senior) role name. */
function dedupeColors(
  colors: Record<string, string>,
): { role: string; hex: string }[] {
  const seen = new Set<string>();
  const out: { role: string; hex: string }[] = [];
  for (const [role, hex] of Object.entries(colors)) {
    if (!hex) continue;
    const key = hex.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ role, hex: key });
    if (out.length === 6) break;
  }
  return out;
}

/**
 * Firecrawl reports fonts twice: a flat list with roles, and a typography map.
 * Merge both so a heading face declared only in the map still surfaces.
 */
function dedupeFonts(
  fonts: { family?: string; role?: string }[],
  families?: Record<string, string>,
): { family: string; role?: string }[] {
  const byFamily = new Map<string, { family: string; role?: string }>();
  const add = (family?: string, rawRole?: string) => {
    if (!family) return;
    const role = rawRole && rawRole !== "unknown" ? rawRole : undefined;
    const existing = byFamily.get(family);
    if (existing) {
      if (!existing.role && role) existing.role = role;
      return;
    }
    if (byFamily.size >= 4) return;
    byFamily.set(family, { family, role });
  };
  for (const f of fonts) add(f.family, f.role);
  for (const [role, family] of Object.entries(families ?? {})) {
    add(family, role === "primary" ? "body" : role);
  }
  return [...byFamily.values()];
}
