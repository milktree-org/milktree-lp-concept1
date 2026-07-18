import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { includedFootnote } from "@/lib/site";

type Chapter = {
  n: string;
  label: string;
  headline: string;
  image: { src: string; alt: string };
  disciplines: string[];
};

const chapters: Chapter[] = [
  {
    n: "1",
    label: "Brand",
    headline: "Identities and guidelines that hold up everywhere.",
    image: {
      src: "/work/portfolio/alltrad-swatches.webp",
      alt: "Alltrad Roofing brand system swatches",
    },
    disciplines: [
      "Brand identity",
      "Logo & systems",
      "Guidelines",
      "Rebrands",
      "Naming & tone",
    ],
  },
  {
    n: "2",
    label: "Campaigns",
    headline: "Always-on creative that keeps your feed and funnel sharp.",
    image: {
      src: "/work/portfolio/flexibuy.webp",
      alt: "FlexiBuy campaign creative",
    },
    disciplines: [
      "Social & templates",
      "Static ads",
      "Simple motion",
      "Campaign creative",
    ],
  },
  {
    n: "3",
    label: "Sales & digital",
    headline: "Decks, email and landing pages engineered to convert.",
    image: {
      src: "/work/portfolio/mint-broker.webp",
      alt: "Mint Mortgages broker collateral",
    },
    disciplines: [
      "Pitch decks",
      "Sales collateral",
      "Email design",
      "Landing page & web design",
    ],
  },
  {
    n: "4",
    label: "Physical",
    headline: "Packaging, print and out-of-home, done properly.",
    image: {
      src: "/work/portfolio/eazyphone-busstop.webp",
      alt: "EazyPhone bus stop out-of-home",
    },
    disciplines: ["Packaging", "Print", "Presentations", "Out-of-home"],
  },
];

/**
 * What's included — Büro-style numbered chapters. Oversized numeral, small
 * label, headline, a work still and the discipline list. This is where the
 * portfolio weaves into the offer.
 */
export function C2Services() {
  return (
    <section id="services" className="container-edge py-24 md:py-36">
      <Reveal className="max-w-3xl">
        <p className="c2-label">(What&rsquo;s included)</p>
        <h2 className="text-h2 mt-6 text-foreground">
          One subscription. Every kind of design.
        </h2>
      </Reveal>

      <div className="mt-16 md:mt-24">
        {chapters.map((chapter) => (
          <Reveal
            key={chapter.n}
            className="grid gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-6 md:py-16"
          >
            <div className="flex items-start justify-between md:col-span-3 md:block">
              <span
                aria-hidden
                className="block font-bold leading-[0.8] tracking-[-0.04em] text-foreground [font-size:clamp(4.5rem,9vw,9.5rem)]"
              >
                {chapter.n}
              </span>
              <span className="c2-label mt-3 md:mt-6 md:block">
                ({chapter.label})
              </span>
            </div>

            <div className="md:col-span-5 md:col-start-5">
              <h3 className="max-w-xl text-balance font-bold leading-[1.1] tracking-[-0.02em] text-foreground [font-size:clamp(1.5rem,2.6vw,2.25rem)]">
                {chapter.headline}
              </h3>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                {chapter.disciplines.map((discipline) => (
                  <li
                    key={discipline}
                    className="text-[0.95rem] font-medium text-muted-foreground"
                  >
                    {discipline}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 md:col-start-10">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-surface">
                <Image
                  src={chapter.image.src}
                  alt={chapter.image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="border-t border-border pt-8">
        <p className="text-sm font-medium text-faint">{includedFootnote}</p>
      </Reveal>
    </section>
  );
}
