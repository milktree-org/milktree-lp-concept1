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

/** Footer columns (spec §5). Phase 2 adds Services, Who it's for and About. */
const columns = [
  {
    heading: "Products",
    links: [
      { label: "Brand Reset Sprint", href: "/sprint" },
      { label: "Brand Build", href: "/brand-build" },
      { label: "Subscription", href: "/subscription" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Selected work",
    links: [
      { label: "Eazy Phone", href: "/work/eazyphone" },
      { label: "Mint Mortgages", href: "/work/mint-mortgages" },
      { label: "Latimers", href: "/work/latimers" },
      { label: "Melt", href: "/work/melt" },
      { label: "Alltrad Roofing", href: "/work/alltrad-roofing" },
      { label: "View all work", href: "/work" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { label: "Our work", href: "/work" },
      { label: "FAQ", href: "/#faq" },
      { label: "Careers", href: "/careers" },
      { label: "Contact us", href: "/contact" },
      { label: "Client login", href: "/login" },
    ],
  },
  {
    heading: "Start",
    links: [
      { label: "Start a project", href: "/start" },
      { label: "Free brand score", href: "/brand-report" },
      { label: "Brand tips by email", href: "/subscribe" },
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
            <Eyebrow>Milktree</Eyebrow>
            <p className="mt-5 text-2xl font-bold tracking-tight text-foreground">
              Brands you can see on the high street.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A UK design studio. Seven years, 200+ brands, a core team of
              senior designers and a network of 50+ more. Fix one thing in two
              weeks, rebuild the brand in six, or keep us on. Fixed prices, no
              proposals.
            </p>
            <div className="mt-7">
              <StartButton size="pill" source="Footer">Start a project</StartButton>
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
              <h2 className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-faint">
                {col.heading}
              </h2>
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
            <p className="w-full sm:w-auto">Fixed prices · No contracts</p>
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
