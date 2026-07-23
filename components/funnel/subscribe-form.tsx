"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";
import {
  ConsentCheckbox,
  FunnelInput,
  PrimaryButton,
} from "@/components/funnel/ui";

type Status = "idle" | "loading" | "success" | "error";

export function SubscribeForm() {
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const valid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    consent;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
        className="mx-auto max-w-md rounded-[2rem] border border-border bg-card px-6 py-10 text-center md:px-8"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand text-brand-ink">
          <Check className="size-6" strokeWidth={2.5} />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          You&apos;re on the list
        </h2>
        <p className="text-body mt-3 text-[0.95rem]">
          Occasional brand tips from Milktree. No spam — unsubscribe anytime.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-5 rounded-[2rem] border border-border bg-card px-6 py-8 md:px-8 md:py-10"
      noValidate
    >
      <FunnelInput
        label="Name"
        name="name"
        autoComplete="name"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <FunnelInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        label="Send me occasional brand tips from Milktree. No spam, unsubscribe anytime."
      />

      {error && (
        <p role="alert" className="text-sm font-medium text-red-400">
          {error}
        </p>
      )}

      <PrimaryButton
        type="submit"
        disabled={!valid}
        loading={status === "loading"}
        className="w-full"
      >
        Subscribe
      </PrimaryButton>
    </form>
  );
}
