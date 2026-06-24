import { cn } from "@/lib/utils";

/**
 * Eyebrow / section label (§4) — uppercase, tracked, with a short yellow tick.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-[0.8rem] font-bold uppercase tracking-[0.18em] text-faint",
        className,
      )}
    >
      <span aria-hidden className="inline-block h-px w-6 bg-brand" />
      {children}
    </span>
  );
}
