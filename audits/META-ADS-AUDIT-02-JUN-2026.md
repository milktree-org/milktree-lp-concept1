# Meta Ads Audit — Milktree Agency (LIVE DATA)

**Date:** 2 Jun 2026
**Account:** Milktree Agency ADs Account (`act_762151792261302`) — `account_status: 1` (ACTIVE)
**Pixel:** `993503079134900`
**Data source:** **Live Meta Marketing API pull** (token, `ads_read`) — campaigns, ad sets, ads, insights, audiences. Window: **last 30 days (3 May – 1 Jun 2026)**.
**Supersedes:** the earlier draft of this file, which was built on stale planning docs and was wrong about account state (see note).

---

## 0. Correction to the first draft

My first pass described the account as *"frozen since late March, nothing to pull, pre-launch."* **That was wrong** — it came from a planning memo, not the account. The live data shows the opposite:

- The account **relaunched in early May and spent £779.16 over 30 days** (3–28 May), driving **22 booked calls**.
- It is **not frozen** (status ACTIVE) — but **all campaigns are currently PAUSED**, switched off around **28 May** (~5 days ago). Spend tapers to £0 after 28 May.
- The live objective is **`OUTCOME_LEADS` / `OFFSITE_CONVERSIONS`**, not the "Schedule" campaign the June memo proposed. The memo was aspirational; it wasn't what ran.

Everything below is rebuilt on the real numbers.

---

## 1. Meta Ads Health Score: 65/100 (Grade C−)

```
Pixel / CAPI Health: 74/100  (30%)  ← strong build, live-confirmed firing; 3 code fixes pending
Creative:            55/100  (30%)  ← proven winners, but active CTR fatigue + zero video + wasted spend
Account Structure:   63/100  (20%)  ← correct optimization, but 3 parallel campaigns competing
Audience:            67/100  (20%)  ← solid prospecting; empty retargeting + wrong-brand lookalike
```

**Verdict:** This is **not a broken account — it's a decent one that was switched off mid-fatigue with the budget split three ways.** The winning campaign hit **£28 per booked call, under your £35 target.** Fix the fragmentation, refresh the fatigued creative, and patch three tracking bugs, and the relaunch should beat May.

---

## 2. Headline performance — last 30 days (3 May – 1 Jun)

| Metric | Value | Read |
|---|---|---|
| Spend | **£779.16** | ran 3–28 May, then paused |
| Booked calls (leads) | **22** | `offsite_lead_add_20_s_calls` = 22 |
| **Blended cost per booked call** | **£35.42** | at your £35 ceiling |
| Impressions / Reach | 53,016 / 24,829 | |
| Frequency | **2.14** | healthy (well under 3.0) |
| CTR (link) | **2.09%** | strong (>1% benchmark) |
| CPC / CPM | £0.70 / £14.70 | reasonable for UK B2B |

### Per-campaign — the fragmentation tax
| Campaign | Spend | Booked | CPA | CTR | Verdict |
|---|---|---|---|---|---|
| **MT_Lead_UK_Andromeda_May26** | £590.46 | **21** | **£28.12** | 2.28% | 🟢 The winner — under target |
| 2MT_Lead_UK_Andromeda_May26 | £160.19 | 1 | £160.19 | 1.62% | 🔴 Duplicate, wasted spend |
| MT_…_May26 – Leadform | £28.51 | 0 | — | 2.25% | 🔴 Instant-form variant, 0 leads |

**The single biggest, cheapest win:** the two satellite campaigns burned **£188.70 for 1 booked call** while running in parallel with the winner — same GB audience, same interests, competing in the same auction. Had you run **only** the winner, blended CPA would have been **£28, not £35** — a **20% improvement for free.** This is exactly the "one campaign / one ad set" consolidation your own June memo called for; the account did the opposite.

---

## 3. Account Structure — 63/100

**What's right (credit where due):**
- ✅ **Optimization goal = `OFFSITE_CONVERSIONS`** on the website Lead/booked-call event — the "optimizing for clicks / the wrong event" failure mode is **genuinely fixed**. The 22 leads are attributed via `offsite_conversion.fb_pixel_lead`.
- ✅ CBO + `LOWEST_COST_WITHOUT_CAP`, Advantage+ placements (automatic) — appropriate.
- ✅ Naming convention is clean and dated.

**What's wrong:**
- 🔴 **Three parallel lead campaigns, 4 overlapping ad sets**, all targeting GB 25-65 with near-identical interests (Brand management, Financial services, Professional services, Marketing strategy). Textbook **audience overlap** → self-competition, split learning, inflated CPA.
- 🟠 **Never exits Learning.** 22 conversions / 30 days ≈ **5 per week** vs the **50/week** an ad set needs to leave Learning. At ~£26/day you optimize on a thin signal indefinitely. Either accept semi-Learning (fewer creatives, patience on kills) or scale to **~£70–100/day** *if* the £28 CPA holds and calls are closing.
- 🟡 **46 legacy paused campaigns** (Heat-Plex, Medlocums, old IG boosts) + 86 ad sets clutter the account. Archive them.

---

## 4. Creative — 55/100 (real performance, not guesses)

### Winners vs losers (30d, by spend)
| Ad | Spend | Booked | CPA | CTR | Quality | Call |
|---|---|---|---|---|---|---|
| **AWR-01_brand_looks_unclear** | £86.58 | 6 | **£14.43** | 1.88% | AVERAGE | 🟢 Best converter — keep |
| **DES-02_homepage_one_sentence** | £108.47 | 5 | **£21.69** | 2.13% | AVERAGE | 🟢 Keep |
| AWR-02_pitch_deck_vs_website | £211.11 | 5 | £42.22 | 2.50% | AVERAGE | 🟡 Top spender, acceptable |
| DES-01_hot_take_ten_people | ~£142 | ~4 | high | 2.2% | **BELOW_AVERAGE** | 🔴 Cut — engagement-style |
| ACT-01_clear_brands_get_clients | ~£88 | 2 | high | **3.0–4.0%** | UNKNOWN | 🔴 Cut — clicks, not leads |

- 🔴 **Active creative fatigue.** Daily CTR fell from **~3.0% (early May) to ~1.3% (late May)** — a **~57% drop**, well past the 20%/14-day FAIL threshold. Leads followed: ~all 22 landed **before 19 May**; the last 9 days produced ~1. The fatigue is *why the account stalled* — and it was never refreshed.
- 🔴 **Still 100% static.** Live ad names confirm the planned `VID-01` / `VID-02` videos **never shipped.** Static gets down-weighted in Reels/Stories (where Advantage+ Placements is sending budget). Your testimonials (Chris/Police Mortgages, etc.) are still unused.
- 🟠 **Budget wasted on engagement-bait.** ACT-01 pulls a 3–4% CTR but barely converts; DES-01 ranks BELOW_AVERAGE. Together ~£230 for ~6 leads.

**Creative is the real lever for the relaunch** — keep AWR-01 + DES-02, cut DES-01 + ACT-01, and add 2 fresh, including **one founder-testimonial video**.

---

## 5. Audience — 67/100

- ✅ **Advantage+ Audience ON** (3 of 4 ad sets) with one manual control — good test design. Interest stack is sensible; frequency 2.14 = no saturation.
- 🔴 **Retargeting is empty.** All website pools (`WEB_AllVisitors_30d`, `WEB_Converters_180d`, `WEB_Engaged25pct_30d`, `Website Visitors 180d`) show **~20 users** — below the 1,000 minimum to run. Not enough site traffic yet; they'll fill once prospecting resumes.
- 🔴 **No Milktree lookalike.** The only LAL in the account is **`Lookalike (GB 3%) – Heat-Plex`** — a *different/old client*, and not even ready. Build a LAL off your **22 booked-call leads** (small seed, but it grows; upload the list or seed off the offsite conversion).
- 🟡 Age inconsistent across ad sets (25-65, 25-50, 18-65). Standardize to **25-65** — 18-24 won't be £1k+ budget business owners. Plus leftover Heat-Plex audiences to archive.

---

## 6. Pixel / CAPI — 74/100 (code-verified + live-confirmed)

Live data confirms the pipe works: `lead`, `offsite_conversion.fb_pixel_lead`, and `offsite_lead_add_20_s_calls` all = 22, plus 44 custom + 37 view_content. Dedup architecture, server-side IP, hashed matching, and `external_id` are all correctly built (see repo). **Three fixes still stand from the code audit** — fix before relaunch so the new spend optimizes on clean data:

1. 🔴 **`ThankYouPage` double-fires Lead+Schedule** (no `!isBooked` guard; [pages/ThankYouPage.tsx:77](pages/ThankYouPage.tsx:77)) — inflates homepage-path conversions. The `/audit` page is guarded; `/thank-you` isn't.
2. 🟠 **Country in the wrong field** — `'gb'` hashed into `ct` (city), should be `country` ([utils/meta-tracking.ts:140](utils/meta-tracking.ts:140)).
3. 🟠 **`Lead` currency `USD`** on a GBP account ([utils/meta-tracking.ts:296](utils/meta-tracking.ts:296)).

*Not pullable via API — verify in Events Manager:* EMQ score on the Lead event (target ≥6.0) and the Pixel↔CAPI dedup rate (≥90%).

---

## 7. Prioritized action plan (for the relaunch)

**Before you unpause — do these first:**
1. **Consolidate to ONE campaign, ONE ad set** — relaunch only `MT_Lead_UK_Andromeda_May26`; archive `2MT_…` and `…Leadform`. *(£35 → £28 CPA, immediate.)*
2. **Refresh creative** — keep **AWR-01 + DES-02**, cut **DES-01 + ACT-01**, add 2 new incl. **1 founder-testimonial video**. Don't relaunch the fatigued static set as-is.
3. **Patch the 3 tracking bugs** (§6) so the new conversion signal is clean.

**At/after relaunch:**
4. Keep optimization = OFFSITE_CONVERSIONS, Advantage+ Audience, GB **25-65**, the proven interest stack.
5. **Budget decision:** stay ~£30/day (accept semi-Learning, ~5 leads/wk) **or** scale to £70–100/day to chase Learning exit — only if calls are closing at a profit.
6. **Build a Milktree lookalike** off the 22 booked-call leads; retire the Heat-Plex LAL.
7. Add a **retargeting ad set** once prospecting refills the (currently empty) website pools.
8. **Housekeeping:** archive the 46 legacy campaigns + Heat-Plex audiences.
9. **Verify EMQ + dedup** in Events Manager (screenshot).

---

*Method: `ads-meta` skill, 46-check framework, scored on live Marketing API data (30-day window). Pixel/CAPI findings cross-verified against repository code. EMQ/dedup pending Events Manager. Token used for this pull is `ads_read` only and should be revoked now that the audit is complete.*
