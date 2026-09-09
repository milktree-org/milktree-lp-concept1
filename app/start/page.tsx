import type { Metadata } from "next";
import { Suspense } from "react";
import { QualificationForm } from "@/components/funnel/qualification-form";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Tell us what you need in about two minutes. A sprint, a brand build or a subscription, and a real person on the other end.",
  robots: { index: false, follow: true },
};

/**
 * The single entry point for every CTA. `?product=sprint|build|subscription`
 * pre-answers step one, which is why the form reads search params and needs
 * a Suspense boundary.
 */
export default function StartPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-5rem-var(--consent-bar-h,0px))] flex-col justify-center py-10 sm:py-20 md:py-32">
      <div className="container-edge">
        <Suspense fallback={<div className="mx-auto min-h-[520px] w-full max-w-xl" aria-busy="true" />}>
          <QualificationForm />
        </Suspense>
      </div>
    </section>
  );
}
