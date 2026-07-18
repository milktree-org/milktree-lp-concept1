import { C3Hero } from "@/components/sections/concept3/c3-hero";
import { C3About } from "@/components/sections/concept3/c3-about";
import { C3Work } from "@/components/sections/concept3/c3-work";
import { C3Final } from "@/components/sections/concept3/c3-final";

/**
 * Dark cinematic concept — four full-bleed moments: video hero with a
 * character-stagger headline, video intro, liquid-glass work grid, and a
 * final CTA over video with the social stack.
 */
export default function ConceptCinemaPage() {
  return (
    <>
      <C3Hero />
      <C3About />
      <C3Work />
      <C3Final />
    </>
  );
}
