import { AnchorLink } from "@/components/layout/anchor-link";
import { StartButton } from "@/components/layout/start-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  BehanceIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
} from "@/components/ui/social-icons";
import { socials } from "@/lib/site";

const socialIcons = {
  Instagram: InstagramIcon,
  Behance: BehanceIcon,
  LinkedIn: LinkedInIcon,
  Facebook: FacebookIcon,
} as const;

const columns = [
  {
    heading: "What's included",
    links: [
      { label: "Brand identity & guidelines", href: "#services" },
      { label: "AI design", href: "#services" },
      { label: "Ads & email design", href: "#services" },
      { label: "Landing page & web design", href: "#services" },
    ],
  },
  {
    heading: "Selected work",
    links: [
      { label: "EazyPhone", href: "/work/eazyphone" },
      { label: "Mint Mortgages", href: "/work/mint-mortgages" },
      { label: "Alltrad Roofing", href: "/work/alltrad-roofing" },
      { label: "Baya Vodka Soda", href: "/work/baya-vodka-soda" },
      { label: "Zillwoods", href: "/work/zillwoods" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our work", href: "#work" },
      { label: "Why Milktree", href: "#why" },
      { label: "Plans", href: "#plans" },
      { label: "FAQ", href: "#faq" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    heading: "Get started",
    links: [
      { label: "Start your subscription", href: "/start" },
      { label: "Free brand report", href: "/brand-report" },
      { label: "Brand tips by email", href: "/subscribe" },
      { label: "Client login", href: "/login" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer relative overflow-hidden border-t border-border bg-surface">
      <div className="container-edge py-20 md:py-28">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-12">
          {/* Brand + CTA */}
          <div className="max-w-sm">
            <Eyebrow>Your creative department</Eyebrow>
            <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
              Unlimited design, senior work in 48 hours, one flat monthly fee.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Milktree is a UK design subscription: an embedded brand &amp;
              design team for scaling companies. Six years as an agency, 200+
              brands built and 50+ experienced designers across brand identity,
              campaigns, packaging and web.
            </p>
            <div className="mt-7">
              <StartButton size="pill" source="Footer">Get started</StartButton>
            </div>
            <div className="mt-8 flex gap-3">
              {socials.map(({ label, href }) => {
                const Icon = socialIcons[label];
                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                  >
                    <Icon className="size-[1.125rem]" />
                  </a>
                );
              })}
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
        <span className="block bg-gradient-to-b from-white/[0.08] to-white/[0.01] bg-clip-text text-[20vw] font-bold leading-[0.8] tracking-[-0.05em] text-transparent">
          milktree
        </span>
      </div>
    </footer>
  );
}
