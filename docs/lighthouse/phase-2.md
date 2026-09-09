# Lighthouse, end of phase 2

Run: 2026-09-09, production build, `next start`, Lighthouse 12, mobile emulation, simulated throttling, local Chromium. Two runs per page (both performance scores shown), other categories from the better run. Same conditions as `baseline.md` and `phase-1.md`.

| Page | Performance (run 1/run 2) | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| / | 80/83 (baseline 67, phase 1 70/80) | 100 | 100 | 100 | 4.2 s | 170 ms | 0 |
| /work | 73/75 (baseline 83, five runs 74 to 85) | 100 | 100 | 100 | 5.4 s | 280 ms | 0 |
| /services | 85/87 (new) | 100 | 100 | 100 | 3.6 s | 200 ms | 0 |
| /services/print | 88/88 (new) | 100 | 100 | 100 | 3.5 s | 180 ms | 0 |
| /for/hospitality | 89/90 (new) | 100 | 100 | 100 | 3.5 s | 130 ms | 0 |
| /about | 88/86 (new) | 100 | 100 | 100 | 3.5 s | 200 ms | 0 |
| /how-it-works | 86/86 (new) | 100 | 100 | 100 | 3.6 s | 220 ms | 0 |
| /sprint | 86/87 (phase 1 89/84) | 100 | 100 | 100 | 3.5 s | 220 ms | 0 |

Category failures: none on any page.

## Read

- Home is now 80 to 83 against a baseline of 67, after the cursor moved to a lazy chunk and the dead landing-page wrapper came out of the root layout.
- New pages land at 85 to 90 because their largest element paints from the server HTML.
- /work stays the outlier. Its scores swing between 73 and 85 run to run; the LCP is the first card image and the remaining delay is hydration. The next lever is the shared client bundle (framer-motion, Lenis and the header's navigation primitives on every page), which is a deliberate change to the motion architecture and belongs in its own pass, not in a content phase.
- Page audit (`scripts/audit-pages.mjs`, 15 pages at 375/768/1024/1440/1920): no horizontal overflow, no console or hydration errors, one h1 per page, no heading skips, all targets 44px or larger.
