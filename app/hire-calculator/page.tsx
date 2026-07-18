import type { Metadata } from "next";
import { HireCalculator } from "@/components/funnel/hire-calculator";

export const metadata: Metadata = {
  title: "Design Hire Cost Calculator (UK)",
  description:
    "What does a design hire really cost in the UK? Salary, employer NI, pension, recruitment fees, software and ramp-up time — get the true first-year number in 30 seconds, free.",
  alternates: {
    canonical: "/hire-calculator",
  },
  openGraph: {
    title: "Design Hire Cost Calculator | Milktree",
    description:
      "The true first-year cost of a UK design hire, in 30 seconds. Salary, NI, pension, recruitment, kit and ramp-up — the number the job ad doesn't show.",
    url: "/hire-calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Hire Cost Calculator | Milktree",
    description:
      "The true first-year cost of a UK design hire, in 30 seconds. The number the job ad doesn't show.",
  },
};

export default function HireCalculatorPage() {
  return (
    <section className="relative py-28 md:py-32">
      <div className="container-edge">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Free Design Hire Calculator
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            What does a design hire really cost?
          </h1>
          <p className="text-body mx-auto mt-5 max-w-lg">
            The job ad says £65k. The real number is bigger. Employer NI,
            pension, recruitment fees, software and three months of ramp-up —
            see the true first-year cost in 30 seconds.
          </p>
        </div>
        <HireCalculator />
        <p className="mx-auto mt-12 max-w-lg text-center text-sm leading-relaxed text-faint">
          Estimates use 2025/26 employer NI rates, the 3% auto-enrolment
          pension minimum and typical UK recruitment fees. Your exact numbers
          will vary — that&apos;s why the email version is itemised.
        </p>
      </div>
    </section>
  );
}
