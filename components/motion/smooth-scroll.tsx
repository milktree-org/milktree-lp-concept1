"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

/**
 * Lenis holds its own scroll position across App Router client navigations,
 * so a new route would otherwise open wherever the last page was scrolled.
 * Jump to the top instantly whenever the pathname changes (hash links are
 * handled separately by AnchorLink).
 */
function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}

/**
 * Lenis smooth scroll (§5.2) — the backbone of the premium feel.
 * Disabled entirely under prefers-reduced-motion (§5.8) so the page
 * scrolls natively.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      <ScrollToTopOnNavigate />
      {children}
    </ReactLenis>
  );
}
