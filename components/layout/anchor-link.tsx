"use client";

import { useLenis } from "lenis/react";

/**
 * Smooth-scrolling in-page anchor link. Uses Lenis when active (with a header
 * offset), falls back to native scrollIntoView under reduced motion. Plain
 * routes (non-hash) pass straight through as anchors.
 */
export function AnchorLink({
  href,
  children,
  className,
  onNavigate,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const lenis = useLenis();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      if (lenis) {
        lenis.scrollTo(el as HTMLElement, { offset: -72 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Section lives on the homepage — navigate there with the hash.
      window.location.href = `/${href}`;
    }
    onNavigate?.();
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
}
