# Meta Ads — Automated Brand Audit (Lead Magnet Campaign)

**Destination:** `milktreeagency.com/brand-audit`
**CTA button:** **Learn More**
**Conversion event:** `BrandAuditComplete` custom event (fires with the score
and email when the audit finishes) — build a custom conversion on it in
Events Manager and optimise against that.

All statics. Black canvas, huge Satoshi type, one yellow element per creative.
The differentiator vs every "free audit" ad on Meta: this one is AUTOMATED and
IMMEDIATE — no call booking, no "we'll get back to you", no salesperson. Say
that loudly; it removes the #1 fear of clicking an audit ad.

---

## Ad 1 — The no-call hook

**On-image hook:**
> A brand audit with no sales call attached.

**Support line:**
> Enter your website. Get the findings in about a minute. Free.

**Yellow element:** "no sales call".

**Headline:** Your brand, audited in a minute
**Description:** Automated. Free. No call required.

**Primary text:**

Most "free brand audits" are a sales call wearing a disguise.

This one is a machine. Enter your website and we read your actual brand — headline, colour palette, typography — then check who owns page 1 of Google in your market. You get the findings on screen in about a minute, plus the full report by email.

No call. No pitch deck. Just what we found, including the things that are working.

---

## Ad 2 — The page-1 hook

**On-image hook:**
> Three companies own page 1 of Google in your market. Are you one of them?

**Support line:**
> Free automated audit — live search results, about a minute.

**Yellow element:** "page 1".

**Headline:** See who really owns your market
**Description:** Live Google data, free, one minute.

**Primary text:**

Your customers type the same few searches before they buy. A handful of companies own those results — and collect the enquiries.

Our free automated audit checks your market's live Google results, shows you exactly who's on page 1, where you rank, and how their brands compare to yours side by side.

About a minute. Real data. If we can't find something, we say so rather than making it up.

---

## Ad 3 — The mirror hook

**On-image hook:**
> Your website is telling customers something. Do you know what?

**Support line:**
> We read your headline, palette and type — and tell you straight. Free.

**Yellow element:** "something."

**Headline:** What your brand actually says
**Description:** Automated read of your real website.

**Primary text:**

You look at your website every day, which is exactly why you can't see it anymore.

Our free audit reads it cold, like a customer does: the headline message, the colour palette, the typography, the search snippet Google shows. Then it benchmarks all of it against the three companies dominating your market.

Findings in about a minute. The fixes are usually smaller than people fear — and more visible than they expect.

---

## Ad 4 — The score hook

**On-image hook:**
> Your brand has a score. Most owners have never seen it.

**Support line:**
> Search visibility + brand presentation, out of 100. Free, automated.

**Yellow element:** a big "?/100".

**Headline:** Get your brand score out of 100
**Description:** Free automated audit, about a minute.

**Primary text:**

We score brands out of 100 on two things that decide whether customers pick you: whether you show up (live Google positions for the searches your market actually types) and how you look when they arrive (headline, palette, typography — read from your real website).

The audit is fully automated and free. Enter your website, get your score and the findings in about a minute, keep the full report by email.

---

## Ad 5 — The competitor hook (uncomfortable, high CTR)

**On-image hook:**
> Your competitors' brands, side by side with yours.

**Support line:**
> Palettes, headlines, Google positions — extracted live. Free audit.

**Yellow element:** one swatch in a row of grey swatches.

**Headline:** You vs the top 3 in your market
**Description:** Side-by-side brand comparison, free.

**Primary text:**

Ever actually lined your brand up next to the three companies winning your market?

Our free audit does it automatically: their Google positions, their colour palettes, their headlines — pulled live from their sites — next to yours. Most founders are surprised by which side looks like the established player.

About a minute, no call, full report by email. Worth knowing either way.

---

## Ad 6 — The honesty hook (differentiates from audit-spam)

**On-image hook:**
> If your brand is fine, the audit will say so.

**Support line:**
> Real findings, not manufactured panic. Free, automated, one minute.

**Yellow element:** "fine".

**Headline:** An honest brand audit, by a machine
**Description:** No invented problems. No sales call.

**Primary text:**

Audit ads usually work by inventing problems. Ours can't — it's rules-based and only reports what it actually finds on your website and in your market's live search results.

Sometimes that's "your palette is disciplined and your headline is tight, keep going." Sometimes it's "you're invisible on Google and three competitors own your market."

Either way you'll know in about a minute, free, with the full report in your inbox.

---

## Extra headline variants (multi-text fields)

- Audit your brand in 60 seconds
- Who owns page 1 in your market?
- Your brand score, out of 100
- The audit with no call attached
- See your brand the way customers do

## Campaign notes

- **Audience temperature:** the audit converts colder traffic than the hire
  calculator (everyone has a brand; not everyone is hiring). Use it as the
  broadest prospecting layer, calculator for in-market hirers, /start ads
  for bottom-funnel.
- Ad 6 (honesty) is the brand-safest and tends to age best; ad 5
  (competitors) usually wins CTR. Start with 2, 5 and 6 if you want to
  launch with three.
- The audit requires FIRECRAWL_API_KEY and APIFY_API_TOKEN in production —
  verify both are live before scaling spend, or the "failed" fallback (which
  routes to the quiz at /brand-report) will absorb your clicks.
- Retargeting: audit completers who didn't hit /start should get the
  founding-rate ad (ad 6 in `meta-ads.md`); audit abandoners should get the
  proof ad (200+ brands).
