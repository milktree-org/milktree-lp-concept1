import { C2Header } from "@/components/sections/concept2/c2-header";
import { C2Hero } from "@/components/sections/concept2/c2-hero";
import { C2Marquee } from "@/components/sections/concept2/c2-marquee";
import { C2Problem } from "@/components/sections/concept2/c2-problem";
import { C2Services } from "@/components/sections/concept2/c2-services";
import { C2How } from "@/components/sections/concept2/c2-how";
import { C2Proof } from "@/components/sections/concept2/c2-proof";
import { C2Compare } from "@/components/sections/concept2/c2-compare";
import { C2Plans } from "@/components/sections/concept2/c2-plans";
import { C2Faq } from "@/components/sections/concept2/c2-faq";
import { C2Final } from "@/components/sections/concept2/c2-final";

/**
 * Light editorial concept — Vucko-style typographic hero on white, Büro-style
 * numbered services, Pentagram-style proof grid, Ditto-style pricing, and a
 * single dark contrast block for the final CTA + footer.
 */
export default function ConceptLightPage() {
  return (
    <>
      <C2Header />
      <C2Hero />
      <C2Marquee />
      <C2Problem />
      <C2Services />
      <C2How />
      <C2Proof />
      <C2Compare />
      <C2Plans />
      <C2Faq />
      <C2Final />
    </>
  );
}
