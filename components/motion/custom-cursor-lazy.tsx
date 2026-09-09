"use client";

import dynamic from "next/dynamic";

/**
 * The custom cursor is desktop-only decoration, so its code (and the
 * framer-motion spring it uses) loads after hydration and never on the
 * server. Keeps it out of the first-paint bundle on every page.
 */
const CustomCursor = dynamic(
  () => import("@/components/motion/custom-cursor").then((m) => m.CustomCursor),
  { ssr: false },
);

export function CustomCursorLazy() {
  return <CustomCursor />;
}
