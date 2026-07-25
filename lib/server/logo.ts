import "server-only";

import sharp from "sharp";

/**
 * Mean luminance (0–1) of a logo's visible ink, used to pick a background the
 * logo is actually legible on. Scraped logos are routinely white PNGs built for
 * a dark header, so presenting one on the site's own light background makes it
 * disappear — the identity page can't afford that.
 *
 * Transparent pixels are ignored, so a white wordmark on transparency reads as
 * light (≈1) rather than being averaged away.
 */
export async function logoLuminance(
  url: string,
  timeoutMs = 8000,
): Promise<number | null> {
  try {
    const buffer = await loadImage(url, timeoutMs);
    if (!buffer) return null;

    const { data, info } = await sharp(buffer)
      .resize(48, 48, { fit: "inside", withoutEnlargement: false })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i + 3] < 40) continue;
      sum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      count += 1;
    }
    if (count < 12) return null;
    return Number((sum / count).toFixed(3));
  } catch (e) {
    console.error(
      "[logo] luminance failed:",
      e instanceof Error ? e.message : e,
    );
    return null;
  }
}

async function loadImage(
  url: string,
  timeoutMs: number,
): Promise<Buffer | null> {
  if (url.startsWith("data:")) {
    const [meta, payload] = url.split(",", 2);
    if (!payload) return null;
    return meta.includes(";base64")
      ? Buffer.from(payload, "base64")
      : Buffer.from(decodeURIComponent(payload), "utf8");
  }
  if (!/^https?:\/\//i.test(url)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}
