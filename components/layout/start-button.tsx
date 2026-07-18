"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { trackContact } from "@/lib/analytics/meta-tracking";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type StartButtonProps = {
  children?: React.ReactNode;
  variant?: "brand" | "ghostPill" | "default";
  size?: "pill" | "pill-lg";
  magnetic?: boolean;
  withIcon?: boolean;
  className?: string;
  /** Where this CTA lives, for conversion attribution (e.g. "Hero", "Header"). */
  source?: string;
};

/**
 * The single primary CTA — routes to the /start qualification funnel, keeping
 * the visitor on-domain so downstream conversions fire tracked events (Pixel +
 * CAPI) with ad attribution intact. Clicking fires a Contact event (top of
 * funnel). Wrap the hero instance in the magnetic effect.
 */
export function StartButton({
  children = "Get started",
  variant = "brand",
  size = "pill",
  magnetic = false,
  withIcon = true,
  className,
  source = "Start Button",
}: StartButtonProps) {
  const link = (
    <Link
      href="/start"
      data-cursor="hover"
      onClick={() => trackContact({ eventSource: source })}
      className={cn(
        buttonVariants({ variant, size }),
        // When wrapped in Magnetic, the wrapper's height is intrinsic (it
        // shrinks to this link's own h-14/h-16), so only width needs to
        // stretch to fill the wrapper's min-width. Adding h-full here would
        // resolve against the wrapper's auto height and collapse to 0,
        // stripping the pill's height entirely.
        magnetic ? "w-full" : className,
      )}
    >
      {children}
      {withIcon && <ArrowRight />}
    </Link>
  );

  return magnetic ? (
    <Magnetic strength={0.4} className={className}>
      {link}
    </Magnetic>
  ) : (
    link
  );
}
