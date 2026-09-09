import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductHero } from "@/components/product/product-hero";
import { ProductCta } from "@/components/product/product-cta";
import { Steps } from "@/components/product/steps";
import { InstagramSection } from "@/components/sections/instagram";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { Eyebrow } from "@/components/ui/eyebrow";
import { JsonLd } from "@/components/seo/json-ld";
import { site, stats } from "@/lib/site";
import { breadcrumbJsonLd, organizationJsonLd, pageMeta } from "@/lib/seo";

const description =
  "Milktree is a founder-led UK design studio. Seven years, 200+ brands, a core team of senior designers and a network of 50+ more worldwide, every piece checked by one creative director.";

export const metadata: Metadata = pageMeta({
  title: "About Milktree — a UK design studio",
  description,
  path: "/about",
});

/**
 * About (spec §6.9). Founder-led, the core team plus network explained as a
 * strength, the creative director as the constant. No team grid, no
 * headshots, never the word "freelancers".
 *
 * [slot] Founder photograph: drop it at /public/about/founder.webp and
 * swap the placeholder block in <FounderPortrait /> for a next/image.
 */

const HOW_IT_RUNS = [
  { n: "01", title: "The brief lands with the creative director", body: "Every project and every request starts in the same place. One person reads it, questions it, and decides what good looks like before anyone opens a file." },
  { n: "02", title: "It goes to the right designer", body: "Our core team of senior designers first. When a brief needs a specialist, a packaging designer, a motion designer, an illustrator, we go to the network: 50+ vetted designers around the world we've worked with for years." },
  { n: "03", title: "It's checked before it reaches you", body: "Nothing ships without the creative director's sign-off. That's the standard 200 brands were built to, and it's the same on a £799 sprint as on a full rebuild." },
];

const DISCIPLINES = [
  { title: "Brand identity", body: "Designers who've built brands for hospitality groups, finance firms and trades businesses, and know the difference." },
  { title: "Packaging and print", body: "People who read dielines and talk to printers. The reason our brands survive contact with a sign-maker." },
  { title: "Web and product", body: "Designers who hand over Figma files developers thank us for." },
  { title: "Motion and social", body: "Simple motion, kinetic type, templates a marketing team can actually use." },
  { title: "Illustration and 3D", body: "Called in when a brand needs a world, not just a logo." },
];

const BELIEFS = [
  "The price on the page is the price.",
  "A brand isn't finished until it's on the street.",
  "One creative director, every piece, no exceptions.",
  "Say what it costs before you do it, never after.",
];

function FounderPortrait() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-border bg-card">
      {/* [slot] Replace with <Image src="/about/founder.webp" alt="…" fill /> */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,238,2,0.10),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">Founder and creative director</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">Milktree</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), breadcrumbJsonLd([{ name: "About", path: "/about" }])]} />
      <ProductHero
        eyebrow="About Milktree"
        lines={["Seven years.", "Two hundred brands.", "One standard."]}
        sub="Milktree started because good businesses kept getting bad design: a freelancer here, a template there, six years of drift. Seven years and 200 brands later, the answer is still the same. One creative director, the right designer for the job, and a brand you can see on the high street."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See the work", href: "/work" }}
        trust={site.trustLine}
      />

      {/* Founder + numbers */}
      <section className="container-edge pb-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <Reveal>
            <FounderPortrait />
          </Reveal>
          <div>
            <Reveal>
              <Eyebrow>Why it exists</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6 text-balance">Built for businesses people can see.</h2>
            </Reveal>
            <Reveal index={2}>
              <p className="text-body-lg mt-6">
                Most design studios are built for marketing teams. Milktree is built for the
                owner of a restaurant, a roofing firm, a brokerage: businesses whose brand is
                on a wall, a van, a menu and a shopfront long before it&apos;s on a screen.
                That&apos;s why print, packaging and outdoor are standard here, not an
                afterthought.
              </p>
            </Reveal>
            <StaggerGroup className="mt-10 grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <StaggerItem key={stat.label}>
                  <p className="font-heading text-[clamp(2.5rem,6vw,4rem)] font-bold leading-none tracking-[-0.01em] text-foreground [font-stretch:75%]">
                    <span className="tabular-nums"><CountUp value={stat.value} /></span>
                    {stat.suffix && <span className="text-brand">{stat.suffix}</span>}
                  </p>
                  <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">{stat.label}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      <Steps
        id="how"
        eyebrow="How the studio works"
        title="Three senior designers in-house. Fifty more in the network. One creative director."
        intro="A single in-house hire has one skill set. A network has every discipline a brand needs, and the creative director makes sure it all looks like one studio."
        steps={HOW_IT_RUNS}
        layout="row"
        light
      />

      {/* The network by discipline */}
      <section className="container-edge py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>The network, by discipline</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6">The people we call.</h2>
            </Reveal>
          </div>
          <Reveal index={2}>
            <p className="text-body max-w-sm md:text-right">
              No headshots, no org chart. The right designer for each brief, matched by discipline and sector, working to one standard.
            </p>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 divide-y divide-border border-y border-border">
          {DISCIPLINES.map((d, i) => (
            <StaggerItem key={d.title} className="grid gap-3 py-8 md:grid-cols-[5rem_18rem_1fr] md:gap-8">
              <span className="text-2xl font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h3">{d.title}</h3>
              <p className="text-body max-w-xl">{d.body}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* The constant */}
      <section className="border-y border-border bg-surface py-20 md:py-28">
        <div className="container-edge grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>The constant</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="text-h2 mt-6">One creative director. Every piece.</h2>
            </Reveal>
          </div>
          <Reveal index={2}>
            <p className="text-body-lg">
              Whoever designs it, the creative director signs it off. On Design Lead and on
              every Brand Build, you also get a named senior designer who stays with your
              account, so &ldquo;the same person every time&rdquo; is a promise the model can
              keep, not a line on a pricing page.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Beliefs + where */}
      <section className="container-edge py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>What we believe</Eyebrow>
            </Reveal>
            <StaggerGroup className="mt-8 space-y-4">
              {BELIEFS.map((b) => (
                <StaggerItem key={b} className="text-[clamp(1.35rem,2.6vw,1.9rem)] font-bold leading-snug tracking-tight text-foreground">
                  {b}
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
          <div>
            <Reveal>
              <Eyebrow>Where we are</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <p className="text-body-lg mt-8">
                The UK. Most of our clients are UK businesses, and we work with companies
                further afield too. Designers who want to join the network can find us on
                the careers page.
              </p>
            </Reveal>
            <Reveal index={2}>
              <Link
                href="/careers"
                data-cursor="hover"
                className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-foreground transition-colors hover:text-brand"
              >
                Design careers at Milktree
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <InstagramSection />

      <ProductCta
        title="Let's fix the thing that's been bothering you."
        body="Two minutes to tell us what you need. A sprint, a build or a subscription, and a real person on the other end."
        product="sprint"
        cta="Start a project"
        secondary={{ label: "See pricing", href: "/pricing" }}
        trust={site.trustLine}
        source="About — final CTA"
      />
    </>
  );
}
