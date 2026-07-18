import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Concept — Light editorial",
  description:
    "Milktree light editorial concept. Your creative department, on demand — unlimited requests, senior work in 48 hours, one flat monthly fee.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  colorScheme: "light",
};

/**
 * Light editorial concept (/concept-2). Everything inside is scoped to the
 * `.theme-light` token set defined in globals.css; the global dark header and
 * footer are hidden via `body:has(.theme-light)` because this page carries
 * its own chrome (meta bar in the hero, footer inside the dark final block).
 */
export default function ConceptLightLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-hide-chrome className="theme-light bg-background text-foreground">
      {children}
    </div>
  );
}
