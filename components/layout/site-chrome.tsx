"use client";

import { usePathname } from "next/navigation";

/** Routes that render without the site header and footer. */
const BARE_PREFIXES = ["/lp/"];

export function isBareRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return BARE_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Hides the site header and footer on dedicated paid-traffic landing pages.
 *
 * A landing page bought with ad money has exactly one job, and every nav item
 * is a way to leave without doing it. The header alone offers seven exits
 * before the visitor has read a sentence.
 *
 * This wraps the server-rendered <Header /> and <Footer /> as children rather
 * than importing them, so they stay server components and nothing extra ships
 * to the client beyond the pathname check.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isBareRoute(pathname)) return null;
  return <>{children}</>;
}
