# Milktree — June 2026 Schedule-objective Campaign Plan

**Author:** Strategy memo
**Date:** 30 May 2026
**Campaign codename:** `MT_Schedule_UK_Andromeda_Jun26`
**Objective:** Maximise Cal.com bookings (Meta `Schedule` event)
**Budget:** £30/day (CBO)
**Target CPA:** Booked call ≤ £35 (interim, weeks 1–2); £20–25 (steady state, week 4+)
**Funnel today (post-fixes, verified in Pixel Helper):** PageView → Contact → Lead → Schedule → PageView ✅

---

## 0. Executive summary

You've spent the last three months getting the **machinery** right, not the campaign. Now the machinery is right. The Pixel + CAPI fires cleanly, the qualifier filters before time-wasters get a calendar slot, and the LP is no longer cobbling three different offers ("30-min call", "5-min teardown", "48-hour audit") together. From here, paid performance is bottlenecked on **creative**, not on plumbing.

**The single most important constraint is budget.** At £30/day, Meta's Andromeda algorithm will spend ~£900/month. With a realistic post-qualifier CPA of £25–35 per booking, that's ~25–35 bookings/month — well below the 50 conversions/week threshold that lets the algorithm fully exit Learning. **You will run in semi-Learning for the foreseeable future** unless budget scales. That's not a reason not to launch, but it does change the right number of creatives (4-5, not 7) and the right number of audience signals (broader, not narrower).

The proven creative pattern is unchanged from April: **contrarian hook + specific quantified outcome + direct "we fix it" headline + concrete deliverable**. Stick to it. The April plan recommended 7 ads at £75/day; the June plan is **5 ads at £30/day**, weighted toward the proven winner and away from the experimental ones.

---

## 1. Last three months — what worked and what didn't

### 1.1 The headline number

| Window | Spend | Leads (Formspree) | Bookings (Cal) | Status |
|---|---|---|---|---|
| 13–16 Mar | £40.32 | 0 | 0 | Tracking corrupted ad set |
| Late Mar – 28 Apr | £95.05 | 0 | 0 | Budget frozen pending fixes |
| **YTD through 28 Apr** | **£135.37** | **0** | **0** | **All audit findings logged in `/audits/`** |
| May | (frozen) | (n/a) | (n/a) | Modal redesign, pre-launch fixes |

Three months of spend with zero real conversions sounds catastrophic until you read the cause: **the campaign was optimising for the wrong event for 12 days, then was paused for fixes.** The algorithm spent that time learning what "people who click CTA buttons" looks like — not "people who book calls". When Andromeda CBO chose creatives, it was choosing for the wrong outcome.

The good news is the audience that *actually* converts has never been targeted. The June campaign starts with a clean slate.

### 1.2 What worked (carry forward)

**Creative pattern — proven on Mar–Apr data:**
- `your_brand_looks_v2` did **4.31% CTR / £0.33 CPC / £14.20 CPM** across 4,893 impressions. Two to three times the Meta benchmark for B2B services. CBO concentrated 81% of spend on the two `your_brand_looks` variants and `your_third_rebrand` — they were doing the work.
- The pattern that earned that performance:
  1. Specific data point in line 1 ("We asked 200+ business owners…", "250% average increase…")
  2. Direct reframe ("Not because of a pretty logo — because of a clear identity that sells for you.")
  3. Headline that doubles as a promise ("Nobody Knows What You Do. We Fix That.")
  4. Concrete deliverable + speed ("Free brand audit. Results in 48 hours.")

**Hero / LP message match — proven on YTD signal:**
- The hero line "Nobody knows what you do. We fix that." is identical between milktreeagency.com and the winning ad. That word-for-word match is the strongest single performance lever. Keep it.

**Audience signals — never properly tested but logically sound:**
- UK 25–65, Advantage+ Audience ON, interest signals: business owner, brand management, marketing strategy, financial services, mortgage, real estate, professional services. Carry these forward unchanged.

### 1.3 What didn't (don't repeat)

**Tracking pollution.** The Contact event was firing on CTA-button clicks, not form submissions. The first 12 days of spend were misallocated. **Fixed**: Contact now fires when the user finishes step 8 of the modal (i.e. they're qualified, about to see the calendar). Lead + Schedule both fire only on `Cal.com bookingSuccessful`. Verified live in Pixel Helper.

**Creative monotony.** Every Mar–Apr ad was a static image. Meta favours video in Reels/Stories placements and starves static creatives there. Of the available real estate, only Feed + Marketplace was effectively served. **Action**: produce two short Reels-format videos by week 3 (see §3).

**Funnel fragmentation.** The campaign ran with multiple competing ad sets (mmt_branding_leads, advantage_uk_contact, advantage_uk_06mar, milktree_lead_gen) splitting budget. Andromeda CBO can't compound learning when split four ways at a small budget. **Action**: one campaign, one ad set, period. Pause everything else.

**Wrong-funnel creative.** ENG-02 (Comment Playbook DM lead-magnet) and ACT-02 (newsletter) shipped inside the Lead ad set in April. They optimise for Comment or Subscribe events that don't fire the Lead pixel — Meta starved them. **Action**: exclude both from this campaign. If you want to run them, they need a separate Engagement-objective campaign with its own LP.

**LP offer inconsistency.** Through April, the LP simultaneously offered a "30-min discovery call", a "5-min teardown", and a "48-hour audit". Three deliverables on one page = ambiguous promise. **Fixed**: as of May, one offer everywhere — "Free Brand Audit · 48-hour turnaround" — and the QualifyModal makes the path mandatory: qualifier → Cal slot → audit in 48h of the call.

### 1.4 What's new in the machinery (May 2026)

These changes did not exist in any prior audit. They change the math.

- **Multi-step QualifyModal** (turnover-free version, now budget-tier based). Eight focused screens, name + email captured on screen 1, hard-gate disqualifier on budget < £1,000 or "Just exploring". This means **every Formspree submission already represents a budget-qualified, timing-ready prospect** — not a lukewarm lead.
- **Mandatory Cal.com booking before form submission.** Lead + Schedule fire together on `bookingSuccessful`. The two events are **the same volume** now. Optimising for one optimises for the other.
- **Disqualified leads still hit Formspree** with `qualified=no` + reason. They also get the Brand Playbook handoff so they leave with value. Meta records `LeadDisqualified` as a custom event — useful for analysing fit-rate but **not** an optimisation event.
- **Conversion path** is `/audit` → QualifyModal → Cal embed → `/audit/thank-you?booked=1`. No alternate paths. No fallback forms. This is good news for attribution and bad news if anything in that path breaks — instrument it carefully.

---

## 2. Creative audit — current state

### 2.1 The April 2026 creative set (8 ads, audited 28 Apr)

| # | Ad | April verdict | June recommendation |
|---|---|---|---|
| 1 | **AWR-01** "Your brand looks fine. Nobody knows what it stands for." | 🟢 Ship — mirrors proven winner | **Keep — control + winner** |
| 2 | **AWR-02** "Pitch deck vs website" | 🟡 Ship with fixes | Keep, after fixes (see §3) |
| 3 | **DES-01** "Hot Take" 9-faces poll | 🟡 Ship with fixes | Drop — engagement-style underperforms Lead optimisation, and we can't afford slow-learners |
| 4 | **DES-02** "Your homepage is one sentence from winning" | 🟢 Ship | **Keep — dark-horse top performer** |
| 5 | **ENG-01** "Give us 20 minutes…" | 🟡 Ship with copy trim | Keep, after trim |
| 6 | **ENG-02** Comment Playbook DM | ⚫ Wrong funnel | **Exclude** — needs its own campaign |
| 7 | **ACT-01** "MOST BRANDS AREN'T BAD" crossword | 🟡 Ship after typo fix | **Keep** — restrict to Feed + Marketplace |
| 8 | **ACT-02** Newsletter signup | ⚫ Wrong funnel | **Exclude** — needs its own campaign |
| — | **your_brand_looks_v2** (legacy) | ⭐ Proven control | **Keep running as benchmark** |

That's **5 in-funnel creatives + 1 control = 6 creatives** at £30/day. **Drop to 5 total** by retiring DES-01 (engagement-style is luxury we can't fund at this budget).

### 2.2 What's missing

**Zero video, zero UGC, zero motion.** Every existing creative is a single static image. This means:
- Reels and Stories placements (where attention now lives, especially for UK SMB founders aged 35–55) are effectively starved of inventory. Static ads can render there but the algorithm down-weights them.
- No founder/testimonial face. For a service business, the founder talking-head ad is consistently the highest-converting format. You have testimonials in `/audits/` (Chris from Police Mortgages, Edward from HMO Checker, Daniel Rogan from Restaurant AO) — none have been used as video assets.
- No before/after brand reveal. Visual transformation is the most native proof for a brand agency.

**Single biggest creative gap to close in June.** See §4 for what to produce.

---

## 3. Next iteration — instructions for your head designer

### 3.1 How many creatives

**Round 1 (week 1 launch):** 5 ads in the ad set.
- 4 of the April static set, after fixes: AWR-01, AWR-02, DES-02, ACT-01
- 1 legacy control: `your_brand_looks_v2`

**Round 2 (start of week 3):** add 2 new video creatives.
- VID-01: 15-sec founder talking-head testimonial (Chris from Police Mortgages — strongest brand recall in your roster)
- VID-02: 15-sec brand reveal — before/after of one of the 5 sites (Restaurant AO or HMO Checker are the most visually dramatic)

That gives a 7-ad ad set by week 3. **Don't go beyond 7.** Andromeda at £30/day can't fund more without starving the survivors.

**Cadence after week 3:** test 1 new ad every 2 weeks. Kill the worst-performing existing ad in the same edit so the ad set stays at 7. Never edit a live ad — duplicate, edit the duplicate, pause the original. Live edits reset learning.

### 3.2 Copy direction (head-designer-ready)

Every ad in the set must satisfy the proven 4-ingredient pattern. Hand this to your designer as the brief:

```
INGREDIENT 1 — DATA HOOK (first 6 words of primary text)
  Use a specific, verifiable number. Examples that work:
    "We asked 200+ business owners…"
    "Half of your prospects can't describe what you sell."
    "250% average enquiry lift across 200+ rebrands."
  Examples that fail:
    "We help brands grow."        ← no number
    "Your brand needs clarity."   ← assertion, not data

INGREDIENT 2 — REFRAME (one sentence, ~12 words)
  Take the buyer's assumption and flip it. Their assumption is
  usually "my brand needs a logo refresh" or "I need more leads".
  Flip:
    "It's not a design problem. It's a clarity problem."
    "Your website isn't lying — it's just saying nothing."
    "Most brands aren't bad. They're just unclear."

INGREDIENT 3 — HEADLINE = PROMISE (≤27 chars, sentence case OK)
  Use the proven hero line OR a direct mechanical extension:
    "Nobody Knows What You Do."   ← proven control
    "Your Website Is Lying."      ← AWR-02 variant
    "Fix Your Hero Line."         ← DES-02 variant
    "20 Minutes. One Audit."      ← ENG-01 variant
  
  AVOID: "Get a free audit", "Learn more", any verb-led headline.
  Those test as background noise.

INGREDIENT 4 — DELIVERABLE + SPEED (description line, ≤27 chars)
  Exact wording:
    "Free Brand Audit · 48h"
    "Free Audit · No commitment"
    "Free Audit · 200+ Brands Built"
  
  NO variations. We pay a tax every time we vary the deliverable
  language because the modal, the LP, the Cal slot, and the
  thank-you page all say "Free Brand Audit · 48-hour turnaround."

CTA button:
  Static ads → "Get Offer"
  Video ads → "Book Now"
  Don't mix "Learn More" anywhere. Lower Meta-side weighting for
  this objective.
```

### 3.3 Design direction (visual brief)

The proven winning visual was a coloured-sticky-note typography card with the headline carrying the ad. Stick to that visual grammar:

- **Static format spec**: 1080×1350 (4:5 feed) AND 1080×1920 (9:16 stories/reels). Export both per ad. Reels-format gets stories/reels inventory; feed-format is the rest.
- **Type-led, image-supporting**, never the other way round. The headline is the ad; any photograph is background texture. Mood: editorial, confident, not stocky.
- **Brand yellow `#FFDC04`** as the single accent. Yellow on dark works for B2B founders aged 35–55 (their feed is full of muted blue corporate ads — yellow stops the scroll). No second accent.
- **One focal element per frame.** A highlighter sweep on a single word. A sticky note. A circled word. Whatever the device is, only one per ad.
- **No fake UI elements.** No mock buttons, no mock X-close, no mock "Agree/Disagree". Meta's automated review flags these as deceptive (this killed AWR-02 + DES-01 in April).
- **Text overlay ratio under 30%** for Reels/Stories versions. ACT-01 (crossword) is allowed to break this rule because of its specific high-stop-rate visual — but only in Feed/Marketplace placements.
- **Logo in top-left corner only.** Never centre. Visual symmetry competes with the headline.
- **Mobile-first**: every ad should be checked at 320×400px first. If the headline is illegible at that size, the desktop version isn't useful either.

### 3.4 Video direction (Round 2, week 3 deliverable)

Two videos, 15 seconds each, produced by **6 June** (gives a week for review + Meta review):

**VID-01 — Founder testimonial (Chris, Police Mortgages)**
- Format: 15 sec, 9:16 vertical, native iPhone shoot is fine — don't over-produce.
- Structure: 0–3s hook ("We spent 10 years on Google's first page. Then we rebranded.") → 4–10s payoff ("Our SEO didn't just stay safe. It performed better than ever.") → 11–15s yellow card overlay ("Free Brand Audit · 48h turnaround · milktreeagency.com/audit").
- Captions burned in (35% of Reels views are sound-off).
- CTA: "Book Now"

**VID-02 — Brand reveal (Restaurant AO or HMO Checker)**
- Format: 15 sec, 9:16 vertical.
- Structure: 0–4s before state (old website screenshot, dated logo) → 5–10s reveal animation (yellow swipe transition, new identity emerges) → 11–15s ("Same business. Different story." → yellow card → URL).
- Voiceover optional but captions required.
- CTA: "Get Offer"

Both videos slot into the SAME ad set as the static ads. Andromeda allocates between formats per placement.

---

## 4. Budget & platform strategy — £30/day

### 4.1 Single-channel, single-campaign, single-ad-set

```
MT_Schedule_UK_Andromeda_Jun26                 [Campaign — Sales (Lead), CBO]
└── BrandClarity_Advantage+_UK                 [Ad Set — Lead/Schedule optimisation]
    ├── AWR-01 (fixed)
    ├── AWR-02 (fixed)
    ├── DES-02 (ship as-is)
    ├── ENG-01 (copy trimmed)
    ├── ACT-01 (typo fixed, placements restricted)
    ├── your_brand_looks_v2 (proven control)
    ├── VID-01 (added week 3)
    └── VID-02 (added week 3)
```

### 4.2 Why optimise for Lead (not Schedule), even though our goal is bookings

**Lead and Schedule fire on the same event** (`Cal.com bookingSuccessful`) in the new architecture. Both have identical volume. So:
- **Optimise on Lead.** Meta's algorithm has more historical training data for `Lead` than `Schedule` and converges faster on small budgets.
- **Schedule remains the campaign goal in reporting.** Track CPA against Schedule events in your dashboards — same number as CPL, just labelled clearly.
- **AEM priority** (Events Manager → Aggregated Event Measurement): `Lead > Schedule > Contact > ViewContent > PageView`. Lead gets the iOS-attributable signal.

If you specifically need to switch the optimisation event to `Schedule` later (e.g. to please a stakeholder), it's a 30-second change in Ads Manager and won't disrupt much because volume is identical.

### 4.3 Settings — exact configuration

| Setting | Value | Why |
|---|---|---|
| Campaign objective | Sales (Lead) | Cleanest match to a calendar-booking funnel |
| CBO | ON | Andromeda allocates spend across creatives |
| Daily budget | **£30/day** | Per brief |
| Bid strategy | Highest volume (no cost cap) | Sub-50/week conversions = cost cap will starve delivery |
| Conversion event | Lead | Same volume as Schedule, faster learning |
| Audience | Advantage+ Audience ON, UK, 25–65, all genders | Mar/Apr signal |
| Audience signals | Business owner, brand management, marketing strategy, financial services, mortgage, real estate, professional services | Mar/Apr signal |
| Exclusions | `WEB_Converters_180d` (form submitters last 180d) | Don't re-target people who already booked |
| Placements | Advantage+ Placements ON | Andromeda needs cross-placement signals |
| Dynamic Creative | OFF | You want per-ad attribution to inform week-3 swap |
| Schedule | Run continuously, no day-parting | Sub-50 conversions/week = no statistical basis for time-of-day cuts |

**Placement carve-out for ACT-01:** in week 1, duplicate ACT-01 and restrict the duplicate to **Feed + Marketplace only** (its text-heavy crossword visual is down-weighted in Reels). Keep the original on all placements. After 7 days, compare cost-per-Lead on the two — pause the loser.

### 4.4 Week-by-week operating plan

| Week | Action | Don't-touch rule | Decision rule |
|---|---|---|---|
| **1** (1–7 June) | Launch with 5 static ads. Spend = £30 × 7 = £210. | Don't edit any ad. Don't change budget. Don't move the audience. | Even if CPA looks bad, edits reset learning. |
| **2** (8–14 June) | Watch the data accumulate. Cut any ad with ≥£20 spend and 0 leads. Reallocate that spend across survivors via CBO automatically. | Don't add new ads yet. | If total Schedules ≥ 4 by day 14 → on plan. < 4 → see §4.5 escape hatch. |
| **3** (15–21 June) | Add VID-01 and VID-02. Pause whichever 2 static ads have the highest cost-per-Lead. Net ad set = 5 ads (3 static survivors + 2 video). | Don't change anything else. | Watch video CTR vs static CTR. If video CTR is 2× static → bias future creatives toward motion. |
| **4** (22–28 June) | Evaluate full month. If cumulative CPA < £25 → push to £45/day from week 5. £25–£35 → hold £30. > £35 → see §4.5. | First budget change permitted this week. | Andromeda only fully exits Learning at ~50 conversions; you'll be in semi-Learning. Patience. |

### 4.5 If we're underperforming — escape hatch

If after 14 days you've spent £420 and gotten fewer than 4 Schedules:

1. **First**, verify the funnel is actually intact end-to-end. Real test booking, Pixel Helper screenshot, Formspree inbox check. If anything is broken, that's the cause — not creative or budget.
2. **Second**, check the disqualification rate. If > 60% of modal completers are getting the DQ screen (look at the `LeadDisqualified` custom event count in Events Manager), the budget tiers may be too strict for your incoming traffic. Loosen the `Under £1,000` band to `Under £750` and re-evaluate over 7 days.
3. **Third**, consider switching the optimisation event to `Contact` (which fires on modal completion, before the calendar). This raises Meta-visible conversion volume by ~3–5×, which lets Andromeda exit Learning. The trade-off: Meta now optimises for "people who fill out the qualifier", not "people who book". You re-introduce a lower-quality optimisation signal. **Only do this if** weeks 1–4 don't move and budget can't increase. Plan an exit back to Lead optimisation after 30 days of Contact-optimised data.
4. **Fourth and last**, request a temporary budget bump to £50/day for two weeks. £50/day × 14 = £700 — gets you closer to the 50-conversions-per-week learning floor. After two weeks at £50, scale back to £30 once the algorithm has stabilised.

### 4.6 Targets

| Metric | Week 1 | Week 2 | Week 4 | Month 2 |
|---|---|---|---|---|
| Bookings (Schedule) | 1–3 | 3–6 cumulative | 8–15 cumulative | 15–25/month |
| CPA (cost per booking) | < £100 (learning) | < £50 | £30–35 | £20–30 |
| CTR | 1.5–3% | 2–3.5% | 2.5–4% | 3%+ |
| CPC | £0.35–£0.60 | £0.30–£0.50 | £0.25–£0.45 | £0.30 |
| EMQ (Lead) | 7.0+ | 7.5+ | 8.0+ | 8.0+ |
| Disqualification rate | < 50% of modal completes | 40–55% | 40–50% | 40–50% |

A "good" disqualification rate is 40–55%. Below 30% means the gate is too loose (we're booking calls we shouldn't). Above 60% means the gate is too tight or the ad is attracting the wrong audience.

---

## 5. Landing page — what to change

**Short answer:** very little. The May fixes brought the LP to where it should be for paid:
- Hero matches the proven winning ad word-for-word ("Nobody knows what you do. We fix that.")
- One offer everywhere (Free Brand Audit · 48-hour turnaround)
- Modal-driven mandatory booking path
- Centred single-column hero (no redundant `BookingCard` competing with the eyebrow chip)
- Case study cards open the QualifyModal CTA directly (no scroll-back)

**Three small tweaks worth doing before launch:**

1. **Add 2 more testimonial quotes to the Proof section** of `/audit`. April audit flagged this — the page leans on Edward (HMO Checker) heavily. Bring Chris (Police Mortgages) and Daniel Rogan (Restaurant AO) onto the page. Quote content already in `data/content.ts` testimonial blocks.

2. **Add 1-line context labels to the Recent Wins stat numbers** (`£3.27`, `300%`, `564%`…). Currently they're labelled with what the metric is, but viewers don't see *for what client* at a glance. Now that the brand name is the card headline (May 29 change), the label `Cost per lead (60% below industry)` already implicitly contextualises — this might already be solved. Verify on the live URL.

3. **Sticky mobile CTA past the fold.** On mobile, after the user scrolls past the hero CTA, there's no visible booking trigger until they hit the FinalCTA section. Add a sticky bottom-bar "Get my free audit" button on mobile that opens the modal. The desktop is fine.

None of these are launch blockers. Ship without them and add in week 2 as polish.

---

## 6. Pre-launch checklist (verify before flipping campaign on)

You've already done #1 (verified Pixel events on a real walk-through). The remaining items are 15 minutes total:

- [x] Pixel events firing — PageView → Contact → Lead → Schedule → PageView verified
- [ ] Submit a **disqualified** test (pick `Under £1,000` budget) — confirm Brand Playbook card renders, link opens the Google Doc, Formspree row arrives with `qualified=no`, `disqualified_reason=budget`
- [ ] Meta Events Manager → Diagnostics — confirm CAPI coverage ≥ 75% on Lead and Schedule
- [ ] Meta Events Manager → AEM → set priority: Lead > Schedule > Contact > ViewContent > PageView
- [ ] Confirm `WEB_Converters_180d` exclusion audience exists; if not, create from form submitters last 180 days. (Won't have data on day 1; create now so it auto-populates from week 1.)
- [ ] Cal.com event type availability — confirm the next 14 days have plenty of bookable slots; otherwise paid traffic hits a wall
- [ ] GA4 → mark `Schedule` (event_category=Schedule) as a Key Event so it's available for Google Ads import later

---

## 7. Open items / risks

1. **The £30/day budget is the binding constraint.** Andromeda performs best with ≥ 50 conversions/week, which at our expected CPA needs ~£50–75/day. We're under-funded by design. The escape hatch in §4.5 is the contingency. Set expectations with anyone reporting up: month 1 is a learning month, not a returns month.
2. **No video in week 1.** Reels and Stories inventory will be allocated but down-weighted on static. Week 3 video addition should lift cross-placement performance materially — plan it as the main creative milestone of the month.
3. **The qualifier is new — incoming traffic doesn't know about it yet.** Some of week 1's "drops" between PageView and Contact will be visitors who reach the modal, see 8 questions, and bail. This is expected. After week 1 we can decide if the modal needs a slightly lighter first screen (e.g. just name + email, role moved to screen 2) to lower the drop-off.
4. **`Visit website` button URLs assume current domains.** All 5 URLs corrected to the real ones on 30 May. If any client changes their domain, the Case Study modal button will hit a 404 — track outbound from `data/content.ts` once a year.
5. **Brand Playbook link** in the disqualified screen points at the real Google Doc as of 30 May. If you re-share that doc with a new view-only link, update `BRAND_PLAYBOOK_URL` in `components/QualifyModal.tsx`.

---

## 8. Bottom line

You've fixed the things that were silently sabotaging the last three months — Pixel/CAPI, Contact-event inflation, LP offer fragmentation, and the absence of a real qualifier. The June campaign is the first one to launch into a **clean machine**.

The plan is conservative because the budget demands it: 5 ads at launch, the proven winning pattern and visual grammar in all of them, single ad set on Advantage+, single audience signal stack, Lead optimisation, week-by-week patience.

The single biggest lever you haven't yet pulled is **video.** Plan VID-01 (founder testimonial) and VID-02 (brand reveal) for week 3 — that's the inflection point this month. Static ads at £30/day on Andromeda can sustain, but won't break out. Motion will.

Submit one real test booking, fire the disqualified test, complete the §6 checklist, and launch. Then leave it alone for 7 days.
