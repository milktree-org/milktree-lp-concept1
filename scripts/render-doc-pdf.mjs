import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

/**
 * Renders a Brand Score document to PDF headlessly, so the operator loop can be
 * tested (or automated) without the browser print dialog.
 *   SESSION=<uuid> KEY=<DOC_REVIEW_KEY> node scripts/render-doc-pdf.mjs
 */

const session = process.env.SESSION || "preview";
const key = process.env.KEY || "";
const base = process.env.BASE || "http://localhost:3000";

const outDir = path.resolve(import.meta.dirname, "../.screenshots/doc");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `brand-score-${session}.pdf`);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/brand-score-doc/${session}${key ? `?k=${key}` : ""}`, {
  waitUntil: "networkidle",
});
await page.waitForSelector(".doc-page");
await page.waitForTimeout(1500);

await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});
await browser.close();

console.log(out, `${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
