import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { BookingEmbed } from "@/components/booking/booking-embed";
import { sprintTimeline } from "@/lib/offer";

export const metadata: Metadata = {
  title: "Sprint booked. Now pick your day one.",
  description: "Your Brand Reset Sprint is paid. Book the 30-minute day-one call and we start.",
  robots: { index: false, follow: false },
};

/**
 * Stripe success page (PRD 3.3). The payment is confirmed server-side by
 * the webhook; this page's one job is to get the day-one call booked.
 */
export default function SprintThanks() {
  return (
    <section className="relative py-28 md:py-36">
      <div className="container-edge relative z-10 flex flex-col items-center text-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Brand Reset Sprint · Paid</p>
        </Reveal>
        <Reveal index={1}>
          <h1 className="mx-auto mt-4 max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
            Done. Now pick your day one.
          </h1>
        </Reveal>
        <Reveal index={2}>
          <p className="text-body-lg mt-6 max-w-xl">
            Thirty minutes to agree exactly what&apos;s being fixed. A receipt and the
            sprint details are on their way to your inbox.
          </p>
        </Reveal>
        <Reveal index={3} className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-faint">
          {sprintTimeline.map((t) => (
            <span key={t.day}>
              <span className="text-foreground">{t.day}</span> {t.title}
            </span>
          ))}
        </Reveal>
      </div>

      <Reveal index={4} className="container-edge relative z-10 mt-14">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-surface p-2 sm:p-4">
          <BookingEmbed source="Website — /sprint/thanks (paid)" />
        </div>
      </Reveal>
    </section>
  );
}
