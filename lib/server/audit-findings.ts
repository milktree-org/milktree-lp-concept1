import "server-only";

import type { BenchmarkResult } from "@/lib/quiz";
import type { AuditFinding } from "@/lib/audit";

/**
 * Rules-based findings from the automated audit (SERP + brand extraction).
 * Every finding is grounded in something we actually observed — no invented
 * problems, no generic advice dressed as analysis. Ordered critical →
 * warning → good so "fix first" leads the report.
 */
export function generateFindings(
  benchmark: BenchmarkResult,
  company: string,
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const b = benchmark.userBrand;
  const competitorNames = benchmark.competitors
    .slice(0, 3)
    .map((c) => c.name || c.domain);

  /* ------------------------------ Search ------------------------------ */
  if (benchmark.tier !== "none") {
    if (benchmark.userBestPosition === null) {
      findings.push({
        id: "search-invisible",
        severity: "critical",
        title: "Invisible in your market's search results",
        detail: `You don't appear in the top 20 Google results for ${benchmark.terms
          .map((t) => `“${t}”`)
          .join(" or ")} — the terms your customers actually type. ${
          competitorNames.length
            ? `${competitorNames.join(", ")} own page 1 instead.`
            : ""
        }`.trim(),
      });
    } else if (benchmark.userBestPosition > 10) {
      findings.push({
        id: "search-page2",
        severity: "warning",
        title: "Stuck on page 2 of Google",
        detail: `Your best position is #${benchmark.userBestPosition} for “${benchmark.userBestTerm}”. Page 2 gets under 1% of clicks — page 1 is where the enquiries are.`,
      });
    } else if (benchmark.userBestPosition > 3) {
      findings.push({
        id: "search-page1",
        severity: "warning",
        title: "On page 1, below the fold",
        detail: `You rank #${benchmark.userBestPosition} for “${benchmark.userBestTerm}”. Good — but the top 3 positions take the majority of clicks, and that's where your competitors sit.`,
      });
    } else {
      findings.push({
        id: "search-top3",
        severity: "good",
        title: "Top 3 in your market's search results",
        detail: `You rank #${benchmark.userBestPosition} for “${benchmark.userBestTerm}”. Strong visibility — the audit below is about converting that attention.`,
      });
    }
  }

  /* ----------------------------- Messaging ----------------------------- */
  if (b) {
    if (!b.headline) {
      findings.push({
        id: "headline-missing",
        severity: "critical",
        title: "No clear headline message",
        detail:
          "We couldn't find a title or headline on your site. The first line visitors (and Google) read is missing — that's the single fastest thing to fix.",
      });
    } else if (b.headline.length > 70) {
      findings.push({
        id: "headline-long",
        severity: "warning",
        title: "Your headline is doing too much",
        detail: `Your site leads with “${b.headline.slice(0, 90)}${b.headline.length > 90 ? "…" : ""}” — ${b.headline.length} characters. Google truncates around 60, and visitors skim. Say what you do, for whom, in under 10 words.`,
      });
    } else {
      findings.push({
        id: "headline-good",
        severity: "good",
        title: "Clear, tight headline",
        detail: `“${b.headline}” — concise enough to survive search results and a 3-second skim.`,
      });
    }

    if (!b.description) {
      findings.push({
        id: "description-missing",
        severity: "warning",
        title: "No meta description",
        detail:
          "Google is writing your sales pitch for you by scraping random page text. A deliberate 150-character description is a 10-minute fix that lifts click-through.",
      });
    } else {
      findings.push({
        id: "description-good",
        severity: "good",
        title: "Meta description in place",
        detail:
          "Your search snippet is deliberate, not scraped. More of your funnel is under your control.",
      });
    }

    /* ------------------------------ Visual ------------------------------ */
    if (b.colors && b.colors.length > 5) {
      findings.push({
        id: "palette-drift",
        severity: "warning",
        title: "Palette drift",
        detail: `We extracted ${b.colors.length}+ colours from your site. Strong brands hold 3–5. Every extra colour is usually a template, freelancer or era that never got reconciled.`,
      });
    } else if (b.colors && b.colors.length > 0) {
      findings.push({
        id: "palette-good",
        severity: "good",
        title: "Disciplined colour palette",
        detail: `${b.colors.length} core colour${b.colors.length === 1 ? "" : "s"} detected — a contained palette is the backbone of looking consistent everywhere.`,
      });
    }

    if (b.fonts && b.fonts.length > 3) {
      findings.push({
        id: "type-drift",
        severity: "warning",
        title: "Too many typefaces",
        detail: `${b.fonts.length} font families detected (${b.fonts.slice(0, 4).join(", ")}). Premium brands run one or two. Mixed type is the quickest visual tell of DIY design.`,
      });
    } else if (b.fonts && b.fonts.length > 0) {
      findings.push({
        id: "type-good",
        severity: "good",
        title: "Typography under control",
        detail: `${b.fonts.length} font famil${b.fonts.length === 1 ? "y" : "ies"} (${b.fonts.join(", ")}) — disciplined type is doing quiet work for your credibility.`,
      });
    }
  } else {
    findings.push({
      id: "site-unreadable",
      severity: "warning",
      title: "We couldn't read your site automatically",
      detail:
        "Your site blocked or timed out our brand extraction, so the visual audit is limited to the search benchmark. That can also mean slow loading — worth checking your site speed.",
    });
  }

  /* ------------------------- Competitive context ------------------------ */
  const polishedCompetitors = benchmark.competitors.filter(
    (c) => c.brand?.headline && c.brand.description,
  );
  if (
    polishedCompetitors.length >= 2 &&
    b &&
    (!b.headline || !b.description)
  ) {
    findings.push({
      id: "competitor-polish",
      severity: "critical",
      title: "The page-1 players look sharper than you",
      detail: `${polishedCompetitors
        .map((c) => c.name || c.domain)
        .join(" and ")} both run tight headlines and deliberate search snippets. When a customer compares tabs, ${company} loses the first impression before anyone reads a word.`,
    });
  }

  const order = { critical: 0, warning: 1, good: 2 } as const;
  return findings.sort((x, y) => order[x.severity] - order[y.severity]);
}
