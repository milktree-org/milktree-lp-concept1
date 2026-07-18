import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client login",
  description: "Log in to your Milktree client dashboard.",
  robots: { index: false, follow: false },
};

/**
 * Client login (/login). Standalone auth screen — the global header and
 * footer are hidden via `body:has([data-hide-chrome])` because the page
 * carries its own chrome (wordmark inside the form panel).
 */
export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div data-hide-chrome>{children}</div>;
}
