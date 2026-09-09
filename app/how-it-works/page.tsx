import type { Metadata } from "next";
import { ProductHero } from "@/components/product/product-hero";
import { ProductCta } from "@/components/product/product-cta";
import { LadderSteps } from "@/components/product/ladder-steps";
import { Steps } from "@/components/product/steps";
import { WayWeWork } from "@/components/sections/way-we-work";
import { Faq } from "@/components/sections/faq";
import { JsonLd } from "@/components/seo/json-ld";
import { buildProcess, sprintTimeline } from "@/lib/offer";
import { site } from "@/lib/site";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

const description =
  "How working with Milktree runs: a two-week sprint, a six-week brand build, or a subscription queue. What happens on day one, what you decide, and what you get at the end.";

export const metadata: Metadata = pageMeta({
  title: "How it works — sprint, build, subscription",
  description,
  path: "/how-it-works",
});

/**
 * How it works (spec §4). The ladder as a process, then each rung in
 * detail, then the pinned queue showcase for the subscription.
 */
export default function HowItWorks() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "How it works", path: "/how-it-works" }])} />
      <ProductHero
        eyebrow="How it works"
        lines={["No proposals.", "No quotes.", "Just the work."]}
        sub="Every product runs to a fixed process with a fixed price. You make a handful of decisions at known points. We run everything else. Here's what actually happens."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
      />

      <LadderSteps />

      <Steps
        id="sprint"
        eyebrow="A sprint, day by day"
        title="Two weeks. Two decisions. One round of notes."
        steps={sprintTimeline.map((t) => ({ n: t.day.replace("Day ", "D"), meta: t.day, title: t.title, body: t.body }))}
        layout="row"
      />

      <Steps
        id="build"
        eyebrow="A brand build, week by week"
        title="Workshop to handover in six weeks."
        intro="The big decision happens in week two, on rough drawings, before anything expensive is designed."
        steps={buildProcess.map((s) => ({ n: s.n, meta: s.week, title: s.title, body: s.body }))}
        layout="list"
        className="border-y border-border bg-surface"
      />

      {/* The subscription queue — the pinned showcase */}
      <WayWeWork />

      <Faq />

      <ProductCta
        title="Start where the problem is."
        body="Two minutes to tell us what you need. We'll point you at the right product and book a call."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
        source="How it works — final CTA"
      />
    </>
  );
}
