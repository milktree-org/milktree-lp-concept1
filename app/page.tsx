import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { NewWay } from "@/components/sections/new-way";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WayWeWork } from "@/components/sections/way-we-work";
import { Services } from "@/components/sections/services";
import { Proof } from "@/components/sections/proof";
import { InstagramSection } from "@/components/sections/instagram";
import { CtaBand } from "@/components/sections/cta-band";
import { WhyMilktree } from "@/components/sections/why-milktree";
import { Plans } from "@/components/sections/plans";
import { Faq } from "@/components/sections/faq";
import { CareersBand } from "@/components/sections/careers-band";
import { FinalCTA } from "@/components/sections/final-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd, serviceJsonLd } from "@/lib/seo";

/**
 * Homepage flow follows the conversion sequence the category leaders use:
 * hook → problem → reframe → mechanism → what's included → proof → ask →
 * comparison → price → objections → close. Proof always lands before price.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={[serviceJsonLd(), faqJsonLd()]} />
      <Hero />
      <Problem />
      <NewWay />
      <HowItWorks />
      <WayWeWork />
      <Services />
      <Proof />
      <InstagramSection />
      <CtaBand />
      <WhyMilktree />
      <Plans />
      <Faq />
      <CareersBand />
      <FinalCTA />
    </>
  );
}
