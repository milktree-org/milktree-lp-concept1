# "Who it's for" homepage section — design

**Date:** 2026-07-18
**Status:** Approved approach (A — type-led audience rows), pending spec review

## Purpose

Add a "Who it's for" section to the homepage that names Milktree's three core audiences — agencies (openly pitched as white-label/overflow capacity), marketing teams that need design resource, and established businesses that value high-level design — plus a one-line disqualifier that pre-qualifies leads before they hit `/start`.

## Placement

Between `WhyMilktree` and `Plans` in `app/page.tsx`. At that point the visitor has seen proof and the comparison table; "is this for people like me?" is the question to answer immediately before pricing. The disqualifier line therefore lands just before the plans CTA traffic.

## Layout & structure

Type-led, editorial rows — **not** another card grid (the page already has 3-card trios in Problem and elsewhere).

- Section wrapper matches sibling sections: `bg-background container-edge py-24 md:py-36`.
- Header block: `Eyebrow` ("Who it's for") + `h2` in the site's `text-h2` scale. H2 direction: "Built for teams that ship." (final wording may be tuned during implementation, staying in brand voice: short, plain-spoken, no hype).
- Three full-width rows, divided by `border-border` hairlines (like a large editorial index list). Each row:
  - **Label** (eyebrow-style, small caps): "For agencies" / "For marketing teams" / "For established brands"
  - **Headline** (`text-h3` or slightly larger, weight 700–900)
  - **Body** (1–2 lines, `text-body` / `--muted`)
- Rows reveal with the standard stagger (`StaggerGroup`/`StaggerItem`, `VIEWPORT_ONCE`).
- Hover: one keyword per row headline can shift to the accent yellow on row hover (desktop only, `duration-300`). At rest the section stays monochrome so the one-yellow-per-viewport rule holds (Plans' CTA is nearby).
- Disqualifier: a single quiet sentence below the third row, `--muted-2` / small size, no card, no icon.

## Copy (source of truth for implementation)

- **For agencies** — headline: "Your overflow team, white-label." body: "Take on more work without hiring. Senior design capacity under your banner — your clients never know we exist."
- **For marketing teams** — headline: "The ideas are yours. The firepower is ours." body: "Ship campaigns, decks and landing pages without waiting on a stretched design resource."
- **For established brands** — headline: "For businesses that know design is leverage." body: "Senior-level craft on everything you put out — not just the big projects."
- **Disqualifier** — "Not the right fit if you need a one-off logo, or design isn't a priority yet."

### Copy constraints

- "Senior" is permitted here: this is brand-level copy, not per-plan copy (per CLAUDE.md the restriction applies only to per-plan Essentials copy).
- Must not clash with the Problem section, where "Agencies" is a pain card about *hiring* agencies. This section pitches *to* agencies as buyers of overflow capacity — the copy above avoids "agency" as a self-description of Milktree and never disparages agencies.
- Voice: confident, plain-spoken, short lines, no hype, no exclamation marks.

## Components & data flow

- New file `components/sections/who-its-for.tsx`, exporting `WhoItsFor`. Server component composing existing client motion primitives (`Reveal`, `StaggerGroup`, `StaggerItem`, `Eyebrow`) — same pattern as `Problem`.
- Copy lives in `lib/site.ts` as a new `audiences` export (array of `{ label, title, body }`) plus a `notAFit` string, matching how `problems` is structured.
- One-line change in `app/page.tsx`: import and render between `<WhyMilktree />` and `<Plans />`.

## Motion & accessibility

- Uses only existing motion primitives; no new variants needed. Only `transform`/`opacity` animate.
- `prefers-reduced-motion` handled automatically by the shared `Reveal`/`StaggerGroup` primitives.
- Semantics: `<section>` with proper `h2`/`h3` order; rows are static content (no interactive elements), so no focus handling needed. Contrast uses existing tokens, which pass AA.

## Error handling & testing

Static content — no runtime failure modes. Verification: lint clean, visual check in dev at mobile and desktop widths, reduced-motion check.

## Out of scope

- No dedicated `/who-its-for` page, no nav changes.
- No per-audience CTAs; the section funnels into the existing Plans → `/start` flow.
