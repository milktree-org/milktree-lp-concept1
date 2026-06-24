import { Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { BookButton } from "@/components/layout/book-button";
import { plans, planJourney, planAnchor } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Plans (§7.11) — two clear paths: a one-off Brand Build foundation and an
 * ongoing Creative Partner subscription, sequenced so they never compete on
 * price. The subscription is the flagship. Every CTA routes to the brand audit.
 */
export function Plans() {
  return (
    <section id="plans" className="container-edge scroll-mt-28 py-28 md:py-40">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal className="flex justify-center">
          <Eyebrow>Plans</Eyebrow>
        </Reveal>
        <Reveal index={1}>
          <h2 className="text-h2 mt-6">
            Build the brand once. Keep it growing.
          </h2>
        </Reveal>
        <Reveal index={2}>
          <p className="text-body mx-auto mt-6 max-w-xl text-[0.95rem]">
            {planJourney}
          </p>
        </Reveal>
      </div>

      <StaggerGroup className="mx-auto mt-20 grid max-w-4xl items-stretch gap-6 md:gap-8 lg:grid-cols-2">
        {plans.map((plan) => (
          <StaggerItem
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-[2rem] border p-9 md:p-10",
              plan.featured
                ? "border-brand/50 bg-brand/[0.05] shadow-[0_50px_140px_-55px_rgba(255,220,4,0.32)] lg:-translate-y-3"
                : "border-border bg-card",
            )}
          >
            {plan.featured && plan.note && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-xs font-bold text-brand-ink">
                {plan.note}
              </span>
            )}

            <p
              className={cn(
                "text-xs font-bold uppercase tracking-[0.16em]",
                plan.featured ? "text-brand" : "text-faint",
              )}
            >
              {plan.kicker}
            </p>
            <h3 className="text-h3 mt-4">{plan.name}</h3>
            <p className="text-body mt-2 text-[0.95rem]">{plan.summary}</p>

            <div className="mt-7 flex flex-wrap items-baseline gap-1.5">
              <span className="text-[clamp(2.5rem,10vw,3rem)] font-black tracking-tight text-foreground">
                {plan.price}
              </span>
              <span className="text-base font-medium text-faint">{plan.cadence}</span>
            </div>
            <p
              className={cn(
                "mt-4 border-l-2 pl-3 text-[0.875rem] leading-snug text-muted-foreground",
                plan.featured ? "border-brand/60" : "border-white/15",
              )}
            >
              {plan.anchor}
            </p>

            <ul className="mt-8 flex-1 space-y-3.5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-[0.95rem] text-muted-foreground"
                >
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      plan.featured ? "text-brand" : "text-foreground",
                    )}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <BookButton
                variant={plan.featured ? "brand" : "ghostPill"}
                size="pill"
                className="w-full"
              >
                {plan.cta}
              </BookButton>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal className="mx-auto mt-16 max-w-3xl text-center">
        <p className="text-body text-[0.95rem]">{planAnchor}</p>
        <p className="mt-6 text-sm font-medium text-faint">
          No contracts · Pause anytime · Free brand audit first
        </p>
      </Reveal>
    </section>
  );
}
