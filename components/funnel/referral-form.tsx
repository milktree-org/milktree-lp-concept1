"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { RELATIONSHIP_OPTIONS, referralOffer } from "@/lib/referral";
import { getLeadTrackingFields } from "@/lib/analytics/lead-tracking";
import { trackCustom } from "@/lib/analytics/meta-tracking";
import { trackGA } from "@/lib/analytics/ga";
import {
  FunnelInput,
  FunnelTextarea,
  OptionCard,
  PrimaryButton,
} from "@/components/funnel/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Referral form (PRD 3.4). Single screen, two halves: you, and who you're
 * introducing. Posts to /api/refer. Same input language as /start.
 */
export function ReferralForm() {
  const [relationship, setRelationship] = useState<string | undefined>();
  const [you, setYou] = useState({ name: "", email: "", company: "" });
  const [them, setThem] = useState({ name: "", company: "", contact: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (busy) return;
    setError(null);
    if (!you.name.trim()) return setError("Add your name so we know who to thank.");
    if (!EMAIL_RE.test(you.email.trim())) return setError("That email doesn't look right.");
    if (!them.company.trim()) return setError("Tell us the business you're introducing.");
    if (!them.contact.trim()) return setError("An email or phone number for them helps us follow up.");
    if (!relationship) return setError("How do you know them?");

    setBusy(true);
    try {
      const res = await fetch("/api/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: you.name.trim(),
          referrerEmail: you.email.trim(),
          referrerCompany: you.company.trim(),
          relationship,
          leadName: them.name.trim(),
          leadCompany: them.company.trim(),
          leadContact: them.contact.trim(),
          note: them.note.trim(),
          attribution: getLeadTrackingFields(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      trackCustom("ReferralSubmitted", { eventSource: "/refer" });
      trackGA("generate_lead", { lead_source: "Website — /refer", lead_type: "referral" });
      setDone(true);
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-[2rem] border border-brand/40 bg-brand/[0.06] p-8 text-center md:p-10">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-brand" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Thank you. We&apos;ll take it from here.</h2>
        <p className="text-body mx-auto mt-3 max-w-md">
          We&apos;ll reach out to {them.company.trim()} in the next working day and keep you posted. {referralOffer.line}
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-10"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <fieldset className="grid gap-5">
        <legend className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">About you</legend>
        <FunnelInput label="Your name" autoComplete="name" value={you.name} onChange={(e) => setYou({ ...you, name: e.target.value })} />
        <FunnelInput label="Your email" type="email" autoComplete="email" value={you.email} onChange={(e) => setYou({ ...you, email: e.target.value })} />
        <FunnelInput label="Your business" optional value={you.company} onChange={(e) => setYou({ ...you, company: e.target.value })} />
        <div>
          <p className="mb-2 text-sm font-bold text-foreground">How do you know them?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {RELATIONSHIP_OPTIONS.map((o) => (
              <OptionCard key={o.value} label={o.label} selected={relationship === o.value} onSelect={() => setRelationship(o.value)} />
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-faint">Who you&apos;re introducing</legend>
        <FunnelInput label="Their business" value={them.company} onChange={(e) => setThem({ ...them, company: e.target.value })} />
        <FunnelInput label="Their name" optional value={them.name} onChange={(e) => setThem({ ...them, name: e.target.value })} />
        <FunnelInput label="Their email or phone" value={them.contact} onChange={(e) => setThem({ ...them, contact: e.target.value })} />
        <FunnelTextarea label="Anything we should know" optional placeholder="What's bothering them about the brand, and have you mentioned us?" value={them.note} onChange={(e) => setThem({ ...them, note: e.target.value })} />
      </fieldset>

      {error && <p className="-mt-4 text-sm text-red-400">{error}</p>}

      <div>
        <PrimaryButton type="submit" loading={busy} disabled={busy} className="w-full sm:w-auto">
          Send the introduction
          <ArrowRight className="size-4" />
        </PrimaryButton>
        <p className="mt-3 text-xs font-medium text-faint">
          We only contact them once, and we say who introduced us.
        </p>
      </div>
    </form>
  );
}
