# Meta Ads — Design Hire Calculator (Lead Magnet Campaign)

**Destination:** `milktreeagency.com/hire-calculator`
**CTA button:** **Learn More** (softer than "Get Started" — this is a free tool,
the button should promise information, not commitment)
**Conversion event:** `HireCalculatorLead` custom event fires on email submit —
create a custom conversion from it in Events Manager and optimise the ad set
against that, not link clicks.

All statics. Black canvas, huge Satoshi type, one yellow element per creative.
Build in 1:1 and 4:5. Voice: no hype, no exclamation marks, no emoji.

The offer in every ad is the same: *find out the real number in 30 seconds,
free, no call, no sales pitch.* Free tool ads outperform service ads on cold
traffic because the click costs the user nothing — let the calculator and the
email report do the selling.

---

## Ad 1 — The gap hook

**On-image hook:**
> The job ad says £65,000. The real cost is £100,275.

**Support line:**
> Free calculator: the true first-year cost of a UK design hire, in 30 seconds.

**Yellow element:** "£100,275" only.

**Headline:** What does a design hire really cost?
**Description:** Free UK calculator. 30 seconds.

**Primary text:**

The salary is the headline number. It's not the real number.

Employer National Insurance. Pension. The 20% recruitment fee. Software and kit. Three months of ramp-up before they're at full speed.

Our free calculator adds it all up in 30 seconds — pick the role, set the salary, see the true first-year cost. Then decide if the hire still makes sense.

No call. No pitch. Just the number the job ad doesn't show.

---

## Ad 2 — The CFO hook

**On-image hook:**
> Send this to whoever signs off the design hire.

**Support line:**
> The true first-year cost, itemised. Free, takes 30 seconds.

**Yellow element:** underline on "whoever signs off".

**Headline:** The number your CFO will ask for
**Description:** Itemised first-year cost, emailed to you.

**Primary text:**

Before you write the job ad, get the number the budget conversation will actually be about.

Our free Design Hire Calculator itemises the true first-year cost of a UK design hire — salary, employer NI, pension, recruitment, software, ramp-up time — and emails you the breakdown as a one-pager.

30 seconds to fill in. Built by Milktree, the team behind 200+ brands.

---

## Ad 3 — The line-item hook

**On-image hook (stacked, receipt-style):**
> Salary £65,000
> Employer NI £9,000
> Recruitment £13,000
> Ramp-up £8,125
> …

**Support line:**
> See your full number. Free calculator, 30 seconds.

**Yellow element:** the running total at the bottom of the receipt.

**Headline:** Every hidden cost of a design hire
**Description:** Free UK calculator. No email needed to see it.

**Primary text:**

Six line items stand between the salary and what a design hire actually costs:

Base salary. Employer National Insurance. Pension. Recruitment fees. Software and kit. Three months of ramp-up at half speed.

Most of them never make it into the hiring conversation. Our free calculator puts them all on one screen in 30 seconds — adjust the salary, watch the real number move.

---

## Ad 4 — The question hook

**On-image hook:**
> Hiring a designer this year?

**Support line:**
> Run the numbers first. Free calculator — the true cost in 30 seconds.

**Yellow element:** "this year?" or the CTA chip.

**Headline:** Run the numbers before the job ad
**Description:** True first-year cost, free, 30 seconds.

**Primary text:**

If a design hire is on your roadmap for this year, spend 30 seconds on this first.

Our free calculator shows the true first-year cost — salary, employer NI, pension, recruitment fee, kit and ramp-up time, itemised. For most senior roles the real number lands 50–60% above the salary.

You might still hire. But you'll walk into the budget conversation with the actual figure.

---

## Ad 5 — The ramp-up hook

**On-image hook:**
> Your new designer won't be at full speed until month four.

**Support line:**
> Ramp-up is one of six costs the job ad doesn't show. Calculate all of them, free.

**Yellow element:** "month four."

**Headline:** The costs hiding behind the salary
**Description:** Free calculator, itemised, 30 seconds.

**Primary text:**

The industry average for a new hire to reach full productivity: about three months. That's a quarter of year one at half output — on full pay.

It's one of six costs that never appear in the job ad. Employer NI, pension, recruitment fees, software and kit are the others.

Our free calculator itemises all of them in 30 seconds. Know the real number before you commit to it.

---

## Ad 6 — The maths hook (bridges straight to the offer)

**On-image hook:**
> £100,275 for one hire. Or £47,988 for a whole team.

**Support line:**
> Run your own numbers — free calculator, 30 seconds.

**Yellow element:** "£47,988".

**Headline:** One hire vs a whole design team
**Description:** Compare the real numbers, free.

**Primary text:**

A design lead at £65k really costs over £100k in year one, once NI, pension, recruitment and ramp-up are counted. And it buys one skill set.

Our free calculator shows your exact number in 30 seconds — then puts it side by side with what a full senior design team costs on subscription.

Run the numbers. Keep the breakdown. Make the call with the real figures.

---

## Extra headline variants (multi-text fields)

- The true cost of a UK design hire
- Your design hire costs more than you think
- 30 seconds. The real number.
- Free: the design hire cost calculator
- What £65k really costs in year one

## Campaign notes

- **This campaign and the /start campaign serve different temperatures.**
  Calculator ads catch people 3–12 months from buying; /start ads catch people
  ready now. Run both — calculator leads feed the nurture list.
- Ads 1–5 are pure lead-magnet (soft sell); ad 6 bridges to the subscription
  and will attract warmer clicks at higher cost — good second-week addition
  once you have baseline numbers.
- The example figures (£100,275 / £65k / £47,988) are the calculator's real
  output for a design lead hired via agency outside London — recalculate and
  update creatives if the model in `lib/calculator.ts` changes.
- Retarget calculator visitors who didn't submit an email with the /start
  campaign's proof ad (200+ brands) — they know the maths now; show them
  the work.
