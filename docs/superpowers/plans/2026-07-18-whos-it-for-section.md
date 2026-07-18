# "Who it's for" Section Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a type-led "Who it's for" section (agencies / marketing teams / established brands + disqualifier line) to the homepage between `WhyMilktree` and `Plans`.

**Architecture:** A server component (`components/sections/who-its-for.tsx`) composed from the existing client motion primitives (`Reveal`, `StaggerGroup`, `StaggerItem`, `Eyebrow`) — the exact pattern of `components/sections/problem.tsx`. Copy lives in `lib/site.ts` alongside the other section data. One import + render line added to `app/page.tsx`.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind (custom utilities `text-h2`, `text-h3`, `text-body`, `text-brand`, `text-muted-foreground`, `container-edge`), Framer Motion via existing primitives.

**Spec:** `docs/superpowers/specs/2026-07-18-whos-it-for-section-design.md`

**Testing note:** This repo is a static marketing site with no test runner. Verification per task is: `npx eslint` clean on touched files, `npx tsc --noEmit` (or the build) passing, and a visual check in the running dev server.

---

## Chunk 1: Full implementation

### Task 1: Audience copy data in `lib/site.ts`

**Files:**
- Modify: `lib/site.ts` (append after the `logoWordmarks` export at the end of the file)

- [ ] **Step 1: Append the data**

```ts
/* ------------------------------ Who it's for ------------------------------ */
// Editorial audience rows (§spec 2026-07-18). `keyword` is the single word
// (or hyphenated phrase) inside `title` that turns yellow on row hover —
// it must appear verbatim exactly once in `title`.
export const audiences = [
  {
    label: "For agencies",
    title: "Your overflow team, white-label.",
    keyword: "white-label",
    body: "Take on more work without hiring. Senior design capacity under your banner — your clients never know we exist.",
  },
  {
    label: "For marketing teams",
    title: "The ideas are yours. The firepower is ours.",
    keyword: "firepower",
    body: "Ship campaigns, decks and landing pages without waiting on a stretched design resource.",
  },
  {
    label: "For established brands",
    title: "For businesses that know design is leverage.",
    keyword: "leverage",
    body: "Senior-level craft on everything you put out — not just the big projects.",
  },
] as const;

export const notAFit =
  "Not the right fit if you need a one-off logo, or design isn't a priority yet.";
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

- [ ] **Step 3: Commit**

```bash
git add lib/site.ts
git commit -m "feat: audience copy data for who-it's-for section"
```

### Task 2: `WhoItsFor` section component

**Files:**
- Create: `components/sections/who-its-for.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { audiences, notAFit } from "@/lib/site";

// Splits the row title around its hover keyword so the keyword can carry
// the yellow accent on hover without duplicating copy in the data file.
function KeywordTitle({ title, keyword }: { title: string; keyword: string }) {
  const [before, after] = title.split(keyword);
  return (
    <h3 className="text-h3">
      {before}
      <span className="transition-colors duration-300 group-hover:text-brand">
        {keyword}
      </span>
      {after}
    </h3>
  );
}

/**
 * Who it's for — type-led editorial rows naming the three audiences,
 * plus a one-line disqualifier. Sits between WhyMilktree and Plans so
 * "is this for me?" is answered right before pricing.
 */
export function WhoItsFor() {
  return (
    <section id="who" className="container-edge scroll-mt-28 py-24 md:py-36">
      <div className="max-w-3xl">
        <Reveal>
          <Eyebrow>Who it&apos;s for</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6 text-balance">Built for teams that ship.</h2>
        </Reveal>
      </div>

      <StaggerGroup className="mt-16 divide-y divide-border border-y border-border">
        {audiences.map((a) => (
          <StaggerItem
            key={a.label}
            className="group grid gap-3 py-10 md:grid-cols-[16rem_1fr] md:gap-8 md:py-12"
          >
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-faint">
              {a.label}
            </span>
            <div className="max-w-2xl">
              <KeywordTitle title={a.title} keyword={a.keyword} />
              <p className="text-body mt-3">{a.body}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal index={2}>
        <p className="mt-10 text-[0.95rem] text-muted-foreground">{notAFit}</p>
      </Reveal>
    </section>
  );
}
```

Notes for the implementer:
- `StaggerItem` must accept `className` (it does — see `components/sections/problem.tsx` for identical usage).
- The label row style (`text-[0.78rem] … text-faint`) is copied verbatim from `problem.tsx` so the two sections' eyebrow-labels match.
- The disqualifier uses `text-muted-foreground` (the `--muted` token, AA-safe), per the spec — NOT `text-faint`.
- No `"use client"` — this is a server component; motion lives in the imported primitives.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc --noEmit && npx eslint components/sections/who-its-for.tsx`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add components/sections/who-its-for.tsx
git commit -m "feat: WhoItsFor homepage section"
```

### Task 3: Wire into the homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Import and render**

Add to the imports:

```tsx
import { WhoItsFor } from "@/components/sections/who-its-for";
```

Render between `<WhyMilktree />` and `<Plans />`:

```tsx
      <WhyMilktree />
      <WhoItsFor />
      <Plans />
```

- [ ] **Step 2: Verify in the browser**

Run the dev server (`npm run dev`) and check `http://localhost:3000`:
- Section appears after the comparison table, before pricing.
- Rows stagger in once on scroll; keywords turn yellow on row hover (desktop).
- Mobile (~375px): label stacks above headline, nothing overflows.
- With `prefers-reduced-motion` emulated: content appears instantly, fully readable.

- [ ] **Step 3: Full build check**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add WhoItsFor section to homepage flow"
```
