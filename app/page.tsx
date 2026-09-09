import { Hero } from "@/components/sections/hero";
import { WorkStrip } from "@/components/sections/work-strip";
import { Symptoms } from "@/components/sections/symptoms";
import { ThreeWays } from "@/components/sections/three-ways";
import { WayWeWork } from "@/components/sections/way-we-work";
import { WhyMilktree } from "@/components/sections/why-milktree";
import { Proof } from "@/components/sections/proof";
import { WhoItsFor } from "@/components/sections/who-its-for";
import { Faq } from "@/components/sections/faq";
import { InstagramSection } from "@/components/sections/instagram";
import { FinalCTA } from "@/components/sections/final-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd, serviceJsonLd } from "@/lib/seo";

/**
 * Homepage (MILKTREE-STUDIO.md §6.1): hook → the work → the symptoms → the
 * three ways to buy → how the studio runs a job → why us → proof → who it's
 * for → objections → close. Work lands before pricing; pricing lands before
 * proof of scale. Instagram sits after the FAQ so outbound links can't leak
 * traffic ahead of the ask.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={[serviceJsonLd(), faqJsonLd()]} />
      <Hero />
      <WorkStrip className="border-y border-border bg-surface py-16 md:py-24" />
      <Symptoms />
      <ThreeWays />
      <WayWeWork />
      <WhyMilktree />
      <Proof />
      <WhoItsFor />
      <Faq />
      <InstagramSection />
      <FinalCTA />
    </>
  );
}
