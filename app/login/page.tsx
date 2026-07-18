"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/layout/wordmark";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* Real provider marks, drawn inline so they render crisply on the dark UI. */

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.53 5.53 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 1.27 6.61l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.36 12.76c-.02-2.05 1.68-3.03 1.75-3.08-.95-1.4-2.44-1.59-2.97-1.61-1.26-.13-2.47.74-3.11.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.04-1.43 2.48-.37 6.16 1.03 8.17.68.99 1.49 2.09 2.56 2.05 1.03-.04 1.42-.66 2.66-.66 1.24 0 1.59.66 2.68.64 1.11-.02 1.81-1 2.48-2 .79-1.14 1.11-2.25 1.13-2.31-.02-.01-2.15-.83-2.17-3.28ZM14.31 6.74c.57-.69.95-1.64.85-2.6-.82.03-1.81.55-2.4 1.23-.53.61-.99 1.59-.86 2.53.91.07 1.84-.46 2.41-1.16Z" />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3.01 1.8-4.67 4.54-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z"
      />
      <path
        fill="#fff"
        d="m16.67 15.47.53-3.47h-3.32V9.74c0-.95.46-1.87 1.95-1.87h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.54 1.66-4.54 4.67V12H7.08v3.47h3.04v8.38a12.09 12.09 0 0 0 3.76 0v-8.38h2.79Z"
      />
    </svg>
  );
}

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

const providers = [
  { name: "Google", Logo: GoogleLogo },
  { name: "Apple", Logo: AppleLogo },
  { name: "Facebook", Logo: FacebookLogo },
  { name: "Microsoft", Logo: MicrosoftLogo },
] as const;

const NOT_FOUND_MESSAGE =
  "User not found. Check the email you used, or contact your account lead.";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* Demo-only auth: every attempt resolves to "user not found". */
  function attempt(kind: string) {
    if (loading) return;
    setError(null);
    setLoading(kind);
    window.setTimeout(() => {
      setLoading(null);
      setError(NOT_FOUND_MESSAGE);
    }, 750);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    attempt("continue");
  }

  return (
    <div className="relative flex min-h-dvh bg-background">
      <Link
        href="/"
        aria-label="Close and return to Milktree"
        data-cursor="hover"
        className="fixed right-5 top-5 z-50 inline-flex size-11 items-center justify-center rounded-full border border-border bg-black/40 text-foreground backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/10 sm:right-6 sm:top-6"
      >
        <X className="size-5" />
      </Link>

      {/* Left — auth panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[42%] lg:min-w-[480px] lg:px-16 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="mx-auto w-full max-w-sm"
        >
          <Link href="/" aria-label="Milktree — home" className="inline-flex">
            <Wordmark className="h-6" />
          </Link>

          <h1 className="mt-10 text-xl font-bold tracking-tight text-foreground">
            Log in to continue
          </h1>

          <form onSubmit={onSubmit} className="mt-8" noValidate>
            <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-foreground">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "h-12 w-full rounded-xl border bg-[#0A0A0A] px-4 text-base text-foreground placeholder:text-white/25",
                "transition-colors focus:border-brand/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                error ? "border-red-500/60" : "border-[#1A1A1A]",
              )}
            />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                  className="overflow-hidden pt-2 text-sm font-medium text-red-400"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                data-cursor="hover"
                disabled={loading !== null || email.trim() === ""}
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 text-[0.95rem] font-bold text-brand-ink transition-all",
                  "hover:brightness-105 hover:shadow-[0_10px_40px_-8px_rgba(255,220,4,0.45)]",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {loading === "continue" ? "One moment…" : "Continue"}
              </button>
              <button
                type="button"
                data-cursor="hover"
                disabled={loading !== null || email.trim() === ""}
                onClick={() => attempt("magic-link")}
                className={cn(
                  "inline-flex h-12 items-center justify-center rounded-full border border-border bg-transparent px-6 text-[0.95rem] font-bold text-foreground transition-colors",
                  "hover:border-white/30 hover:bg-white/5",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {loading === "magic-link" ? "One moment…" : "Email me a login link"}
              </button>
            </div>
          </form>

          <hr className="mt-9 border-border" />

          <div className="mt-8 flex items-baseline justify-between gap-4">
            <span className="text-sm font-bold text-foreground">Or login with</span>
            <span className="text-xs font-medium text-faint">
              Client accounts only
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {providers.map(({ name, Logo }) => (
              <button
                key={name}
                type="button"
                data-cursor="hover"
                aria-label={`Log in with ${name}`}
                disabled={loading !== null}
                onClick={() => attempt(name)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] text-foreground transition-colors",
                  "hover:border-white/25 hover:bg-white/[0.04]",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <Logo className="size-5" />
              </button>
            ))}
          </div>

          <hr className="mt-9 border-border" />

          <div className="mt-8 text-center">
            <a
              href="mailto:hello@milktreeagency.com?subject=Can%27t%20log%20in"
              className="text-sm font-bold text-foreground underline underline-offset-4 transition-colors hover:text-brand"
            >
              Can&apos;t log in?
            </a>
            <p className="mt-6 text-xs leading-relaxed text-faint">
              By signing in, I agree to the Milktree{" "}
              <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-foreground">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right — portfolio piece, full-bleed */}
      <div className="relative hidden lg:block lg:flex-1">
        <Image
          src="/work/portfolio/eazyphone-identity.webp"
          alt="EazyPhone brand identity by Milktree"
          fill
          priority
          sizes="58vw"
          className="object-cover"
        />
        <div className="absolute bottom-6 right-6 rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs font-bold tracking-tight text-white backdrop-blur-md">
          EazyPhone · Brand Identity by Milktree
        </div>
      </div>
    </div>
  );
}
