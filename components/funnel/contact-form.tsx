"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";
import {
  FunnelInput,
  FunnelTextarea,
  PrimaryButton,
} from "@/components/funnel/ui";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const valid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    message.trim().length >= 10;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
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
        className="rounded-[2rem] border border-border bg-card px-6 py-12 text-center md:px-8"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand text-brand-ink">
          <Check className="size-6" strokeWidth={2.5} />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          Message received
        </h2>
        <p className="text-body mt-3 text-[0.95rem]">
          Thanks, {name.trim().split(/\s+/)[0]}. We&apos;ll get back to you
          within one working day.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-[2rem] border border-border bg-card px-6 py-8 md:px-8 md:py-10"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>
      <FunnelInput
        label="Company"
        name="company"
        optional
        autoComplete="organization"
        placeholder="Acme Ltd"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <FunnelTextarea
        label="Message"
        name="message"
        rows={5}
        placeholder="What can we help with?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
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
        Send message
      </PrimaryButton>
      <p className="text-center text-xs leading-relaxed text-faint">
        We only use your details to reply. No lists, no spam.
      </p>
    </form>
  );
}
