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
- `/subscribe` — newsletter opt-in (name + email) → Formspree + optional GHL webhook.

Other routes in `CLAUDE.md` §6 are deferred — nav links resolve to on-page section anchors and smooth-scroll via Lenis.

## Funnel environment variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL (`milktree-dashboard` project) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — lead/quiz persistence (server-only) |
| `RESEND_API_KEY` | Transactional email (qualified offer, quiz report, team notify) |
| `RESEND_FROM` | Optional — overrides the sending identity (default: `Milktree <hello@updates.milktreeagency.com>`, the verified subdomain). **Any override must be on a domain verified in Resend** or every send fails, and Resend only reports that per-send, so it looks like working code that delivers nothing |
| `RESEND_REPLY_TO` | Optional — where replies land (default `hello@milktreeagency.com`). The sending subdomain takes no inbound mail, so this needs to be a real inbox |
| `EMAIL_LOGO_URL` | Optional — overrides the wordmark PNG in transactional emails (default: the GHL CDN copy, the same asset the newsletter template uses) |
| `RESEND_NURTURE_AUDIENCE_ID` | Resend Audience id for the `nurture` list |
| `SLACK_WEBHOOK_URL` | Optional — team lead notifications (falls back to email) |
| `NOTIFY_EMAIL` | Team notify recipient (default `hello@milktreeagency.com`) |
| `APIFY_API_TOKEN` | Google Search scraping for quiz benchmarks |
| `FIRECRAWL_API_KEY` | Competitor brand extraction for quiz benchmarks |
| `NEXT_PUBLIC_CAL_URL` | Cal.com intro-call event (overrides the default in `lib/site.ts`) |
| `NEXT_PUBLIC_FOUNDING_SPOTS` | Founding-rate spots remaining (shown on Design Lead plan) |
| `FORMSPREE_NEWSLETTER_ENDPOINT` | Formspree form URL for `/subscribe` (e.g. `https://formspree.io/f/xxxxx`) |
| `GHL_NEWSLETTER_WEBHOOK_URL` | Optional — GoHighLevel inbound webhook for newsletter subs |
| `GHL_CONTACT_WEBHOOK_URL` | Optional — GoHighLevel inbound webhook for `/contact` messages (falls back to `GHL_NEWSLETTER_WEBHOOK_URL`) |
| `DOC_REVIEW_KEY` | Secret gating the internal Brand Score document review page + publish API (required in production) |
| `GHL_BRANDSCORE_WEBHOOK_URL` | GHL inbound webhook — fires on quiz completion with the internal review link |
| `GHL_BRANDSCORE_DOC_WEBHOOK_URL` | Optional — GHL inbound webhook fired when the PDF is published (record-keeping: saves `pdf_url` on the contact) |

### Tracking / analytics environment variables

| Variable | Purpose |
| --- | --- |
| `META_CAPI_ACCESS_TOKEN` | **Required for server-side conversions.** System-user token from Events Manager → Settings. Without it `/api/meta-capi` returns `200 {skipped:true}` and every server event is silently dropped — DevTools still shows green, and you only find out by opening Events Manager. Verify with `GET /api/meta-capi` → `configured: true` |
| `META_PIXEL_ID` | Meta Pixel / dataset ID used server-side (defaults to the Milktree pixel) |
| `CAL_WEBHOOK_SECRET` | **Required for the booking webhook.** Signing secret from Cal.com → Settings → Developer → Webhooks. `/api/cal-webhook` rejects everything with 503 until this is set |
| `META_TEST_EVENT_CODE` | Optional — routes server events to Events Manager → Test Events for QA. Leave unset in production |
| `META_GRAPH_API_VERSION` | Optional — override the Graph API version without a redeploy when one sunsets (default `v21.0`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Browser Pixel ID |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID |

| `GHL_LEAD_WEBHOOK_URL` | Optional — GHL inbound webhook for `/start` qualification submissions (falls back to `GHL_CONTACT_WEBHOOK_URL`, then the newsletter URL). Route on the `start-form` / `start-qualified` tags |
| `SLACK_WEBHOOK_URL` | Also used for CAPI failure alerts — without it an expired Meta token fails silently until someone opens Events Manager |

### Ad destination URLs

Attribution captures Meta's ad-level parameters, but they only exist if the ad's
destination URL carries the macros. Append this to every ad URL, or `ad_id` and
friends stay empty and you can only attribute to campaign level:

```
?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_id={{campaign.id}}
&ad_id={{ad.id}}&adset_id={{adset.id}}&campaign_id={{campaign.id}}
&ad_name={{ad.name}}&adset_name={{adset.name}}&placement={{placement}}
&site_source_name={{site_source_name}}
```

First-touch attribution expires after **90 days** — longer than Meta's 28-day
click window, so it never truncates a real path, but old campaigns stop stealing
credit from new ones.

> **Environment gating.** Pixel, GA4, Clarity and the CAPI forwarder are all live **only** when `VERCEL_ENV === "production"`. `VERCEL_ENV` is undefined locally, so `npm run dev` and every preview deployment are inert by design — the `NEXT_PUBLIC_*` fallbacks in `components/analytics/tracking-scripts.tsx` are the real production IDs, so without this gate test traffic would land in the dataset the campaign optimises on.

All integrations degrade gracefully when unset: without Supabase the funnel still works (leads logged to the server console only); without Apify/Firecrawl the quiz falls back to self-assessment-only scoring.

## Brand Score document pipeline

Every completed Brand Score quiz can be turned into a branded PDF (11 A4 pages, 10 when we can't read the lead's site), custom to the lead's business and industry, and delivered automatically through GHL. The pieces:

- **Content engine** — `lib/brand-score-doc.ts`: 14 sector playbooks, 6 category insights and the 90-day roadmap, merged with the lead's real quiz answers, score and live competitor benchmark. No AI dependency.
- **Identity sheet (page 3)** — a one-page read-out of the lead's *own* brand, assembled from the live Firecrawl scrape of their site: logo on their own background, palette with roles, typefaces, their type scale shown to proportion, and their primary button rendered exactly as they style it. `identityNotes()` then adds up to three observations, each derived from a measured value (competing accent colours, flat headline hierarchy, mismatched corner radii, mid-grey body copy). This page only renders when `benchmark.userBrand` exists, so page numbers are computed from the composed list, never hard-coded.
- **Review page** — `/brand-score-doc/{sessionId}?k=<DOC_REVIEW_KEY>`: renders the A4 pages ready for print. `/brand-score-doc/preview` shows sample data. `noindex`, 404s without the key in production.
- **Design review** — `SESSION=<uuid> KEY=<DOC_REVIEW_KEY> node scripts/capture-doc.mjs` screenshots every page to `.screenshots/doc/` (add `PAGES=3,4` to narrow it).
- **Headless PDF** — `SESSION=<uuid> KEY=<DOC_REVIEW_KEY> node scripts/render-doc-pdf.mjs` writes the same PDF the print dialog would, so the operator loop can be tested (or later automated) without a browser.
- **Publish API** — `POST /api/doc/publish`: uploads the PDF to the public `brand-score-docs` Supabase Storage bucket at `{sessionId}.pdf`, stamps `quiz_sessions.doc_url`, gets the document link to the lead (see below), and fires the optional GHL doc-ready webhook for record-keeping.
- **Lead-facing link** — `/brand-score-doc/{sessionId}/download` (no key; the session id is the secret). Redirects to the published PDF, and shows an on-brand "being finalised" holding page before then. Emails link here rather than to storage directly, so the report email can carry the document CTA before the PDF exists, and re-hosting the PDF never breaks a link already sitting in an inbox.

### One email per lead

The lead's Brand Score email (`composeReportEmail` in `lib/server/quiz-report.ts`) is composed at quiz completion, carries the document CTA, and is scheduled 45 minutes out via Resend — `quiz_sessions.report_email_id` keeps the send id. Publishing the PDF then does one of two things:

- **Inside the 45 minutes** (the normal case): cancels the queued send and sends that same email immediately, now that the link resolves. The lead gets **one** email with their score and their document. Cancel-and-send rather than reschedule — a scheduled time seconds away can elapse before Resend processes the change, which fails the send.
- **After it has already gone out**: sends the short `brandScoreDocEmail` follow-up instead. This is the *only* case where a lead gets two emails, and it exists so a late document still reaches them.

If the cancel itself fails, publishing sends nothing: the queued email is already carrying a link that now works, which beats risking a duplicate. The toolbar states which of these happened after every publish.

### The 3-hour operator loop

1. Lead completes the quiz → Formspree record + GHL webhook both carry the **internal review link**. Their score email is queued for 45 minutes later, so publishing inside that window keeps it to a single email.
2. Open the link, sanity-check the pages (everything is pre-filled from their data).
3. Toolbar button 1 — **Save as PDF** (the print dialog; destination "Save as PDF", margins "None", background graphics on).
4. Toolbar button 2 — **Publish PDF**: drop the file you just saved. Storage upload and the lead's email happen automatically; the toolbar says exactly which email went and why.

### GHL setup (one-off)

**Workflow — "Brand Score completed"** (trigger: Inbound Webhook → copy the URL into `GHL_BRANDSCORE_WEBHOOK_URL`). Payload includes `type`, `name`, `email`, `company`, `sector`, `region`, `market_leader`, `score`, `review_link`.

1. Create/Update Contact (map name, email, company).
2. Add tag `brand-score`.
3. Internal notification (email/SMS/Slack) with `{{inboundWebhookRequest.review_link}}` — this starts your 3-hour clock.

The doc-ready event (`type: brand-score-doc-ready`, includes `pdf_url` and `email_sent`) goes to `GHL_BRANDSCORE_DOC_WEBHOOK_URL`. The lead's email is already handled by the site via Resend, so in GHL this event is just for record-keeping — **don't add an email step here or the lead gets a duplicate**: if both env vars point at the same webhook, add an If/Else on `type` and, in the doc-ready branch, save `{{inboundWebhookRequest.pdf_url}}` to a custom field (e.g. `brand_score_pdf_url`) for future campaigns.

### Production env checklist

`SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `RESEND_API_KEY` · `RESEND_FROM` · `DOC_REVIEW_KEY` · `GHL_BRANDSCORE_WEBHOOK_URL` · `META_CAPI_ACCESS_TOKEN` · `META_PIXEL_ID` · `CAL_WEBHOOK_SECRET` · `NEXT_PUBLIC_META_PIXEL_ID` · `NEXT_PUBLIC_GA_ID` · `NEXT_PUBLIC_CLARITY_ID` · (`GHL_BRANDSCORE_DOC_WEBHOOK_URL` optional · `APIFY_API_TOKEN` + `FIRECRAWL_API_KEY` for the live market benchmark)

**Email will not send until a domain is verified in Resend.** Add the sending domain (a subdomain such as `updates.milktreeagency.com` is the usual choice), publish the DNS records Resend gives you, wait for status `verified`, then set `RESEND_FROM` to an address on it. Until then every quiz report and document delivery fails with "domain is not verified" — the lead gets nothing.

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
- Dark theme only. Yellow (`#FFEE02`) is used sparingly — one accent per viewport.
- Keyboard accessible, yellow focus rings, ≥44px targets, statically prerendered for fast LCP.
