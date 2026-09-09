# MILKTREE-STUDIO.md — Offer, site map and funnel spec

> **Authoritative.** This file replaces the (never committed) `MILKTREE-LANDING.md` and supersedes the offer and funnel sections of `CLAUDE.md`. Design system, motion rules and the quality bar in `CLAUDE.md` remain in force. The reasoning and evidence behind every decision here is in `marketing/growth-strategy-research.md`. Read that before arguing with this.

**Version:** 1.0, 9 September 2026
**Direction:** Milktree is a **design studio** that sells brand work three ways: a fixed-price sprint, a fixed-price brand build, and an ongoing subscription. The subscription is the back end of the relationship, not the front door.

---

## 1. Who we sell to

**Primary buyer:** the owner or founder of a UK business with roughly 5 to 50 staff, consumer-facing or local-service, whose brand has fallen behind the business. Hospitality, property and finance, automotive, retail, health and aesthetics, trades. This is who the portfolio proves we serve (EazyPhone, Mint Mortgages, Melt, Latimers, FlexiBuy, AllTrad, Powerforce).

**Secondary buyer:** the one-person marketing team inside that business, who inherits the subscription after a build.

**Not the buyer:** heads of marketing at 100-person companies with in-house design volume. We have no proof for them. Do not write copy for them.

**The buyer's problem, in their words:** "Our brand looks unclear." "The homepage can't explain what we do." "The deck doesn't match the website." "It looks like ten different people made it." These four lines produced every lead in the 2026 ad account. Use them.

---

## 2. The offer ladder

All prices exclude VAT. All fixed. No proposals, no quotes, no hourly billing anywhere on the site.

| Rung | Product | Price | Duration | Scope | Step-up rule |
|---|---|---|---|---|---|
| 1 | **Brand Reset Sprint** | **£799** one-off | 2 weeks | One thing fixed properly. Choose one: homepage design, pitch deck, or core identity tightened (logo lock-up, colour, type, three key applications). One revision round. Creative director on it. | Fee credited in full against a Brand Build or first subscription month if booked within 30 days of delivery. |
| 2 | **Brand Build** | **£3,499** fixed | 4 to 6 weeks | Identity from strategy to guidelines: positioning workshop, logo system, colour, type, brand guidelines, five core applications. Two revision rounds. Named senior designer, creative director. | Every build ends with a subscription offer. |
| 2+ | **Brand Build Plus** | **£5,999** fixed | 6 to 8 weeks | Everything in Brand Build, plus a campaign toolkit: ad set, social templates, print and outdoor (signage, packaging or OOH as relevant), launch assets. | As above. |
| 3 | **Essentials** subscription | **£1,499** / month | Rolling, pause or cancel any month | Unlimited requests, one active at a time, ~48h turnaround on standard requests. Vetted designer from the bench per request, every piece checked by a creative director. | |
| 3+ | **Design Lead** subscription | **£2,499** / month | Rolling, pause or cancel any month | Unlimited requests, two active at a time. **A named senior designer, the same person every time, direct on your Slack.** Creative direction on everything. | Founding rate: first 10 Design Lead clients lock **£1,999/month for life**. |

**Hard rules:**

- Subscriptions are for ongoing work. **Full brand builds are a product, not something that "happens on" a subscription.** Never say otherwise. If a subscriber needs a full rebrand, they buy a Brand Build.
- "Senior" is reserved for Design Lead and for the Brand Build's named designer in per-product copy. Essentials copy says "vetted designer, checked by a creative director."
- Design Lead capacity: one senior designer serves no more than three Design Lead clients. Do not sell past that.
- Value anchor for subscriptions: a UK design lead costs £65k+ a year before National Insurance, holiday cover and recruitment. Design Lead is £30k a year, senior across every discipline, cancel any month.
- "Need more? Let's talk" remains the only unpublished tier.

---

## 3. Positioning and voice

**Line:** *Brands you can see on the high street.*

**Why:** UK design subscriptions (Hatchly, Studiovine, Design Shake) sell digital assets: social, ads, decks, flyers. Milktree builds whole brands for real businesses and takes them all the way to signage, packaging, vehicles and billboards. That is the visible difference and the portfolio proves it. Lead with it everywhere.

**Proof line:** `200+ brands built · 6 years · 15+ industries · 50+ experienced designers`. Never claim the subscription itself has been running for years.

**Voice:** confident, premium, plain. Short lines. No hype, no exclamation marks, no emoji. Lead with the buyer's problem and our proof, never our features. Say "you" more than "we".

**Yellow rule stands:** one yellow element per viewport. On every page it marks the primary CTA.

---

## 4. Site map

A studio site, not a landing page. Every page has one job and one primary CTA.

```
/                         Home
/work                     Work index, filterable by sector and by service
/work/[slug]              Case study (exists, 16 live)
/services                 Services overview
/services/brand-identity  Brand identity and guidelines
/services/campaigns       Campaigns, ads and social
/services/web             Web and landing page design
/services/print           Print, packaging, signage and outdoor
/services/decks           Pitch decks and sales collateral
/sprint                   Brand Reset Sprint (£799)
/brand-build              Brand Build and Brand Build Plus
/subscription             Essentials and Design Lead
/pricing                  All five products on one page, side by side
/for/[audience]           Who it's for: hospitality · property-and-finance · automotive · retail · health-and-aesthetics · trades
/how-it-works             The three ways to work with us, step by step
/studio                   About: six years, 200 brands, the team, the creative director, how we work
/insights                 Journal (exists as concept; build the index and article template)
/insights/[slug]          Article
/start                    Start a project: form routes by need to sprint, build or subscription
/book                     Intro call booking (exists)
/contact                  Contact (exists)
/brand-report             Free Brand Score quiz (exists; becomes a lead magnet, not a reject bin)
/careers                  Exists, keep
/privacy /terms /login    Exist, keep
```

**Retire or fold in** (redirect to the nearest new page): `/hire-calculator` → `/subscription`; `/brand-audit` → `/brand-report`; `/lp/creative-department` → `/sprint`; `/concept-2`, `/concept-3`, `/ads` → remove; `/subscribe` → keep only if the nurture list is actually used, otherwise fold into the footer.

---

## 5. Navigation

**Header (sticky, blur on scroll):**

`Work` · `Services ▾` · `Pricing ▾` · `Who it's for ▾` · `Studio` · **[Start a project]** (yellow pill) · `Client login`

- Services dropdown: the five service pages plus "All services".
- Pricing dropdown: Sprint £799 · Brand Build from £3,499 · Subscription from £1,499 · "Compare all".
- Who it's for dropdown: the six audience pages.
- Mobile: full-screen Sheet, grouped the same way, staggered reveal.

**Primary CTA everywhere:** "Start a project" → `/start`. Secondary CTAs are product-specific ("Book a sprint", "See the build", "Compare plans").

**Footer:** Services column · Products column (Sprint, Brand Build, Subscription, Pricing) · Work column (five featured plus "All work") · Studio column (Studio, Insights, Careers, Contact) · Start column (Start a project, Free Brand Score, Client login). Big wordmark, socials, legal.

---

## 6. Page specs

Each page: hero (H1 + one line + primary CTA), then the sections listed, then a final CTA band. Reveal primitive on every section. Reuse existing components wherever the section already exists.

### 6.1 Home

Eight sections, down from fourteen.

1. **Hero.** Video reel behind. H1: **"Your business has grown. Your brand hasn't caught up."** Sub: "Milktree is a UK design studio that builds brands you can see on the high street. Fix one thing in two weeks, rebuild the lot in six, or keep us on retainer. Fixed prices, no proposals." CTA: **Start a project**. Secondary: **See the work**. Trust line: `200+ brands built · 6 years · Fixed prices · No contracts`.
2. **Work strip.** Six featured case studies, large, before proof and before pricing. Link to `/work`.
3. **The symptoms.** H2: "Sound familiar?" Four cards using the buyer's own lines (§1). Each links to the relevant service or the sprint.
4. **Three ways to work with us.** Sprint · Brand Build · Subscription. Price, duration, one line, one link each. This replaces "What's included", "New way" and "How it works".
5. **Why Milktree.** Comparison: Freelancer · Subscription-only studio · Milktree. Rows: full brand builds, print and outdoor, creative director on every piece, fixed prices, pause anytime. Milktree column highlighted.
6. **Proof.** Testimonials (real ones only) and the count-up stats bar.
7. **Studio.** One band: who we are, the creative director, link to `/studio`.
8. **Final CTA.** "Let's fix the thing that's been bothering you." → Start a project.

Keep FAQ as an accordion inside section 4 or 8, not a standalone section. Keep the Instagram grid only if it loads fast; otherwise move it to `/studio`.

### 6.2 Work (`/work`)

Filter chips: by sector (six audiences) and by service (five services). Each `WorkProject` gets `sector` and `services[]` fields. Cards lift on hover, video loop where available. Case study template gains a "Bought as: Brand Build" style tag and a "Start something like this" CTA that pre-selects the product in `/start`.

### 6.3 Services (`/services` and five sub-pages)

Overview: five tiles, each with two pieces of work. Each sub-page: H1 in the buyer's language ("A brand people recognise before they read the name"), what it includes, three pieces of work, which product it's bought through (sprint, build, subscription), FAQ, CTA.

### 6.4 Sprint (`/sprint`)

The page every ad and cold email lands on. One product, one price, one button.

Hero: **"Fix the one thing that's been bothering you. Two weeks. £799."** Then: choose your sprint (homepage · deck · identity tighten-up), what you get, how the two weeks run (day 1 brief, day 5 first look, day 10 final), before-and-afters once available, the credit rule, FAQ (what if I need more, what if I don't like it, do I own the files), CTA **Book a sprint** → `/start?product=sprint`.

Single conversion event on this page for Meta: `Lead` on form submit. Nothing else fires.

### 6.5 Brand Build (`/brand-build`)

Both tiers side by side. Process in six weeks (workshop, direction, design, applications, guidelines, launch). Three full case studies. The named-designer promise. What happens after (subscription offer). FAQ. CTA **Start a brand build** → `/start?product=build`.

### 6.6 Subscription (`/subscription`)

Two plans. Framed as "keep it alive": most subscribers come to us after a build. What a month looks like, request examples, turnaround, the queue, pause rules. The £65k anchor. Founding rate on Design Lead. FAQ (senior vs vetted, who I'll work with, what's not included: full rebrands). CTA **Start a subscription** → `/start?product=subscription`.

### 6.7 Pricing (`/pricing`)

All five products in one table, one row per feature. Toggle between one-off and monthly. The credit rule explained. FAQ. CTA per column.

### 6.8 Who it's for (`/for/[audience]`)

One template, six data entries. Hero in that sector's language, the sector's symptoms, two or three case studies from that sector, the recommended starting product, CTA. This is what makes the site feel "for me" rather than generic.

### 6.9 Studio (`/studio`)

The people. Founder and creative director with photos, six years, 200 brands, the bench of 50+ designers explained honestly (who does what on each product), how a request moves through the studio, values in one line each, Instagram grid, careers link.

### 6.10 Start (`/start`)

Multistep form, existing component, revised steps:

1. What do you need? → Fix one thing (sprint) · Build or rebuild a brand (build) · Ongoing design support (subscription) · Not sure
2. Tell us about the business → sector (six options + other), team size
3. When do you want to start? → This month · Next month · Just looking
4. Details → company, website, name, email, phone (optional), consent

**Routing (server-side only, `lib/server/qualification.ts`):**

- Every submission is a lead. Nothing is "unqualified".
- `sprint` → confirmation + Cal booking for a 15-minute sprint call, or direct payment link once Stripe exists.
- `build` and `subscription` → confirmation + Cal booking for a 30-minute call.
- `not-sure` and `just-looking` → confirmation + Brand Score quiz as the next step, plus a follow-up email in 3 days.
- Budget question removed. Price is on the page; the product choice is the qualification.

Notifications, Supabase insert, GHL and Slack hooks stay. Add `product` and `timing` fields to `website_leads`.

---

## 7. Channels and measurement (summary; detail in the research doc)

- **Past clients:** reactivation email rewritten around the sprint, with a referral ask. Standing referral reward: one free sprint or one month's credit for any introduction that becomes a build.
- **Partners:** accountants, web developers, printers, photographers serving the same businesses. Target five.
- **Cold email:** 400/day, portfolio sectors only, real observation in email one, sprint as the ask, no pricing by email. Floor: 1% reply by day 30.
- **Meta:** £30/day, "your brand looks unclear" hook, `/sprint` only, one event.
- **Social:** one public brand teardown a week; every sprint becomes a before-and-after.
- **90-day targets:** 10 sprints, 3 to 4 builds, 1 to 2 subscriptions.

---

## 8. Build phases

| Phase | Scope | Ships when |
|---|---|---|
| **1. Front door** | `lib/site.ts` offer data, `/pricing`, `/sprint`, `/brand-build`, `/subscription`, home sections 1 and 4, `/start` routing, nav and footer, redirects for retired pages, `CLAUDE.md` and README pointers | First |
| **2. Substance** | `/services` and five sub-pages, `/for/[audience]` template and six entries, `/work` filters and data fields, `/studio`, `/how-it-works`, remaining home sections | Second |
| **3. Depth** | `/insights` index and article template, three launch articles (one per product), before-and-after component for sprints, Stripe payment for the sprint | Third |

Every phase ships on the same design system with the same motion and the same quality bar. No phase ships a page that would embarrass the portfolio.

---

## 9. Definition of done for the relaunch

- Every product has a page, a price and a button.
- Every page has one yellow element and one primary CTA.
- A hospitality owner, a mortgage broker and a roofer can each find work that looks like theirs within two clicks.
- No copy anywhere says "creative department on demand", "unlimited requests" as a headline, or "brand builds happen on Design Lead".
- `/start` never rejects anyone.
- Meta fires exactly one lead event, from `/sprint` and `/start`.
- Lighthouse performance and accessibility stay where they are today or better. LCP under 2.5s on mobile.
