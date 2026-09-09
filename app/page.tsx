import { Hero } from "@/components/sections/hero";
import { WorkStrip } from "@/components/sections/work-strip";
import { Symptoms } from "@/components/sections/symptoms";
import { ThreeWays } from "@/components/sections/three-ways";
import { WhyMilktree } from "@/components/sections/why-milktree";
import { Proof } from "@/components/sections/proof";
import { WhoItsFor } from "@/components/sections/who-its-for";
import { Faq } from "@/components/sections/faq";
import { AboutBand } from "@/components/sections/about-band";
import { FinalCTA } from "@/components/sections/final-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd, serviceJsonLd } from "@/lib/seo";

/**
 * Homepage (MILKTREE-STUDIO.md §6.1): hook → the work → the symptoms → the
 * three ways to buy → why us → proof → who it's for → the studio →
 * objections → close. The queue showcase lives on /how-it-works and the
 * Instagram grid on /about, so nothing outbound sits ahead of the ask.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={[serviceJsonLd(), faqJsonLd()]} />
      <Hero />
      <WorkStrip className="border-y border-border bg-surface py-16 md:py-24" />
      <Symptoms />
      <ThreeWays />
      <WhyMilktree />
      <Proof />
      <WhoItsFor />
      <AboutBand />
      <Faq />
      <FinalCTA />
    </>
  );
}
