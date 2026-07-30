"use client";

import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";

/**
 * Smooth-scrolling in-page anchor link. Uses Lenis when active (with a header
 * offset), falls back to native scrollIntoView under reduced motion. Plain
 * routes navigate via the App Router so clicks still work inside portaled
 * nav menus (which can unmount before a native <a> navigation completes).
 */
export const AnchorLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    /** Optional: Base UI `render` props inject children by cloning. */
    children?: React.ReactNode;
    className?: string;
    onNavigate?: () => void;
  } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">
>(function AnchorLink(
  { href, children, className, onNavigate, onClick, ...rest },
  ref,
) {
  const lenis = useLenis();
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);

    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    if (!href.startsWith("#")) {
      e.preventDefault();
      onNavigate?.();
      router.push(href);
      return;
    }

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
      router.push(`/${href}`);
    }
    onNavigate?.();
  }

  return (
    <a ref={ref} href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
});
