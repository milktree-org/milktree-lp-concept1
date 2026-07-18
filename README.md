# Milktree — marketing site

Premium, motion-rich marketing site for **Milktree** — "your creative department, on demand." Black & yellow, type-led, built to convert cold traffic into qualified subscription leads via the multistep form at `/start` and the Brand Ranking Quiz at `/brand-report`. Design system spec in [`CLAUDE.md`](./CLAUDE.md); offer/funnel spec in `MILKTREE-LANDING.md`.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (CSS-based `@theme`, no `tailwind.config.js`)
- **shadcn/ui** (`base-nova` preset → `@base-ui/react` primitives)
- **Framer Motion** (all animation) + **Lenis** (smooth scroll)
- **Satoshi** via `next/font/local`, **lucide-react** icons

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (statically prerendered)
```

## How it's organised

```
app/            layout (fonts, smooth scroll, cursor, header/footer), globals.css (brand tokens), page.tsx
components/
  motion/       Reveal, StaggerGroup, CountUp, Magnetic, CustomCursor, LineMask, Parallax, SmoothScroll, PageTransition
  ui/           shadcn primitives + Eyebrow, LogoMarquee, PortfolioCard
  layout/       Header, Footer, Wordmark, BookButton, AnchorLink
  sections/     the 13 homepage sections, composed in app/page.tsx
lib/
  motion.ts     easing, durations, variants (single source of truth)
  site.ts       all copy/config + CAL_URL (booking link)
public/         fonts/  work/ (portfolio media)  logos/ (client logos + brand svg)
```

## Scope

This build is the **homepage** plus the lead funnel:

- `/start` — multistep qualification form (one question per screen). Routing is evaluated **server-side** in `POST /api/lead` (team ≥ 10 AND budget ≥ £1,000–£2,000 band = qualified); every submission is persisted to Supabase **before** any email or notification fires.
- `/brand-report` — Brand Ranking Quiz: self-assessment + live SERP benchmark (Apify) + competitor brand extraction (Firecrawl), email-gated results, full report by email.
- `/book` — Cal.com intro-call embed for qualified leads.

Other routes in `CLAUDE.md` §6 are deferred — nav links resolve to on-page section anchors and smooth-scroll via Lenis.

## Funnel environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (`milktree-dashboard` project) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — lead/quiz persistence (server-only) |
| `RESEND_API_KEY` | Transactional email (qualified offer, quiz report, team notify) |
| `RESEND_NURTURE_AUDIENCE_ID` | Resend Audience id for the `nurture` list |
| `SLACK_WEBHOOK_URL` | Optional — team lead notifications (falls back to email) |
| `NOTIFY_EMAIL` | Team notify recipient (default `hello@milktreeagency.com`) |
| `APIFY_API_TOKEN` | Google Search scraping for quiz benchmarks |
| `FIRECRAWL_API_KEY` | Competitor brand extraction for quiz benchmarks |
| `NEXT_PUBLIC_CAL_URL` | Cal.com intro-call event (overrides the default in `lib/site.ts`) |
| `NEXT_PUBLIC_FOUNDING_SPOTS` | Founding-rate spots remaining (shown on Design Lead plan) |

All integrations degrade gracefully when unset: without Supabase the funnel still works (leads logged to the server console only); without Apify/Firecrawl the quiz falls back to self-assessment-only scoring.

## Swapping in real assets

The site runs end-to-end on tasteful placeholders. To go live:

- **Hero reel** — drop `public/work/hero-bg.mp4` + `hero-poster.webp` (run `npm run optimize:hero` to compress from a source master).
- **Portfolio** — add `poster` / `video` paths to the items in `lib/site.ts` (`portfolio[]`); `PortfolioCard` plays the loop on hover.
- **Client logos** — replace `public/logos/logo-1.png … logo-13.png` with real monochrome logos (same paths; the marquee tints them white automatically).
- **Booking** — `CAL_URL` in `lib/site.ts` points at the Cal.com intro-call event (override with `NEXT_PUBLIC_CAL_URL`).

## Video hosting (Cloudflare R2)

Large video masters live on **Cloudflare R2** (free egress) so they don't bloat deploys or GitHub. Small web-optimized files stay in `public/` as local dev fallbacks.

1. Copy `.env.example` → `.env.local` and fill in R2 credentials.
2. Upload: `npm run upload:media` (add `-- --all` to include gitignored masters).
3. Set `NEXT_PUBLIC_MEDIA_CDN_URL` in Vercel (e.g. `https://media.milktreeagency.com`).

Video URLs are resolved in `lib/media.ts` — when the CDN env var is set at build time, hero and ad videos load from R2; locally they fall back to `/public` paths.

## Quality notes

- `prefers-reduced-motion` is honoured at the primitive level + a global CSS safety net (smooth scroll, parallax, magnetic and custom cursor all disable; reveals become instant fades; the pinned showcase becomes a normal stacked layout).
- Dark theme only. Yellow (`#FFDC04`) is used sparingly — one accent per viewport.
- Keyboard accessible, yellow focus rings, ≥44px targets, statically prerendered for fast LCP.
