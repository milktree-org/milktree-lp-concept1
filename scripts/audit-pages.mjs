#!/usr/bin/env node
/**
 * Quality-gate audit for the studio site (docs/PRD.md §8).
 *
 * For every page in PAGES and every viewport in VIEWPORTS:
 *   - full-page screenshot to .screenshots/audit/<page>/<viewport>.png
 *   - horizontal overflow check (document wider than viewport)
 *   - console errors and hydration warnings
 *   - heading order (no level skipped) and h1 count
 *   - interactive targets under 44px (anchors, buttons)
 *
 * Run: URL=http://localhost:3000 node scripts/audit-pages.mjs
 * Exit code 1 if any hard failure (overflow, console error, missing h1).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.URL || "http://localhost:3000";
const OUT = path.resolve(import.meta.dirname, "../.screenshots/audit");
fs.mkdirSync(OUT, { recursive: true });

const PAGES = (process.env.PAGES || "/,/pricing,/sprint,/brand-build,/subscription,/start,/start?product=sprint,/work")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const slug = (p) => (p === "/" ? "home" : p.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-"));

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
});
let hardFailures = 0;
const report = [];

for (const pagePath of PAGES) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || /hydrat/i.test(msg.text())) consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));

    await page.goto(URL + pagePath, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(1200);
    // Scroll through so whileInView reveals fire before the screenshot.
    await page.evaluate(async () => {
      const total = document.body.scrollHeight;
      for (let y = 0; y < total; y += window.innerHeight * 0.8) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForTimeout(900);

    const checks = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const vw = window.innerWidth;
      const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
      let skips = 0;
      for (let i = 1; i < headings.length; i++) if (headings[i] > headings[i - 1] + 1) skips++;
      const small = [...document.querySelectorAll("a,button")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && (r.width < 44 || r.height < 44);
        })
        .slice(0, 8)
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
      return { overflow: docW > vw + 1 ? docW - vw : 0, h1s: document.querySelectorAll("h1").length, skips, small };
    });

    const dir = path.join(OUT, slug(pagePath));
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, `${vp.name}.png`), fullPage: true });

    const problems = [];
    if (checks.overflow) problems.push(`HORIZONTAL OVERFLOW +${checks.overflow}px`);
    if (checks.h1s !== 1) problems.push(`h1 count ${checks.h1s}`);
    if (checks.skips) problems.push(`heading level skips ${checks.skips}`);
    if (consoleErrors.length) problems.push(`console: ${consoleErrors.slice(0, 3).join(" | ").slice(0, 300)}`);
    if (checks.small.length) problems.push(`small targets: ${checks.small.join("; ")}`);
    const hard = checks.overflow || checks.h1s !== 1 || consoleErrors.length;
    if (hard) hardFailures++;
    report.push(`${hard ? "FAIL" : problems.length ? "warn" : " ok "} ${pagePath} @${vp.name}${problems.length ? " — " + problems.join(" · ") : ""}`);
    await context.close();
  }
}

await browser.close();
console.log(report.join("\n"));
console.log(`\n${hardFailures} hard failures. Screenshots in ${OUT}`);
process.exit(hardFailures ? 1 : 0);
