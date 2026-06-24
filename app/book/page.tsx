import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { BookingEmbed } from "@/components/booking/booking-embed";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a free brand audit",
  description:
    "Book your free 30-minute brand audit. We'll show you exactly where your brand and website are costing you clients — and what to fix first.",
  robots: { index: false, follow: true },
};

export default function BookPage() {
  return (
    <section className="relative scroll-mt-28 py-28 md:py-36">
      <div className="container-edge relative z-10 flex flex-col items-center text-center">
        <Reveal>
          <h1 className="mx-auto max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.98] tracking-[-0.03em]">
            Book your free brand audit
          </h1>
        </Reveal>
        <Reveal index={1}>
          <p className="text-body-lg mt-6 max-w-xl">
            30 minutes, no commitment. We&apos;ll show you exactly where your
            brand and website are costing you clients — and what to fix first.
          </p>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-6 text-sm font-medium text-faint">{site.trustLine}</p>
        </Reveal>
      </div>

      <Reveal index={3} className="container-edge relative z-10 mt-14">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[var(--radius)] border border-border bg-surface p-2 sm:p-4">
          <BookingEmbed />
        </div>
      </Reveal>
    </section>
  );
}
