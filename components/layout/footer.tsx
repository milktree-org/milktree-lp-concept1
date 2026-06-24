import { AnchorLink } from "@/components/layout/anchor-link";
import { BookButton } from "@/components/layout/book-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { instagram } from "@/lib/site";

const columns = [
  {
    heading: "What we do",
    links: [
      { label: "Brand Identity", href: "#services" },
      { label: "Social & Content", href: "#services" },
      { label: "Web & Landing Pages", href: "#services" },
      { label: "Creative Direction", href: "#services" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our work", href: "#work" },
      { label: "Why Milktree", href: "#why" },
      { label: "Plans", href: "#plans" },
      { label: "Insights", href: "#insights" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { label: "Book a brand audit", href: "#book" },
      { label: "Client login", href: "#" },
    ],
  },
];

const socials = [
  { label: "Instagram", short: "IG", href: instagram.url },
  { label: "LinkedIn", short: "IN", href: "#" },
  { label: "Twitter", short: "X", href: "#" },
  { label: "Dribbble", short: "DR", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface">
      <div className="container-edge py-20 md:py-28">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-14">
          {/* Brand + CTA */}
          <div className="max-w-sm">
            <Eyebrow>Your creative department</Eyebrow>
            <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
              Senior brand &amp; design, on a flat monthly fee.
            </p>
            <div className="mt-7">
              <BookButton size="pill">Book a free brand audit</BookButton>
            </div>
            <div className="mt-8 flex gap-3">
              {socials.map(({ label, short, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full border border-border text-xs font-bold tracking-wide text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                >
                  {short}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-faint">
                {col.heading}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <AnchorLink
                      href={link.href}
                      className="inline-flex min-h-11 min-w-11 items-center px-2 py-1 text-[0.95rem] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </AnchorLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-6 border-t border-border pt-8 text-sm text-faint md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Milktree. UK-based. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href="/privacy"
              className="inline-flex min-h-11 items-center px-1 transition-colors hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="inline-flex min-h-11 items-center px-1 transition-colors hover:text-foreground"
            >
              Terms
            </a>
            <p className="w-full sm:w-auto">No contracts · Pause anytime</p>
          </div>
        </div>
      </div>

      {/* Oversized wordmark — signature footer moment */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden px-4 pb-6 text-center"
      >
        <span className="block bg-gradient-to-b from-white/[0.08] to-white/[0.01] bg-clip-text text-[20vw] font-black leading-[0.8] tracking-[-0.05em] text-transparent">
          milktree
        </span>
      </div>
    </footer>
  );
}
