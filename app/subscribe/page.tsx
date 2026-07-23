import type { Metadata } from "next";
import { SubscribeForm } from "@/components/funnel/subscribe-form";

export const metadata: Metadata = {
  title: "Brand tips by email",
  description:
    "Occasional brand and design tips from Milktree. Short, useful, no spam. Unsubscribe anytime.",
  alternates: {
    canonical: "/subscribe",
  },
  openGraph: {
    title: "Brand tips by email | Milktree",
    description:
      "Occasional brand and design tips from Milktree. Short, useful, no spam.",
    url: "/subscribe",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand tips by email | Milktree",
    description:
      "Occasional brand and design tips from Milktree. Short, useful, no spam.",
  },
};

export default function SubscribePage() {
  return (
    <section className="relative py-28 md:py-32">
      <div className="container-edge">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            Newsletter
          </p>
          <h1 className="mt-4 text-balance text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            Brand tips, by email
          </h1>
          <p className="text-body mx-auto mt-5 max-w-md">
            Occasional notes on brand, design and growth from the Milktree
            team. Short, useful, no spam.
          </p>
        </div>
        <SubscribeForm />
      </div>
    </section>
  );
}
