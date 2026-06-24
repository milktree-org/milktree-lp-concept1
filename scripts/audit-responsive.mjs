#!/usr/bin/env node
/**
 * Responsive audit — scans the homepage at key viewports for overflow,
 * undersized touch targets, and layout breakage. Run: node scripts/audit-responsive.mjs
 */
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.URL || "http://localhost:3000";
const OUT = path.resolve(import.meta.dirname, "../.screenshots/responsive");
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "iphone-se", width: 320, height: 568 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "iphone-14-pro-max", width: 430, height: 932 },
  { name: "ipad", width: 768, height: 1024 },
  { name: "ipad-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1440, height: 900 },
];

const SECTIONS = [
  "#top",
  "#services",
  "#how",
  "#way",
  "#why",
  "#work",
  "#stats",
  "#plans",
  "#insights",
  "#instagram",
  "#book",
];

async function auditPage(page, viewport) {
  const issues = [];

  const metrics = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const overflow = scrollW > vw + 1;

    const offenders = [];
    document.querySelectorAll("*").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const style = getComputedStyle(el);
      if (style.position === "fixed" || style.visibility === "hidden") return;
      if (rect.right > vw + 2 || rect.left < -2) {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && typeof el.className === "string" ? el.className : "")
          .split(" ")
          .slice(0, 3)
          .join(".");
        offenders.push({
          tag,
          cls,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
    });

    const smallTargets = [];
    document.querySelectorAll("a, button, [role='button']").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        const text = (el.textContent || "").trim().slice(0, 40);
        if (rect.width > 0 && rect.height > 0) {
          smallTargets.push({
            text,
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          });
        }
      }
    });

    return {
      overflow,
      scrollWidth: scrollW,
      clientWidth: vw,
      offenders: offenders.slice(0, 12),
      smallTargets: smallTargets.slice(0, 15),
    };
  });

  if (metrics.overflow) {
    issues.push({
      type: "horizontal-overflow",
      scrollWidth: metrics.scrollWidth,
      clientWidth: metrics.clientWidth,
      offenders: metrics.offenders,
    });
  }

  if (metrics.smallTargets.length > 0) {
    issues.push({ type: "small-touch-targets", targets: metrics.smallTargets });
  }

  await page.screenshot({
    path: path.join(OUT, `${viewport.name}-full.png`),
    fullPage: true,
  });

  for (const sel of SECTIONS) {
    const el = page.locator(sel).first();
    if ((await el.count()) > 0) {
      try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const slug = sel.replace("#", "") || "hero";
        await page.screenshot({
          path: path.join(OUT, `${viewport.name}-${slug}.png`),
        });
      } catch {
        /* section may be inside nested element */
      }
    }
  }

  return issues;
}

const browser = await chromium.launch();
const report = { url: URL, viewports: {} };

for (const vp of VIEWPORTS) {
  console.log(`\n▸ ${vp.name} (${vp.width}×${vp.height})`);
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.width < 768,
    hasTouch: vp.width < 1024,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);

  const issues = await auditPage(page, vp);
  report.viewports[vp.name] = { width: vp.width, height: vp.height, issues };

  if (issues.length === 0) {
    console.log("  ✓ no issues");
  } else {
    for (const issue of issues) {
      console.log(`  ✗ ${issue.type}`);
      if (issue.offenders) {
        for (const o of issue.offenders.slice(0, 5)) {
          console.log(`    - ${o.tag}.${o.cls} right=${o.right} vw=${vp.width}`);
        }
      }
      if (issue.targets) {
        for (const t of issue.targets.slice(0, 5)) {
          console.log(`    - "${t.text}" ${t.w}×${t.h}px`);
        }
      }
    }
  }

  await context.close();
}

const reportPath = path.join(OUT, "report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n✓ Report: ${reportPath}`);
console.log(`✓ Screenshots: ${OUT}`);

await browser.close();

const totalIssues = Object.values(report.viewports).reduce((n, v) => n + v.issues.length, 0);
process.exit(totalIssues > 0 ? 1 : 0);
