import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { NewWay } from "@/components/sections/new-way";
import { Services } from "@/components/sections/services";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WayWeWork } from "@/components/sections/way-we-work";
import { WhyMilktree } from "@/components/sections/why-milktree";
import { Proof } from "@/components/sections/proof";
import { Stats } from "@/components/sections/stats";
import { Plans } from "@/components/sections/plans";
import { Insights } from "@/components/sections/insights";
import { InstagramSection } from "@/components/sections/instagram";
import { FinalCTA } from "@/components/sections/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <NewWay />
      <Services />
      <HowItWorks />
      <WayWeWork />
      <WhyMilktree />
      <Proof />
      <Stats />
      <Plans />
      <Insights />
      <InstagramSection />
      <FinalCTA />
    </>
  );
}
