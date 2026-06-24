"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { trackContact } from "@/lib/analytics/meta-tracking";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

type BookButtonProps = {
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
 * The single primary CTA — routes to the on-site /book funnel (Cal.com embed),
 * keeping the visitor on-domain so the booking fires a tracked Lead (Pixel +
 * CAPI) with ad attribution intact. Clicking fires a Contact event (top of the
 * booking funnel). Wrap the hero instance in the magnetic effect (§5.7).
 */
export function BookButton({
  children = "Book a free brand audit",
  variant = "brand",
  size = "pill",
  magnetic = false,
  withIcon = false,
  className,
  source = "Book Button",
}: BookButtonProps) {
  const link = (
    <Link
      href="/book"
      data-cursor="hover"
      onClick={() => trackContact({ eventSource: source })}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {withIcon && <Calendar />}
      {children}
    </Link>
  );

  return magnetic ? <Magnetic strength={0.4}>{link}</Magnetic> : link;
}
