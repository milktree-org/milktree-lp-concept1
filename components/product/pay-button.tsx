"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getLeadTrackingFields } from "@/lib/analytics/lead-tracking";
import { trackCustom } from "@/lib/analytics/meta-tracking";
import type { SprintOption } from "@/lib/offer";
import { cn } from "@/lib/utils";

/**
 * "Pay and book" for one sprint option (PRD 3.3). Ghost pill so the hero
 * CTA stays the page's only yellow. Creates the Checkout Session server-side
 * and redirects; falls back to a plain error line if Stripe is off.
 */
export function PayButton({
  sprint,
  price,
  className,
}: {
  sprint: SprintOption["id"];
  price: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    trackCustom("SprintCheckoutStart", { eventSource: `/sprint — ${sprint}` });
    try {
      const res = await fetch("/api/checkout/sprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprint, attribution: getLeadTrackingFields() }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Couldn't start checkout. Book a call instead.");
        setBusy(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Couldn't reach the server. Book a call instead.");
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        data-cursor="hover"
        className={cn(buttonVariants({ variant: "ghostPill", size: "pill" }), "w-full")}
      >
        {busy ? "One moment…" : `Pay ${price} and book`}
        {!busy && <ArrowRight aria-hidden />}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
