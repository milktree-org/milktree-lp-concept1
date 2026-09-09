# Lighthouse baseline (before phase 1)

Run: 2026-09-09, production build, `next start`, Lighthouse 12, mobile emulation, simulated throttling, local Chromium. Numbers are for comparison against the post-phase run under identical conditions, not a substitute for field data.

| Page | Performance | Accessibility | Best practices | SEO | LCP | FCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| / | 67 | 94 | 100 | 100 | 5.6 s | 1.6 s | 400 ms | 0 |
| /work | 83 | 94 | 100 | 100 | 4.4 s | 1.2 s | 150 ms | 0 |
| /start | 84 | 91 | 100 | 69 | 4.5 s | 1.1 s | 90 ms | 0 |

Raw JSON reports are not committed (2MB); the exact command is in `phase-1.md` under "How to run".

### /
LCP element: `<img alt="" decoding="async" data-nimg="fill" class="object-cover" style="position: absolute; height: 100%; width: 100%; inset: 0px;" sizes="(max-width: 1140px)`
Opportunities:
- Reduce unused JavaScript: Est savings of 80 KiB
- Avoid serving legacy JavaScript to modern browsers: Est savings of 13 KiB
Accessibility failures:
- Background and foreground colors do not have a sufficient contrast ratio.
- Heading elements are not in a sequentially-descending order
SEO failures:
- none

### /start
LCP element: `<h2 class="text-balance text-[clamp(1.6rem,4.5vw,2.4rem)] font-bold leading-[1.05] tr…">`
Opportunities:
- Reduce unused JavaScript: Est savings of 82 KiB
- Avoid serving legacy JavaScript to modern browsers: Est savings of 13 KiB
Accessibility failures:
- ARIA `progressbar` elements do not have accessible names.
- Background and foreground colors do not have a sufficient contrast ratio.
- Heading elements are not in a sequentially-descending order
SEO failures:
- Page is blocked from indexing
