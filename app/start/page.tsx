import type { Metadata } from "next";
import { QualificationForm } from "@/components/funnel/qualification-form";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Six quick questions and we'll point you at exactly the right thing. Takes under a minute.",
  robots: { index: false, follow: true },
};

export default function StartPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-5rem-var(--consent-bar-h,0px))] flex-col justify-center py-10 sm:py-20 md:py-32">
      <div className="container-edge">
        <QualificationForm />
      </div>
    </section>
  );
}
