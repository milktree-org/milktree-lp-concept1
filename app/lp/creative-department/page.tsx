import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Wordmark } from "@/components/layout/wordmark";
import { StartButton } from "@/components/layout/start-button";
import {
  plans,
  planCtaNote,
  planVatNote,
  getPlanTaxSuffix,
  testimonials,
} from "@/lib/site";

// UK-only campaign, so the GBP defaults from lib/site are correct here. If this
// page is ever pointed at non-UK traffic, swap to the useCurrency() hook the
// homepage plans section uses.
const planTaxSuffix = getPlanTaxSuffix();

/**
 * Paid-traffic landing page for the Meta "Calls Booked" campaign.
 *
 * Deliberately NOT the homepage. Three constraints drive every decision here:
 *
 *   1. 96% of delivery is the Facebook / Instagram in-app browser, so this is
 *      designed mobile-first and ships no video, no carousel and no marquee.
 *   2. The ad set optimises for `Contact`, which fires from <StartButton>. So
 *      every CTA on this page is a StartButton — nothing else is clickable,
 *      and the header/footer are suppressed via SiteChrome. No escape routes.
 *   3. Cold traffic that has read one line of ad copy needs the price early.
 *      Showing £1,999 above the fold disqualifies the wrong people before we
 *      pay for their form fill, which is the point.
 *
 * Copy and proof are pulled from lib/site.ts so this page can never drift from
 * the pricing and testimonials the rest of the site shows. Nothing is invented.
 */

export const metadata: Metadata = {
  title: "Your creative department, on demand",
  description:
    "Unlimited brand and design work, senior quality, back in about 48 hours. One flat monthly fee from £1,999. No hiring, no freelancer roulette.",
  // Paid-only page: keep it out of the index so it never competes with the
  // homepage or splits organic authority. `follow: true` matches /start and
  // /book — Meta crawls ad destinations during review, and app/robots.ts
  // deliberately does not Disallow these for exactly that reason.
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

const PAINS = [
  {
    title: "Freelancers vanish",
    body: "You budget for a designer and get a group chat that goes quiet. Then they take a salary somewhere else and you start again.",
  },
  {
    title: "Hiring is slow and final",
    body: "Three months to recruit, £65k+ a year before NI and holiday cover, and you get exactly one skill set.",
  },
  {
    title: "Agencies quote per project",
    body: "Every small change is a scope conversation. The work stalls while someone writes an estimate.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a plan",
    body: "Essentials or Design Lead. No proposals, no quotes, no hourly billing.",
  },
  {
    n: "02",
    title: "Send requests",
    body: "Brand, social, ads, decks, email, web, packaging, print. One request is one deliverable.",
  },
  {
    n: "03",
    title: "Work comes back",
    body: "About 48 hours, senior standard, one revision round included. Keep going or pause.",
  },
];

export default function CreativeDepartmentLandingPage() {
  return (
    <>
      {/* Brand mark only — deliberately not a link. The whole page has one
          destination and the logo is the most-clicked way off a landing page. */}
      <div className="container-edge flex items-center justify-between pt-7 sm:pt-9">
        <Wordmark />
        <span className="hidden text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint sm:inline">
          UK · Since 2020
        </span>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container-edge pb-16 pt-10 sm:pb-24 sm:pt-16">
        <Reveal>
          <Eyebrow>Design subscription</Eyebrow>
        </Reveal>

        <Reveal index={1}>
          <h1 className="mt-6 max-w-4xl text-balance text-[clamp(2.5rem,8.5vw,5.5rem)] font-black leading-[0.95] tracking-[-0.03em]">
            Your creative department.{" "}
            <span className="text-brand">On demand.</span>
          </h1>
        </Reveal>

        <Reveal index={2}>
          <p className="text-body-lg mt-6 max-w-xl">
            Unlimited brand and design work, senior standard, back in about 48
            hours &mdash; for one flat monthly fee. No hiring. No freelancer
            roulette. No waiting weeks.
          </p>
        </Reveal>

        <Reveal index={3}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <StartButton
              size="pill-lg"
              magnetic
              source="LP Creative Dept — Hero"
              className="w-full sm:w-auto"
            />
            <p className="text-center text-sm font-medium text-faint sm:text-left">
              From{" "}
              <span className="font-bold text-foreground">
                {plans[0].price}/mo
              </span>{" "}
              {planTaxSuffix}
            </p>
          </div>
        </Reveal>

        <Reveal index={4}>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2.5 text-[0.82rem] font-bold uppercase tracking-[0.14em] text-faint">
            {[
              "200+ brands built",
              "6 years as an agency",
              "No contracts",
              "Pause anytime",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden className="h-1 w-1 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ── The problem ──────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-16 sm:py-24">
        <div className="container-edge">
          <Reveal>
            <h2 className="max-w-2xl text-balance text-[clamp(1.9rem,5vw,3.25rem)] font-black leading-[1.03] tracking-[-0.025em]">
              Your team has the ideas. Not the firepower to ship them.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {PAINS.map((pain, i) => (
              <Reveal key={pain.title} index={i} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-card/60 p-6">
                  <h3 className="text-[1.15rem] font-bold tracking-tight">
                    {pain.title}
                  </h3>
                  <p className="text-body mt-2.5 text-[0.95rem]">{pain.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container-edge">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
          </Reveal>

          <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} index={i}>
                <div className="border-t border-border pt-5">
                  <span className="text-[0.82rem] font-black tracking-[0.14em] text-brand">
                    {step.n}
                  </span>
                  <h3 className="mt-3 text-[1.25rem] font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-body mt-2 text-[0.95rem]">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal index={3}>
            <div className="mt-12">
              <StartButton
                size="pill-lg"
                source="LP Creative Dept — How it works"
                className="w-full sm:w-auto"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface py-16 sm:py-24">
        <div className="container-edge">
          <Reveal>
            <h2 className="max-w-2xl text-balance text-[clamp(1.9rem,5vw,3.25rem)] font-black leading-[1.03] tracking-[-0.025em]">
              A whole creative department for less than one hire.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} index={i} className="h-full">
                <div
                  className={[
                    "flex h-full flex-col rounded-3xl border p-7 sm:p-9",
                    plan.featured
                      ? "border-brand/45 bg-card"
                      : "border-border bg-background/40",
                  ].join(" ")}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[1.35rem] font-bold tracking-tight">
                      {plan.name}
                    </h3>
                    {plan.featured && plan.note && (
                      <span className="rounded-full bg-brand px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-brand-ink">
                        {plan.note}
                      </span>
                    )}
                  </div>

                  <p className="text-body mt-2 text-[0.95rem]">{plan.summary}</p>

                  <p className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-[clamp(2.4rem,7vw,3.4rem)] font-black leading-none tracking-[-0.03em]">
                      {plan.price}
                    </span>
                    <span className="text-base font-bold text-faint">
                      {plan.cadence}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[0.8rem] font-medium text-faint">
                    {planVatNote}
                  </p>

                  <ul className="mt-7 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[0.94rem]">
                        <Check
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-brand"
                        />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <StartButton
                      size="pill"
                      variant={plan.featured ? "brand" : "ghostPill"}
                      source={`LP Creative Dept — ${plan.name}`}
                      className="w-full"
                    >
                      {plan.cta}
                    </StartButton>
                    <p className="mt-3 text-center text-[0.78rem] font-medium text-faint">
                      {planCtaNote}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container-edge">
          <Reveal>
            <Eyebrow>What clients say</Eyebrow>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} index={i} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6">
                  <blockquote className="flex-1 text-[1.02rem] font-medium leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {t.avatar && (
                      <Image
                        src={t.avatar}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    )}
                    <span className="text-[0.85rem] leading-tight">
                      <span className="block font-bold">{t.name}</span>
                      <span className="block text-faint">
                        {t.role}, {t.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20 sm:py-28">
        <div className="container-edge">
          <Reveal>
            <h2 className="max-w-3xl text-balance text-[clamp(2rem,6vw,4rem)] font-black leading-[0.98] tracking-[-0.03em]">
              Your business has outgrown its brand.{" "}
              <span className="text-brand">Let&rsquo;s fix that.</span>
            </h2>
          </Reveal>

          <Reveal index={1}>
            <p className="text-body-lg mt-5 max-w-lg">
              Six quick questions and we&rsquo;ll point you at exactly the right
              thing. Takes under a minute.
            </p>
          </Reveal>

          <Reveal index={2}>
            <div className="mt-9">
              <StartButton
                size="pill-lg"
                magnetic
                source="LP Creative Dept — Final CTA"
                className="w-full sm:w-auto"
              />
              <p className="mt-3 text-[0.82rem] font-medium text-faint">
                {planCtaNote}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Minimal legal footer — the only links on the page, and only because
          they have to be. Privacy is a regulatory requirement, not an exit. */}
      <footer className="border-t border-border py-8">
        <div className="container-edge flex flex-col gap-2 text-[0.78rem] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Milktree. All rights reserved.</p>
          <a
            href="/privacy"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Privacy policy
          </a>
        </div>
      </footer>
    </>
  );
}
