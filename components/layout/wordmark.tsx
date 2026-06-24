import { cn } from "@/lib/utils";

/**
 * Milktree wordmark — the real brand logo (white letters + yellow accent),
 * already correctly coloured for the dark canvas. Size it with a height class.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logos/logo.svg"
      alt="Milktree"
      className={cn("w-auto select-none", className)}
    />
  );
}
