# Lighthouse, end of phase 1

Run: 2026-09-09, production build, `next start`, Lighthouse 12, mobile emulation, simulated throttling, local Chromium. Two runs per page, both performance scores shown (simulated runs vary by five to ten points on this hardware); other categories from the better run. Same conditions as `baseline.md`.

| Page | Performance (run 1/run 2) | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| / | 70/80 (baseline 67) | 100 | 100 | 100 | 4.5 s (was 5.6 s) | 200 ms | 0 |
| /work | 74/75 (baseline 83) | 100 | 100 | 100 | 5.6 s (was 4.4 s) | 220 ms | 0 |
| /start | 82/82 (baseline 84) | 100 | 100 | 69 | 4.4 s (was 4.5 s) | 180 ms | 0.013 |
| /sprint | 89/84 (new page) | 100 | 100 | 100 | 3.3 s | 210 ms | 0 |
| /pricing | 86/87 (new page) | 100 | 100 | 100 | 3.6 s | 200 ms | 0 |
| /brand-build | 87/85 (new page) | 100 | 100 | 100 | 3.3 s | 270 ms | 0 |
| /subscription | 83/82 (new page) | 100 | 100 | 100 | 3.7 s | 280 ms | 0 |

Category failures remaining:
- /start: Page is blocked from indexing

## Read

- Accessibility is 100 on every page (baseline 91 to 94): contrast token raised, progress bar named, heading order fixed, footer headings corrected.
- Performance improved on home. /start is level. /work first read 74 to 75 against a single-run baseline of 83; its LCP is the first card image, which was both lazy-loaded and hidden behind the scroll reveal until hydration. The first row now paints from the server HTML with priority images, and three follow-up runs read 80, 85 and 82. The remaining gap to the PRD target of 90 is one cause on every page: the largest element is delayed until React hydrates, because the reveal system starts above-the-fold elements at opacity 0. Phase 1 removed that from the two LCP elements (hero poster, product intro paragraph). A phase-2 performance pass should reduce the shared client bundle (about 80 KB of unused JavaScript on first load, per Lighthouse) and defer the Lenis and cursor scripts below the fold.
- /start is noindex by design, which is the only SEO deduction.

## How to run

```
npm run build && npx next start -p 3000
CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
lighthouse http://localhost:3000/ --preset=perf --form-factor=mobile --screenEmulation.mobile \
  --throttling-method=simulate --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=./home.json --chrome-flags="--headless=new --no-sandbox"
```

Page audit (screenshots at five widths, overflow, console, heading order, target sizes):

```
CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome URL=http://localhost:3000 node scripts/audit-pages.mjs
```
