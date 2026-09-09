# PRD: Milktree studio site relaunch

**Owner:** Levi (Milktree)
**Version:** 1.0, 9 September 2026
**Inputs:** `MILKTREE-STUDIO.md` (offer, site map, page specs), `marketing/growth-strategy-research.md` (evidence), `CLAUDE.md` (design system, motion, quality bar)
**Status:** Approved direction. Phase 1 ready to start on sign-off.

---

## 1. Problem

Milktree has seven years of work, 200+ brands and a following, and is not winning new clients. The site is a single-page subscription landing page aimed at a buyer Milktree has no proof for. Every channel tested in 2026 (5,000 cold emails, ~£1,600 of Meta ads, 28 inbound leads) produced zero clients. Attention metrics were fine; conversion after the click was near zero. The offer and the audience are mismatched, and the site has no substance for a buyer who wants to look around before committing.

## 2. Goal

Relaunch milktreeagency.com as a multi-page studio site that sells three fixed-price ways to work with Milktree (sprint, brand build, subscription) to owner-led UK businesses, and turns the existing traffic and following into a pipeline.

## 3. Success metrics

| Metric | Baseline (2026 to date) | Target at 90 days post phase 1 |
|---|---|---|
| Sprints booked | 0 | 10 |
| Brand builds sold | 0 | 3 to 4 |
| Subscriptions started | 0 | 1 to 2 |
| Cold email reply rate | 0.1% | ≥1% by day 30, ≥2% by day 60 |
| `/sprint` lead-form completion (Meta traffic) | ~0.9% (old LP) | ≥5% |
| Cost per sprint enquiry (Meta) | n/a | ≤£60 |
| Lighthouse performance, mobile, home and `/sprint` | current score (record before phase 1) | ≥ current, and ≥90 |
| Lighthouse accessibility | current | 100 |
| LCP, mobile | current | <2.5s |

## 4. Non-goals

- No change to the design system, typography, colour, motion language or component library. This is a content, structure and product relaunch on the existing system.
- No light mode.
- No CMS in phases 1 and 2. Content stays in typed data files (`lib/*.ts`).
- No new animation libraries. Framer Motion and Lenis only.
- No self-serve checkout until phase 3.
- No team page with names or headshots.

## 5. Users

**Primary:** owner or founder of a UK business, 5 to 50 staff, consumer-facing or local-service, whose brand has fallen behind the business. Arrives from an ad, a cold email, a referral or Instagram. Wants to see work that looks like their sector, know what it costs, and talk to a person.

**Secondary:** the single marketer inside that business, who will run the subscription after a build.

**Internal:** Levi and the core team, who need every product to have a page they can send in a reply instead of a PDF.

## 6. Scope by phase

Each phase is independently shippable. A phase is done when every acceptance criterion passes, the quality gate (§8) passes, and Levi has reviewed it on a preview deployment.

### Phase 1: Front door

**Purpose:** every product has a page, a price and a button, and outreach can restart.

| # | Deliverable | Acceptance criteria |
|---|---|---|
| 1.1 | Offer data model in `lib/site.ts` (or new `lib/offer.ts`): five products, prices, scope, durations, step-up rules, FAQ per product | Single source of truth; no price hard-coded in a component |
| 1.2 | `/sprint` | Matches spec §6.4. One yellow CTA. One Meta `Lead` event on submit. Passes quality gate |
| 1.3 | `/brand-build` | Matches spec §6.5. Both tiers. Three case studies embedded |
| 1.4 | `/subscription` | Matches spec §6.6. Two plans, no founding rate, no "brand builds happen here" copy anywhere |
| 1.5 | `/pricing` | All five products in one comparison. Credit rule explained |
| 1.6 | Home hero and "three ways to work with us" section | New H1 and sub per spec §6.1. Old sections that contradict the offer (New way, What's included, old Plans) removed or replaced |
| 1.7 | `/start` form and routing | Steps per spec §6.10. Server-side routing by product. Budget question removed. No route rejects a lead. `product` and `timing` columns added to `website_leads`. Notifications carry the product |
| 1.8 | Navigation and footer | Per spec §5. Dropdowns via existing NavigationMenu. Mobile Sheet |
| 1.9 | Redirects | `/hire-calculator`, `/brand-audit`, `/lp/creative-department`, `/concept-2`, `/concept-3`, `/ads` per spec §4. No 404s from old ad or email links |
| 1.10 | Copy sweep | No instance of "creative department on demand", "unlimited requests" as a headline, "6 years", "freelancers", "founding rate", or "Get started" as the primary CTA. Proof line reads `200+ brands built · 7 years · 15+ industries · 50+ designers in the network` |
| 1.11 | SEO | Titles, descriptions, OG images and JSON-LD for every new page. Sitemap updated |
| 1.12 | Lighthouse baseline recorded before work starts, and re-run on completion | Numbers in the PR description |

### Phase 2: Substance

**Purpose:** the site has enough depth that a visitor can find work like theirs in two clicks and understand who they'd be working with.

| # | Deliverable | Acceptance criteria |
|---|---|---|
| 2.1 | `/services` overview and five service pages | Per spec §6.3. Each with three pieces of work and the product it's bought through |
| 2.2 | `WorkProject` gains `sector` and `services[]`; `/work` gets filter chips | All 16 projects tagged. Filters are URL-addressable (`/work?sector=hospitality`) |
| 2.3 | `/for/[audience]` template and six entries | Per spec §6.8. Each entry has at least two case studies. Any audience with fewer than two is not published |
| 2.4 | `/about` | Per spec §6.9. Founder-led. Core team of three seniors plus network of 50+, stated without names or headshots |
| 2.5 | `/how-it-works` | The three ways, step by step, with what happens after each |
| 2.6 | Home sections 3, 5, 7 (symptoms, why Milktree, about band) | Per spec §6.1. Home is eight sections total |
| 2.7 | Case study template | "Bought as" tag and "Start something like this" CTA pre-selecting the product |

### Phase 3: Depth

**Purpose:** the site compounds. Content, proof and self-serve.

| # | Deliverable | Acceptance criteria |
|---|---|---|
| 3.1 | `/insights` index and article template, three launch articles (one per product) | Typed data, no CMS |
| 3.2 | Before-and-after component for sprints | Used on `/sprint` and case studies once two real sprints exist |
| 3.3 | Stripe Checkout for the sprint | Pay from `/sprint` without a call. Webhook creates the lead and notifies |
| 3.4 | Referral page | Standing referral offer, form, tracking field on leads |

## 7. Content dependencies (Levi)

Phase 1 can be built with placeholders for these, but cannot ship without them:

- Founder photograph for `/about` (phase 2) and the home about band.
- Confirmation of the exact scope lines for Sprint, Brand Build and Brand Build Plus (spec §2 is the proposal).
- The three case studies to feature on `/brand-build`.
- Confirmation that the three senior designers are described as "core team of three senior designers" and nothing more specific.
- Sector tag for each of the 16 case studies (proposed mapping will be supplied for approval in phase 2).

## 8. Quality gate (every phase, every page)

The bar is "up a level from today", not "no worse". A page fails the gate if any item fails.

**Design and motion**
- Follows `CLAUDE.md` §3 to §5 exactly: tokens, Satoshi scale, pill buttons, 36px radius, expo-out easing, reveal-once, stagger, transform and opacity only.
- One yellow element per viewport.
- Every new section uses the existing `Reveal` and `StaggerGroup` primitives. No bespoke animation code in page files.
- `prefers-reduced-motion` produces a fully usable static page.
- Reviewed at 375, 768, 1024, 1440 and 1920 wide. Nothing cropped, nothing overflowing, no horizontal scroll.
- Screenshot set attached to the PR for every new page (existing `scripts/capture-page.mjs`).

**Performance and accessibility**
- Lighthouse mobile: performance ≥90 and not below the phase-1 baseline; accessibility 100; best practices ≥95; SEO 100.
- LCP <2.5s on mobile for home and `/sprint`. Hero media lazy-initialised with poster.
- Every image through `next/image` with explicit sizes. Every video muted, playsInline, poster, `preload="none"` below the fold.
- Keyboard: every interactive element reachable and visibly focused (yellow ring). Landmarks and heading order correct. All targets ≥44px.
- No console errors or hydration warnings.

**Code**
- `npm run lint` and `npm run build` clean.
- No new dependencies without a line in the PR explaining why.
- Copy lives in data files, not JSX, so it can be changed without touching components.
- Each phase is one PR against `main` from `claude/low-ticket-offer-strategy-4v9kix` (or a phase branch off it), with the Lighthouse numbers and screenshots in the description.

**Content**
- Voice per spec §3. No hype, no exclamation marks, no emoji.
- Only real testimonials and real numbers. Nothing invented.
- Every price appears with "+VAT" on first mention per page.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Quality drops under the volume of new pages | Quality gate is per page, not per phase. A page that fails does not ship; the phase ships without it |
| Sprint at £799 is unprofitable if scope creeps | Scope is one deliverable, one revision round, fixed in the data file and on the page. Anything more is a Brand Build |
| Design Lead promise breaks when a network designer leaves | Design Lead accounts led by the core senior team first; network leads only under minimum-term agreements |
| Old links from ads and emails 404 | Redirect map in phase 1, verified with a link check before ship |
| Copy drifts back to the subscription-only story | `CLAUDE.md` and README now point at `MILKTREE-STUDIO.md`; phase 1.10 sweeps for the banned phrases |
| Prices quoted from secondary sources in the research are wrong | Research doc marks verification level; nothing from it is quoted on the public site |

## 10. Open decisions

None blocking phase 1. Confirmed so far: prices (£799 / £3,499 / £5,999 / £1,499 / £2,499), no founding rate, "About" not "Studio", no team grid, "network" not "freelancers", seven years.

## 11. Sequence for phase 1

1. Record Lighthouse baseline (home, `/work`, `/start`).
2. Offer data model.
3. `/pricing` (proves the data model and the comparison component).
4. `/sprint`, `/brand-build`, `/subscription` (share a product-page layout).
5. `/start` steps, routing, database columns, notifications.
6. Home hero and three-ways section; remove contradicting sections.
7. Navigation, footer, redirects.
8. Copy sweep, SEO, sitemap.
9. Screenshots, Lighthouse re-run, PR.
