"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Shared UI language for the qualification form and the brand-report quiz:
 * one question per screen, big tappable option cards, progress bar, back
 * navigation. Inputs follow the funnel spec — #0A0A0A bg, #1A1A1A border,
 * 12px radius; primary buttons are the 44px-radius yellow pill.
 */

export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="h-1 w-full overflow-hidden rounded-full bg-white/10"
    >
      <motion.div
        className="h-full rounded-full bg-brand"
        initial={false}
        animate={{ width: `${Math.max(4, value * 100)}%` }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      />
    </div>
  );
}

/* One question per screen — slides in/out horizontally. */
const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -32,
    transition: { duration: 0.25, ease: EASE_OUT_EXPO },
  }),
};

export function StepPanel({
  direction,
  stepKey,
  children,
}: {
  direction: number;
  stepKey: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={stepKey}
      custom={reduce ? 0 : direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export function StepHeading({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-balance text-[clamp(1.6rem,4.5vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      {sub && <p className="text-body mt-3 text-[0.95rem]">{sub}</p>}
    </div>
  );
}

export function OptionCard({
  icon: Icon,
  label,
  selected,
  onSelect,
  autoFocus,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  selected: boolean;
  onSelect: () => void;
  autoFocus?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      autoFocus={autoFocus}
      data-cursor="hover"
      aria-pressed={selected}
      className={cn(
        "group flex min-h-[64px] w-full items-center gap-4 rounded-2xl border bg-[#0A0A0A] px-5 py-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
        selected
          ? "border-brand bg-brand/[0.08]"
          : "border-[#1A1A1A] hover:border-white/25 hover:bg-white/[0.03] active:scale-[0.99]",
      )}
    >
      {Icon && (
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-200",
            selected
              ? "bg-brand text-brand-ink"
              : "bg-white/5 text-foreground group-hover:bg-white/10",
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
      <span className="text-[1.02rem] font-bold tracking-tight text-foreground">
        {label}
      </span>
    </button>
  );
}

export function FunnelInput({
  label,
  optional,
  ...props
}: {
  label: string;
  optional?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline gap-2 text-sm font-bold text-foreground">
        {label}
        {optional && (
          <span className="text-xs font-medium text-faint">optional</span>
        )}
      </span>
      <input
        {...props}
        className={cn(
          "h-13 w-full rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-4 text-base text-foreground placeholder:text-white/25",
          "transition-colors focus:border-brand/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
          props.className,
        )}
      />
    </label>
  );
}

export function FunnelTextarea({
  label,
  optional,
  ...props
}: {
  label: string;
  optional?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline gap-2 text-sm font-bold text-foreground">
        {label}
        {optional && (
          <span className="text-xs font-medium text-faint">optional</span>
        )}
      </span>
      <textarea
        rows={4}
        {...props}
        className={cn(
          "w-full resize-none rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-white/25",
          "transition-colors focus:border-brand/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
          props.className,
        )}
      />
    </label>
  );
}

export function BackButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
    >
      <ArrowLeft className="size-4" />
      Back
    </button>
  );
}

export function PrimaryButton({
  children,
  loading,
  ...props
}: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      data-cursor="hover"
      className={cn(
        "inline-flex h-13 items-center justify-center gap-2 rounded-[44px] bg-brand px-8 text-[0.98rem] font-bold text-brand-ink transition-all",
        "hover:brightness-105 hover:shadow-[0_10px_40px_-8px_rgba(255,220,4,0.55)]",
        "disabled:pointer-events-none disabled:opacity-50",
        props.className,
      )}
    >
      {loading ? "One moment…" : children}
    </button>
  );
}

export function ConsentCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 accent-[#FFEE02]"
      />
      <span className="text-sm leading-relaxed text-muted-foreground">
        {label}
      </span>
    </label>
  );
}
