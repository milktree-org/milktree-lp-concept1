import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ReferralForm } from "@/components/funnel/referral-form";
import { JsonLd } from "@/components/seo/json-ld";
import { referralOffer } from "@/lib/referral";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Refer a business — get a sprint on us",
  description:
    "Introduce a business that becomes a Brand Build and get a free Brand Reset Sprint or a month's credit on your subscription.",
  path: "/refer",
});

/**
 * Referral page (PRD 3.4). Referrals from clients and partners are the top
 * source of new business for UK agencies (marketing/growth-strategy-research.md
 * §3.1), so this is a first-class page, not a footer link.
 */
export default function ReferPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Refer a business", path: "/refer" }])} />
      <section className="container-edge pb-24 pt-32 md:pb-36 md:pt-44">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Refer a business</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h1 className="mt-6 text-balance text-[clamp(2.4rem,6vw,4.5rem)] font-bold uppercase leading-[0.98] tracking-[-0.025em] [font-family:var(--font-heading)] [font-stretch:75%]">
                {referralOffer.headline}
              </h1>
            </Reveal>
            <Reveal index={2}>
              <p className="text-body-lg mt-6">{referralOffer.line}</p>
            </Reveal>
            <Reveal index={3}>
              <p className="text-body mt-4 text-[0.95rem]">{referralOffer.shareHint}</p>
            </Reveal>
            <StaggerGroup className="mt-10 divide-y divide-border border-y border-border">
              {referralOffer.terms.map((t, i) => (
                <StaggerItem key={t} className="flex gap-5 py-4">
                  <span className="text-sm font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[0.95rem] text-muted-foreground">{t}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
          <Reveal index={2}>
            <div className="rounded-[2rem] border border-border bg-surface p-6 md:p-10">
              <ReferralForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
