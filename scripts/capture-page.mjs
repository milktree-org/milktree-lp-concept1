import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.URL || "http://localhost:3000";
const outDir = path.resolve(import.meta.dirname, "../.screenshots");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const totalHeight = await page.evaluate(() => document.body.scrollHeight);
const vh = 900;
const steps = Math.ceil(totalHeight / vh);
console.log(`Page height ${totalHeight}px → ${steps} viewports`);

for (let i = 0; i < steps; i++) {
  const y = i * vh;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(900);
  const file = path.join(outDir, `step-${String(i).padStart(2, "0")}.png`);
  await page.screenshot({ path: file });
  console.log(`  ${file} @ scrollY=${y}`);
}

await browser.close();
console.log("done");
