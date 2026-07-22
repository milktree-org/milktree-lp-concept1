# CLAUDE.md — Milktree Website

> Build spec for an AI coding agent (Claude Code / Cursor). Read this fully before scaffolding. The goal is a **premium, motion-rich marketing site for Milktree** that is measurably more refined than our reference, [legora.com](https://legora.com). This site IS Milktree's best portfolio piece — treat every detail as if a creative director will judge it pixel by pixel.

> **OFFER & FUNNEL UPDATE (supersedes anything below that conflicts):** Milktree now sells a **productised design subscription** — Essentials £1,999/mo and Design Lead £3,999/mo (+VAT), founding rate £3,500/mo for the first 10 Design Lead clients. Essentials is worked by **vetted designers from the bench, quality-checked by a creative director** — never call the Essentials designer "senior." Design Lead's headline upgrade is a **named, dedicated senior designer** (the same person every time) reachable **direct on Slack** — a relationship, not just a faster queue. "Senior" is reserved for Design Lead only in per-plan copy (feature bullets, plan FAQ, plan emails); it's fine as a general brand-level claim elsewhere (hero, footer, meta). There is **no project pricing** and **no brand-audit CTA**. The single primary CTA is **"Get started"** → the multistep qualification form at `/start`; unqualified leads route to the Brand Ranking Quiz at `/brand-report`. See `MILKTREE-LANDING.md` for the authoritative offer, copy, qualification and funnel spec. Design system, motion rules and quality bar below remain in force.

---

## 1. What we're building

**Milktree** is an embedded brand & design partner — "your creative department, on demand." A senior team that plugs into scaling companies and delivers brand and design on a flat monthly subscription. The subscription offer is new, but Milktree has operated as an agency for 6 years — 200+ brands built, with access to 50+ experienced designers. Never claim the subscription itself has been running for years. UK-based.

This is the **marketing website**: a homepage plus supporting pages, built to convert cold ad/outreach traffic into qualified subscription leads (multistep form at `/start`; Brand Ranking Quiz at `/brand-report` for unqualified leads). The bar is a Framer-class site (Legora) but better — buttery 60fps motion, distinctive type-led design, zero generic-SaaS feel.

> Note: Milktree has a sister brand, **Riftly** (green/mint, separate site). This repo is **Milktree only** — black & yellow. Do not mix the two brands.

---

## 2. Tech stack (use exactly this)

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **shadcn/ui** for component primitives (Button, Card, Accordion, Carousel, NavigationMenu, Sheet, Dialog, Tabs)
- **Framer Motion** (`framer-motion`) for all animation
- **Lenis** (`lenis`) for smooth scroll — this is the backbone of the premium feel
- **Embla** (ships with shadcn Carousel) for portfolio carousels
- **lucide-react** for icons
- `next/font/local` for the Satoshi typeface (see §4)

Do **not** add: GSAP, ScrollMagic, AOS, or any other animation lib. Framer Motion + Lenis covers everything. Keep the dependency list tight.

### Setup
```bash
npx create-next-app@latest milktree --typescript --tailwind --app --eslint
cd milktree
npx shadcn@latest init        # base color: neutral; CSS variables: yes
npm i framer-motion lenis
npx shadcn@latest add button card accordion carousel navigation-menu sheet dialog tabs
```

---

## 3. Design system — brand tokens

Milktree is **confident, premium, type-led**. True black canvas, one electric yellow accent, heavy rounded geometry. Restraint is the brand — lots of negative space, big type, one accent colour used sparingly.

Define these as CSS variables in `globals.css` and map them in Tailwind:

```css
:root {
  --background: #000000;      /* true black canvas */
  --surface:    #0B0B0A;      /* raised sections */
  --card:       #141200;      /* cards (warm near-black) */
  --foreground: #FFFFFF;
  --muted:      rgba(255,255,255,0.60);
  --muted-2:    rgba(255,255,255,0.40);
  --accent:     #FFEE02;      /* THE yellow — use sparingly */
  --accent-ink: #000000;      /* text on yellow */
  --border:     rgba(255,255,255,0.12);
  --radius:     2.25rem;      /* 36px base — Milktree is heavily rounded */
  --radius-pill: 9999px;      /* buttons are full pills */
}
```

**Rules of the brand:**
- Yellow is a scalpel, not a paintbrush. One yellow element per viewport, max. It marks the single most important thing on screen (primary CTA, one keyword, one stat).
- Buttons are **full pills** (`--radius-pill`). Cards use the large 36px radius.
- Generous spacing. Base unit 4px; sections breathe with `py-24` to `py-40`.
- Never use pure greys for text — use the white-alpha `--muted` tokens so everything sits on black correctly.
- Dark theme only. No light mode.

---

## 4. Typography — Satoshi

Headings and body are both **Satoshi** (Milktree's real typeface). It's free from [Fontshare](https://www.fontshare.com/fonts/satoshi) — download the woff2 files and load locally:

```ts
// app/fonts.ts
import localFont from "next/font/local";
export const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Regular.woff2", weight: "400" },
    { path: "../public/fonts/Satoshi-Medium.woff2",  weight: "500" },
    { path: "../public/fonts/Satoshi-Bold.woff2",     weight: "700" },
    { path: "../public/fonts/Satoshi-Black.woff2",    weight: "900" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
```

**Type scale (fluid, use `clamp`):**
- Display / hero `h1`: `clamp(3rem, 9vw, 8rem)`, weight 900, letter-spacing `-0.03em`, line-height `0.95`
- Section `h2`: `clamp(2rem, 5vw, 3.75rem)`, weight 900, `-0.025em`
- `h3`: ~1.5rem, weight 700
- Body: 1.125–1.25rem, weight 500, line-height 1.6, colour `--muted`
- Eyebrow/labels: 0.8rem, weight 700, `letter-spacing: 0.18em`, uppercase, often with a short yellow tick before it

Headlines are tight and big. Don't be timid with size.

---

## 5. Motion system (the most important section)

The reference site (Legora) feels premium because its motion is **slow, eased, and restrained** — one purposeful move at a time, never bouncy or flashy. We match that discipline and exceed it with sharper micro-interactions. **"Alive, not animated."**

### 5.1 Global principles
- Default easing: a custom cubic-bezier, `[0.16, 1, 0.3, 1]` (expo-out). Use it everywhere.
- Default durations: 0.6–0.9s for reveals, 0.2–0.3s for hovers.
- Everything reveals **once** on scroll-in (`viewport={{ once: true, margin: "-10% 0px" }}`), never re-triggering.
- **Stagger** children (0.06–0.1s) so groups cascade rather than pop.
- Target a steady **60fps** — only animate `transform` and `opacity`. Never animate layout, width, height, top/left.
- **`prefers-reduced-motion` is mandatory** — when set, disable transforms/parallax and just fade or show instantly (see §5.8).

### 5.2 Smooth scroll (Lenis) — do this first
Wrap the app in a Lenis provider; this single thing carries most of the premium feel.
```tsx
// components/smooth-scroll.tsx — "use client"
import { ReactLenis } from "lenis/react";
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>{children}</ReactLenis>;
}
```

### 5.3 Reveal primitive (use for ~every section)
Build one reusable component and use it everywhere:
```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16,1,0.3,1], delay: i * 0.08 } }),
};
// <motion.div variants={fadeUp} initial="hidden" whileInView="show"
//   viewport={{ once: true, margin: "-10% 0px" }} />
```

### 5.4 Hero headline reveal
Split the headline into words/lines and stagger them up with a clip-mask (each line wrapped in `overflow-hidden`, child translates from `y: 100%`). This is the signature opening moment — make it crisp.

### 5.5 Parallax (scroll-linked)
For large portfolio images and hero media, drift with `useScroll` + `useTransform`:
```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
// <motion.img style={{ y }} />
```

### 5.6 Count-up stats
Numbers animate from 0 when in view (`useInView` + `animate(0 → value)`), e.g. "200+ brands", "[X]% retention". Mirror Legora's counters but sharper easing.

### 5.7 Signature interactions (this is how we beat Legora)
- **Magnetic primary CTA** — the pill button subtly pulls toward the cursor on hover (translate by a fraction of cursor offset), springs back on leave. Apply only to the main yellow CTA.
- **Custom cursor** (desktop only) — a small circle that scales up and inverts over interactive elements and portfolio items. Subtle, optional, behind a reduced-motion + pointer-fine check.
- **Portfolio hover** — cards lift slightly (`scale: 1.02`, soft shadow) and their video loop plays on hover, pauses on leave.
- **Auto-scroll logo marquee** — infinite horizontal loop, pauses on hover.
- **Sticky "way of working" section** — a pinned section where copy steps swap as you scroll through (Legora's aOS-style showcase, done cleaner with `useScroll` progress driving which panel is active).
- **Page transitions** — `AnimatePresence` route transitions: a quick yellow wipe or fade between pages.

### 5.8 Reduced motion
```tsx
const reduce = useReducedMotion();
// If reduce: skip Lenis smoothing, disable parallax/magnetic/cursor,
// set reveal variants to { opacity: 0 → 1 } only, no y, near-instant.
```

---

## 6. Site structure (routes)

```
/                     Homepage
/what-we-do           Services overview (+ optional sub-pages per service)
/work                 Portfolio grid ("Our work")
/work/[slug]          Case study detail
/why-milktree         How it works / approach / results
/plans                Pricing
/insights             Journal / resources index
/insights/[slug]      Article
/start                Multistep qualification form (primary CTA target)
/brand-report         Brand Ranking Quiz (unqualified redirect + lead magnet)
/book                 Intro call booking for qualified leads (Cal.com embed)
```

**Navigation (sticky, blur-on-scroll header):**
`What's included ▾` · `Our work` · `Why Milktree ▾` · `Plans` · `FAQ` · `[Get started]` (yellow pill) · `Client login`

- Header is transparent over the hero, then gains a blurred dark background once scrolled (`backdrop-blur`, animate in).
- Mobile: shadcn `Sheet` drawer, full-screen, staggered link reveal.
- Dropdowns: shadcn `NavigationMenu` with a soft animated panel.

---

## 7. Homepage spec (section by section)

Build in this order. Each section uses the reveal primitive; specific motion noted.

**1. Hero**
- Full-viewport. Looping muted background video (portfolio reel — see §9), dark overlay for legibility.
- H1: **"Your creative department. On demand."** (line-mask reveal, §5.4)
- Sub: "Milktree becomes your embedded brand & design team — unlimited requests, senior work back in 48 hours, for one flat monthly fee. No hiring. No freelancer roulette. No waiting weeks."
- Primary CTA (yellow pill, magnetic): **Get started →** (opens the multistep form at /start) · Secondary (ghost pill): **See plans**
- Trust line: `200+ brands built · 6 years as an agency · No contracts · Pause anytime`

**2. Trust bar** — "The team behind 200+ growing brands" + infinite logo marquee (§5.7).

**3. The problem** — H2: "Your marketing team has the ideas. Not the firepower to ship them." Three cards: Freelancers / Hiring / Agencies — each a pain. Stagger in.

**4. The new way** — large centered statement, the category reframe: "There's a better way to get design done. An embedded creative team you can switch on, scale and direct." One word in yellow.

**5. What's included** — H2: "One subscription. Every kind of design." 8-tile grid (Brand identity & guidelines · Social & templates · Ads (static + simple motion) · Decks & sales collateral · Email design · Landing page & web design · Packaging & print · Presentations & OOH). Footer line: "One request = one deliverable with one revision round included." Tiles lift on hover.

**6. How it works** — 3 steps (Choose your plan → Send your requests → Get senior work back in days). Connected with an animated yellow line that draws as you scroll.

**7. The way we work** — sticky/pinned showcase (§5.7): "Everything in one place." Show the managed-queue / living brand library concept. This is the Legora-aOS-equivalent moment — make it the visual centerpiece.

**8. Why Milktree** — comparison table, 3 columns (Freelancer / In-house hire / Milktree) across Cost, Reliability, Consistency, Speed, Risk. Milktree column highlighted; rows reveal in stagger.

**9. Proof** — "The work speaks for itself." Portfolio carousel (Embla) of case studies, each card a looping video; + 2–3 testimonials.

**10. Stats bar** — count-up: `200+ brands · 15+ industries · 6 years as an agency · 50+ experienced designers`.

**11. Plans** — "A whole creative department for less than one hire." Two pricing cards: **Essentials £1,999/mo** (unlimited requests, one at a time, vetted designers matched per request and quality-checked by a creative director, ~48h turnaround, pause anytime) and **Design Lead £3,999/mo** (highlighted — "Most teams choose Design Lead" — two at a time, your own dedicated senior designer as a permanent design lead, direct Slack access to them, creative direction, brand builds in 4–6 weeks). The dedicated design lead + Slack access is the headline jump from Essentials — it turns the relationship from a rotating bench into a named person on your team, always reachable. Founding banner on Design Lead: first 10 Design Lead clients lock £3,500/mo for life. All prices +VAT. Value anchor: a UK design lead costs £65k+/yr before NI, holiday cover and recruitment; Design Lead (the plan) is £48k/yr, senior across every discipline, cancel any month. CTA → /start.

**12. Insights teaser** (optional) — 3 latest journal cards.

**13. Final CTA** — full-bleed, mostly black with a yellow accent: "Your business has outgrown its brand. Let's fix that." → **Get started →**.

**Footer** — nav columns, big Milktree wordmark, socials.

---

## 8. Components to build

shadcn primitives: `Button` (extend with `pill` + `magnetic` variants), `Card`, `Accordion` (FAQ), `Carousel` (portfolio), `NavigationMenu`, `Sheet` (mobile nav), `Tabs`, `Dialog`.

Custom: `SmoothScroll`, `Reveal`, `StaggerGroup`, `LogoMarquee`, `CountUp`, `MagneticButton`, `CustomCursor`, `PortfolioCard` (hover-video), `StickyShowcase`, `PageTransition`, `Header` (blur-on-scroll), `Eyebrow` (tick + label).

Keep components small, typed, `"use client"` only where motion/state needs it. Sections in `components/sections/`, primitives in `components/ui/`.

---

## 9. Assets

- **Portfolio images & videos** live in `/public/work/`. Videos are short, muted, looping MP4s (generated externally from portfolio stills). Always `muted playsInline loop autoPlay`, `poster` set to the still, and `preload="none"` / lazy below the fold.
- **Hero video**: a 16:9 reel; provide a poster image for instant LCP, lazy-init the video.
- **Logos**: monochrome SVGs in `/public/logos/`.
- Use `next/image` for all stills (AVIF/WebP, sized, lazy). Never ship unoptimised images.

---

## 10. Copy (source of truth)

**Positioning:** "Your creative department. On demand." Embedded brand & design team on subscription.

**Offer / pricing (see MILKTREE-LANDING.md for the authoritative version):**
- Essentials — £1,999/mo (+VAT) — unlimited requests, one at a time, vetted designers matched from the bench per request and quality-checked by a creative director, ~48h turnaround, pause/cancel anytime
- Design Lead — £3,999/mo (+VAT) — unlimited requests, two at a time, your own dedicated senior designer (same person every time) as a permanent design lead, direct Slack access to them, creative direction on everything; full brand builds happen ON Design Lead (4–6 weeks). Flagship — "most teams choose Design Lead."
- Founding rate: first 10 Design Lead clients lock £3,500/mo for life
- No project pricing, no proposals, no quotes, no hourly billing. "Need more firepower? Let's talk" is the only unpublished tier.
- Value anchor: a UK design lead = £65k+/yr + National Insurance + holiday cover + recruitment; Design Lead (the plan) = £48k/yr, senior across every discipline, cancel any month.

**Proof:** 200+ brands · 15+ industries · 6 years as an agency · 50+ experienced designers. The multistep form at /start = the single primary CTA across the whole site; the free Brand Ranking Report (/brand-report) is the unqualified-lead magnet.

**Voice:** confident, premium, plain-spoken. Short lines. No hype, no exclamation marks, no emoji. Lead with the customer's problem and our proof, not our features.

(Full long-form section copy is in the homepage spec above; reuse verbatim and expand naturally for sub-pages.)

---

## 11. Accessibility & performance (non-negotiable)

- Respect `prefers-reduced-motion` everywhere (§5.8).
- Keyboard accessible nav, focus-visible rings (use the yellow), proper landmarks and heading order.
- Colour contrast: white/`--muted` on black passes AA; yellow is used on black or as a background with black text.
- Performance budget: LCP < 2.5s. Lazy-load all video, poster images for instant paint, code-split heavy sections, no layout-animating. Test on mobile.
- All interactive targets ≥ 44px.

---

## 12. File structure

```
app/
  layout.tsx          # fonts, <SmoothScroll>, <CustomCursor>, header/footer
  page.tsx            # homepage (composes sections)
  (routes)/...
components/
  ui/                 # shadcn + extended primitives
  sections/           # homepage + page sections
  motion/             # Reveal, StaggerGroup, CountUp, MagneticButton, etc.
lib/
  motion.ts           # shared variants, easing, durations
  utils.ts            # cn(), helpers
public/
  fonts/ work/ logos/
```

Centralise easing/variants in `lib/motion.ts` so motion stays consistent. Tailwind theme maps the CSS variables from §3.

---

## 13. Definition of done (quality bar)

This site has to be better than Legora. Before calling anything finished:
- Motion is smooth at 60fps, eased, restrained — one move at a time, never janky or bouncy.
- The hero headline reveal and the sticky "way of working" section feel genuinely premium.
- Yellow appears sparingly and always marks the single most important thing on screen.
- `prefers-reduced-motion` produces a clean, static, fully-usable site.
- Mobile is as considered as desktop; nothing is cropped or broken.
- LCP < 2.5s with all that video.
- It looks like the work of a top-tier brand studio — because it is the proof of one.

Build it section by section, get the motion system (§5) right first, and treat this site as Milktree's most important portfolio piece.
