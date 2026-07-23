import type { Metadata } from "next";
import { Mail, MapPin, User } from "lucide-react";
import { ContactForm } from "@/components/funnel/contact-form";
import {
  BehanceIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
} from "@/components/ui/social-icons";
import { contact, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch with Milktree. Questions about plans, the process or anything else — we reply within one working day.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact us | Milktree",
    description:
      "Get in touch with Milktree. Questions about plans, the process or anything else — we reply within one working day.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact us | Milktree",
    description:
      "Get in touch with Milktree. Questions about plans, the process or anything else — we reply within one working day.",
  },
};

const socialIcons = {
  Instagram: InstagramIcon,
  Behance: BehanceIcon,
  LinkedIn: LinkedInIcon,
  Facebook: FacebookIcon,
} as const;

export default function ContactPage() {
  return (
    <section className="relative py-28 md:py-32">
      <div className="container-edge">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          {/* Details */}
          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Contact
            </p>
            <h1 className="mt-4 text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              Talk to us
            </h1>
            <p className="text-body mt-5">
              Questions about plans, the process, or whether Milktree is the
              right fit — send a message and a real person will reply.{" "}
              {contact.responseNote}
            </p>

            <dl className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground">
                  <User className="size-[1.125rem]" />
                </span>
                <div>
                  <dt className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-faint">
                    Name
                  </dt>
                  <dd className="mt-1">
                    <span className="text-[1.05rem] font-bold text-foreground">
                      {contact.name}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {contact.role}
                    </span>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground">
                  <Mail className="size-[1.125rem]" />
                </span>
                <div>
                  <dt className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-faint">
                    Email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-[1.05rem] font-bold text-foreground transition-colors hover:text-brand"
                    >
                      {contact.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground">
                  <MapPin className="size-[1.125rem]" />
                </span>
                <div>
                  <dt className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-faint">
                    Address
                  </dt>
                  <dd className="mt-1 text-[1.05rem] font-medium leading-relaxed text-muted-foreground">
                    {contact.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-10 border-t border-border pt-8">
              <p className="text-[0.8rem] font-bold uppercase tracking-[0.16em] text-faint">
                Elsewhere
              </p>
              <div className="mt-4 flex gap-3">
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
          </div>

          {/* Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
