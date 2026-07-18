import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { StartButton } from "@/components/layout/start-button";
import { AnchorLink } from "@/components/layout/anchor-link";
import { site } from "@/lib/site";

const columns = [
  {
    heading: "What's included",
    links: [
      { label: "Brand identity & guidelines", href: "#services" },
      { label: "Campaigns & content", href: "#services" },
      { label: "Sales & digital", href: "#services" },
      { label: "Packaging, print & OOH", href: "#services" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Selected work", href: "#work" },
      { label: "Why Milktree", href: "#why" },
      { label: "Plans", href: "#plans" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { label: "Start your subscription", href: "/start" },
      { label: "Free brand report", href: "/brand-report" },
      { label: "Client login", href: "#" },
    ],
  },
];

/**
 * The one dark section — warm-black full-bleed final CTA with the footer
 * folded into the same block (Coda-style close). Yellow marks the CTA.
 */
export function C2Final() {
  return (
    <section className="bg-ink text-ink-foreground">
      <div className="container-edge py-28 md:py-40">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-ink-foreground/40">
            (Ready when you are)
          </p>
          <h2 className="mt-8 text-balance font-bold uppercase leading-[0.95] tracking-[-0.03em] [font-size:clamp(2.5rem,7vw,6.5rem)]">
            Your business has outgrown its brand.
          </h2>
          <p className="mx-auto mt-7 max-w-md text-[1.05rem] font-medium leading-[1.55] text-ink-foreground/60">
            Let&rsquo;s fix that. Senior work back in 48 hours, one flat monthly
            fee, cancel any month.
          </p>
          <div className="mt-10 flex justify-center">
            <StartButton size="pill-lg" magnetic source="Concept2 Final CTA">
              Get started
            </StartButton>
          </div>
        </Reveal>
      </div>

      <footer className="container-edge border-t border-white/10 pt-16 pb-8 md:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-14">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-[1.05rem] font-bold tracking-tight text-ink-foreground"
            >
              milktree<span aria-hidden>™</span>
            </Link>
            <p className="mt-4 text-[0.95rem] font-medium leading-[1.6] text-ink-foreground/60">
              {site.tagline} Unlimited design, senior work in 48 hours, one
              flat monthly fee.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h4 className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-ink-foreground/40">
                {column.heading}
              </h4>
              <ul className="mt-5 space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <AnchorLink
                      href={link.href}
                      className="inline-flex min-h-10 items-center text-[0.95rem] font-medium text-ink-foreground/60 transition-colors hover:text-ink-foreground"
                    >
                      {link.label}
                    </AnchorLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm font-medium text-ink-foreground/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Milktree. UK-based. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="/privacy"
              className="inline-flex min-h-11 items-center transition-colors hover:text-ink-foreground"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors hover:text-ink-foreground"
            >
              Terms
            </a>
            <p>No contracts · Pause anytime</p>
          </div>
        </div>
      </footer>

      {/* Oversized wordmark — signature closing moment */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden px-4 pb-6 text-center"
      >
        <span className="block bg-gradient-to-b from-white/[0.08] to-white/[0.01] bg-clip-text text-[20vw] font-bold leading-[0.8] tracking-[-0.05em] text-transparent">
          milktree
        </span>
      </div>
    </section>
  );
}
