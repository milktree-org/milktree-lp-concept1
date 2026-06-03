# Milktree — June 2026 Relaunch Brief

**Date:** 2 Jun 2026
**Built from:** live Marketing API data (`META-ADS-AUDIT-02-JUN-2026.md`)
**Account:** `act_762151792261302` · **Pixel:** `993503079134900`
**Covers:** (3) new campaign blueprint · (4) new creative instructions · (5) post-launch playbook · (6) how to publish

---

## 3. Campaign blueprint — `MT_Lead_UK_Andromeda_Jun26`

**One campaign. One ad set. £30/day. Existing winners.** This fixes the single biggest leak from May: three parallel campaigns competing in the same auction (which dragged blended CPA from £28 → £35).

### Settings (copy these exactly)
| Setting | Value | Why |
|---|---|---|
| Campaign name | `MT_Lead_UK_Andromeda_Jun26` | convention |
| Objective | **Leads** (`OUTCOME_LEADS`) | what worked in May |
| Budget | **£30/day, CBO** (Advantage campaign budget) | one budget, one ad set |
| Bid strategy | **Highest volume** (lowest cost, no cap) | let it find the floor first |
| Conversion location | **Website** | the booked-call funnel |
| Optimization event | **Lead** (Pixel `993503079134900`) | the event that fired 22× in May = booked calls |
| Attribution | 7-day click / 1-day view | Meta default |
| **Ad sets** | **ONE** | kill the fragmentation |
| Audience | **GB, age 25–65** | standardize (drop the 18-24 and 25-50 splits) |
| Advantage+ Audience | **ON**, interests as *suggestions*: Brand management, Financial services, Professional services, Marketing strategy | proven stack |
| Exclusions | Exclude `WEB_Converters_180d` + your lead list (once it rebuilds) | don't pay to re-reach closers |
| Placements | **Advantage+ (automatic)** | needed once video lands (Reels/Stories) |
| Special category | **None** | (B2B services — not restricted) |

### Creatives at launch — reuse these 3 proven winners (existing ads)
| Ad | May result | Verdict |
|---|---|---|
| **AWR-01_brand_looks_unclear** | £14.43 CPA · 6 leads | 🟢 Best converter — control |
| **DES-02_homepage_one_sentence** | £21.69 CPA · 5 leads | 🟢 Keep |
| **AWR-02_pitch_deck_vs_website** | £42.22 CPA · 5 leads · top spend | 🟡 Keep for volume |

**Cut from the set:** `DES-01_hot_take` (BELOW_AVERAGE quality, weak leads) and `ACT-01_clear_brands` (3–4% CTR but ~0 leads — pure engagement bait). The live data is unambiguous: they pull clicks, not calls.

➕ Then add the **2 new creatives** from §4 (incl. 1 video) → a **5-ad set**. Don't exceed 5 at £30/day or you starve the winners.

---

## 4. New creative instructions (designer-ready)

**The pattern the data proved works** (every ad must hit all four):
1. **Data hook** (first 6 words) — a specific number. *"Half of your prospects can't…"*, *"250% average enquiry lift…"*
2. **Reframe** (~12 words) — flip their assumption. *"It's not a design problem. It's a clarity problem."*
3. **Headline = promise** (**≤27 chars**) — *"Nobody Knows What You Do."* Never verb-led ("Get a free audit" tests as noise).
4. **Deliverable + speed** (**≤27 chars**) — exact words: *"Free Brand Audit · 48h"*. Never vary this — the LP, modal, Cal slot, and thank-you page all must match.

**CTA button:** static → `Get Offer`; video → `Book Now`. Never `Learn More` (lower weighting for this objective).
**Char limits:** primary text keep the hook in the first **125 chars**; headline **≤27**; description **≤27**.

### 🔴 The #1 gap: zero video. Both new creatives should be video.

---

**BRIEF A — Founder/Client testimonial video (HIGHEST PRIORITY)**
- **Format:** 9:16 vertical, **15–20s**, captions burned in (85% watch sound-off), safe-zone aware (keep text out of the bottom 20%).
- **Talent:** a real client — **Chris (Police Mortgages)** has the strongest recall in your roster.
- **Hook (0–3s, on screen + spoken):** *"We were getting leads — they had no idea what we actually did."*
- **Middle (3–12s):** *"Milktree rebuilt our brand around one clear message. Enquiries went up [X]%."* — show the before/after logo or site.
- **End (12–18s):** Milktree logo + *"Free Brand Audit · 48h"* + CTA `Book Now`.
- **Primary text:** *"200+ brands built. This is what happens when people finally understand what you do."*
- **Headline:** `Nobody Knows What You Do.`
- **Why:** founder/testimonial video is the highest-converting format for service businesses, and it's the only thing that fills your starved Reels/Stories inventory.

**BRIEF B — Before/After brand reveal video**
- **Format:** 9:16, **12–15s**, fast cuts, motion/sound design.
- **Hook (text card):** *"Your brand looks fine. Nobody knows what it stands for."* (mirrors your AWR-01 winner)
- **Reveal:** old, cluttered identity → new, clear identity for one visually dramatic client (**Restaurant AO** or **HMO Checker**), ending on the outcome stat.
- **Primary text:** *"Half of your prospects can't describe what you sell. We fix that — free, in 48 hours."*
- **Headline:** `Your Brand Is Unclear.` · **Desc:** `Free Brand Audit · 48h` · **CTA:** `Get Offer`
- **Why:** visual transformation is the most native proof a brand agency can show; recycles proven AWR-01 messaging in a fresh, fatigue-resistant format.

**BRIEF C — Fresh static (optional 3rd / fatigue insurance)**
- **Format:** 1:1 + 4:5, bold type, high contrast.
- **Primary text:** *"Half of your prospects can't describe what you sell. That's not a logo problem — it's a clarity problem. Free 48-hour brand audit."*
- **Headline:** `Nobody Knows What You Do.` · **Desc:** `Free Brand Audit · 48h` · **CTA:** `Get Offer`
- **Why:** refreshes the proven AWR-01 angle with new art so the control has a successor when it fatigues.

**❌ Do NOT make:** poll/"hot take"/quiz formats, "Learn More" CTAs, verb-led headlines, or any new wording for the offer. May's data shows these earn clicks and zero calls.

---

## 5. Post-launch playbook (what to do once it's live)

**Before you flip it on:** confirm in Test Events the Pixel `Lead` fires on a real booking; confirm optimization event = Lead; confirm £30/day, 1 ad set, all 5 ads Active, audience size shows "broad."

| When | Do | Don't |
|---|---|---|
| **Day 0–3 (Learning)** | Leave it completely alone. Watch delivery + spend pacing only. | ❌ No edits — any edit resets Learning. |
| **Day 4–7** | Check CPA, CTR, frequency. Note early front-runners. | ❌ Don't kill ads yet — too little data. |
| **Day 7–10 (first cull)** | Pause any ad with **>£70 spend and 0 leads** (2× target = kill). Keep CTR >1.5% + leads. | ❌ Don't touch the winners. |
| **Day 10–14** | Add **Brief A (video)**. Never edit a live ad — duplicate, edit copy, pause original. | ❌ Don't edit live ads (resets learning). |
| **Day 14+** | 1 new creative every 1–2 weeks; cut the worst in the same edit to stay at ~5. | ❌ Don't let the set grow past 5–7. |

**Thresholds to watch:**
- **CPA:** ≤£35 interim, target £25–28 (your May winner hit £28).
- **CTR:** ≥1.5% (May faded from 3.0%→1.3% — that fade is *why* it stalled; video should arrest it).
- **Frequency:** <3.0 (was a healthy 2.1 — fine).
- **Quality ranking:** average or above; below-average twice = replace the ad.

**Reality check — Learning:** at £30/day you get ~5 leads/week vs the 50/week needed to fully exit Learning. You'll run in semi-Learning. That's OK — it just means *be patient* (judge on 50 results or 2 weeks, not 3 days) and *keep the set small*.

**When to scale:** only if CPA holds ≤£28 **and** booked calls are closing into paid work. Then raise budget **+20% every 3–4 days** — bigger jumps reset Learning.

**Audience build (do in parallel):** once you've logged ~50–100 booked-call leads, build a **1–3% Lookalike off them** (your strongest future audience) and retire the leftover **Heat-Plex** lookalike. Add a retargeting ad set once the website pools (currently ~20 people) refill past 1,000.

---

## 6. Publishing — can it be created directly on Meta?

**Not with the current token.** The token you generated is **`ads_read`** (read-only). Creating/publishing a campaign needs **`ads_management`** (write) — different permission.

Two ways forward:

**Option A — Duplicate in Ads Manager (recommended, ~10 min).** Your existing creatives already live in the account, so the cleanest reuse is:
1. Ads Manager → select `MT_Lead_UK_Andromeda_May26` (the winner) → **Duplicate**.
2. Rename to `MT_Lead_UK_Andromeda_Jun26`, set CBO **£30/day**, keep one ad set, settings per §3.
3. In the duplicated ad set, **remove the DES-01 and ACT-01 ads**; keep AWR-01, DES-02, AWR-02.
4. Leave **Paused**, eyeball everything, then publish.
This preserves the creative objects and their history — lower risk than rebuilding.

**Option B — I build it via API (if you grant `ads_management`).** Generate a token with `ads_management`, and I'll create the campaign + ad set + ads (referencing your existing creative IDs) **in PAUSED state** for you to review in Ads Manager. I will **not** turn on spend — you keep the "go live" button. More moving parts than Option A, so I'd still create it paused for your sign-off.

**My recommendation:** Option A. It's faster, reuses your winners natively, and keeps you in control of the live switch.
