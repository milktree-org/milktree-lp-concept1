import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

/**
 * Screenshots each A4 page of a Brand Score document for design review.
 *   SESSION=<uuid> KEY=<DOC_REVIEW_KEY> node scripts/capture-doc.mjs
 * Optional: PAGES=3,4 to capture only certain pages.
 */

const session = process.env.SESSION || "preview";
const key = process.env.KEY || "";
const base = process.env.BASE || "http://localhost:3000";
const only = process.env.PAGES
  ? new Set(process.env.PAGES.split(",").map((n) => Number(n.trim())))
  : null;

const outDir = path.resolve(import.meta.dirname, "../.screenshots/doc");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 900, height: 1200 },
  deviceScaleFactor: 2,
});

const url = `${base}/brand-score-doc/${session}${key ? `?k=${key}` : ""}`;
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector(".doc-page");
await page.waitForTimeout(1200);

const pages = await page.locator(".doc-page").all();
console.log(`${pages.length} pages at ${url}`);

for (let i = 0; i < pages.length; i++) {
  const n = i + 1;
  if (only && !only.has(n)) continue;
  const file = path.join(outDir, `page-${String(n).padStart(2, "0")}.png`);
  await pages[i].screenshot({ path: file });
  console.log(`→ ${file}`);
}

await browser.close();
