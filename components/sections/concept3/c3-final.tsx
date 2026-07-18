import Link from "next/link";
import { Mail } from "lucide-react";
import { C3Video } from "@/components/sections/concept3/c3-video";
import { Reveal } from "@/components/motion/reveal";
import { CONTACT_EMAIL, instagram } from "@/lib/site";

/* lucide dropped brand icons — Instagram/LinkedIn use text initials. */
const socials = [
  { label: "Email", href: `mailto:${CONTACT_EMAIL}`, content: <Mail className="size-5" /> },
  {
    label: "Instagram",
    href: instagram.url,
    content: <span className="c3-display text-xs tracking-[0.15em]">IG</span>,
  },
  {
    label: "LinkedIn",
    href: "#",
    content: <span className="c3-display text-xs tracking-[0.15em]">IN</span>,
  },
];

/**
 * Final CTA — headline stack over a full-bleed video close, yellow Condiment
 * accent, liquid-glass social stack pinned bottom-left.
 */
export function C3Final() {
  return (
    <section id="connect" className="relative min-h-[85dvh] overflow-hidden">
      <C3Video
        src="/ads/cinematic/story/swatches-reel.mp4"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto flex min-h-[85dvh] w-full max-w-[1831px] items-center justify-end px-5 py-24 md:px-10 lg:pr-[12%]">
        <Reveal className="relative text-right">
          <span
            aria-hidden
            className="c3-script absolute -top-10 -left-6 -rotate-2 whitespace-nowrap text-(--c3-accent) drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] [font-size:clamp(1.5rem,3.5vw,3.5rem)] md:-top-14 md:-left-16"
          >
            ready when you are
          </span>
          <h2 className="c3-display uppercase leading-[1.1] text-(--c3-cream) [font-size:clamp(1.75rem,4.5vw,3.75rem)]">
            <Link
              href="/start"
              className="mb-4 inline-block transition-colors duration-300 hover:text-(--c3-accent) md:mb-10"
            >
              Get started.
            </Link>
            <span className="block">Unlimited requests.</span>
            <span className="block">Senior work in 48h.</span>
            <span className="block">One flat monthly fee.</span>
          </h2>
        </Reveal>
      </div>

      {/* Social stack */}
      <div className="absolute bottom-[10%] left-[8%] z-10">
        <div className="liquid-glass flex flex-col rounded-[1rem]">
          {socials.map(({ label, href, content }, i) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className={`grid h-12 w-[16vw] max-w-[10rem] min-w-[3.5rem] place-items-center text-(--c3-cream)/80 transition-colors hover:bg-white/10 hover:text-(--c3-cream) md:h-14 ${
                i < socials.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              {content}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
