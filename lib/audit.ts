/**
 * Automated Brand Audit (§lead magnets) — shared types. Pure data, safe for
 * client and server. Findings generation lives in lib/server/audit-findings.ts.
 *
 * Unlike the Brand Ranking Quiz (self-assessment + benchmark), the audit is
 * fully automated: we look at the user's site and market and report what we
 * actually found. Same pipeline (Apify SERP + Firecrawl extraction), no
 * questions.
 */
import type { BenchmarkResult } from "@/lib/quiz";

export type AuditSeverity = "critical" | "warning" | "good";

export type AuditFinding = {
  id: string;
  severity: AuditSeverity;
  title: string;
  detail: string;
};

export type AuditResults = {
  sessionId: string;
  /** Benchmark score /100, or null when the automated audit couldn't run. */
  score: number | null;
  findings: AuditFinding[];
  benchmark: BenchmarkResult | null;
};

export const SEVERITY_LABELS: Record<AuditSeverity, string> = {
  critical: "Fix first",
  warning: "Worth fixing",
  good: "Working for you",
};
