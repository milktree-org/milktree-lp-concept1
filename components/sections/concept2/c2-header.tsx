"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnchorLink } from "@/components/layout/anchor-link";
import { trackContact } from "@/lib/analytics/meta-tracking";

const links = [
  { label: "Work", href: "#work" },
  { label: "Plans", href: "#plans" },
  { label: "FAQ", href: "#faq" },
];

/** Live local time — the small editorial detail in the meta bar. */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date()
          .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
          .replace(/\s?(am|pm)/i, " $1")
          .toLowerCase(),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted so server and client markup always match.
  return <span suppressHydrationWarning>{time}</span>;
}

/**
 * Vucko-style meta bar — in-flow, non-sticky. Wordmark, location + live time,
 * anchor links and a plain "Get started" text link. The hero owns the yellow.
 */
export function C2Header() {
  return (
    <header className="container-edge flex h-16 items-center justify-between gap-4 text-[0.9rem] font-medium md:h-20">
      <Link
        href="/"
        aria-label="Milktree — home"
        className="inline-flex min-h-11 items-center text-[1.05rem] font-bold tracking-tight text-foreground"
      >
        milktree<span aria-hidden>™</span>
      </Link>

      <p className="hidden text-faint sm:block">
        Hampshire, UK <LocalTime />
      </p>

      <nav className="flex items-center gap-1">
        {links.map((link) => (
          <AnchorLink
            key={link.label}
            href={link.href}
            className="hidden min-h-11 items-center px-2.5 text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          >
            {link.label}
          </AnchorLink>
        ))}
        <Link
          href="/start"
          onClick={() => trackContact({ eventSource: "Concept2 Header" })}
          className="inline-flex min-h-11 items-center px-2.5 font-bold text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Get started
        </Link>
      </nav>
    </header>
  );
}
