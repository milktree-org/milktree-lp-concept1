import "server-only";

/**
 * On-brand transactional email templates (black canvas, yellow accent,
 * Satoshi with system fallback). Plain HTML strings — no client runtime.
 */

const SITE_URL = "https://www.milktreeagency.com";
const YELLOW = "#FFEE02";
const FONT = "'Satoshi', Helvetica, Arial, sans-serif";

/**
 * The wordmark as a PNG (email clients don't render our SVG), served from the
 * same CDN as the newsletter template so every Milktree email uses one asset.
 * Source is 1920x600 with padding; 150px wide matches the newsletter.
 */
const LOGO_URL =
  process.env.EMAIL_LOGO_URL ??
  "https://assets.cdn.filesafe.space/igKHuWSittZeJWvwNFZ4/media/6a62842af7d31b0eb4400104.png";
const LOGO_WIDTH = 150;
const LOGO_HEIGHT = 47;

/** The lead-facing document link. Resolves to the PDF once it's published. */
export function docDownloadUrl(sessionId: string): string {
  return `${SITE_URL}/brand-score-doc/${sessionId}/download`;
}

function shell(content: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#000000;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0A0A0A;border:1px solid #1A1A1A;border-radius:24px;">
            <tr>
              <td style="padding:36px 36px 28px;">
                <p style="margin:0 0 28px;">
                  <a href="${SITE_URL}" style="text-decoration:none;">
                    <img src="${LOGO_URL}" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}" alt="Milktree" style="display:block;width:${LOGO_WIDTH}px;height:${LOGO_HEIGHT}px;border:0;outline:none;font-family:${FONT};font-size:22px;font-weight:800;color:${YELLOW};letter-spacing:-0.02em;text-decoration:none;" />
                  </a>
                </p>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px 32px;border-top:1px solid #1A1A1A;">
                <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:rgba(255,255,255,0.4);">
                  Milktree — your creative department, on demand. UK-based.<br/>
                  You're receiving this because you contacted us at
                  <a href="${SITE_URL}" style="color:rgba(255,255,255,0.55);">milktreeagency.com</a>.
                  To manage your email preferences or stop hearing from us, just reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const h = (text: string) =>
  `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:26px;line-height:1.15;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">${text}</h1>`;

const p = (text: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:rgba(255,255,255,0.7);">${text}</p>`;

const button = (label: string, href: string) =>
  `<a href="${href}" style="display:inline-block;margin:8px 0 20px;padding:14px 30px;background:${YELLOW};color:#000000;font-family:${FONT};font-size:15px;font-weight:700;text-decoration:none;border-radius:44px;">${label}</a>`;

const planCard = (name: string, price: string, lines: string[], highlight = false) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;background:${highlight ? "rgba(255,220,4,0.06)" : "#141200"};border:1px solid ${highlight ? "rgba(255,220,4,0.4)" : "#1A1A1A"};border-radius:16px;">
    <tr>
      <td style="padding:20px 22px;">
        <p style="margin:0;font-family:${FONT};font-size:16px;font-weight:800;color:#ffffff;">${name} — <span style="color:${YELLOW};">${price}</span> <span style="font-size:12px;color:rgba(255,255,255,0.45);font-weight:500;">+VAT</span></p>
        <p style="margin:8px 0 0;font-family:${FONT};font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.65);">${lines.join("<br/>")}</p>
      </td>
    </tr>
  </table>`;

/* ------------------------- Qualified offer email -------------------------- */

export function qualifiedOfferEmail(input: {
  firstName: string;
  foundingSpots: number;
}): { subject: string; html: string; text: string } {
  const subject = "Milktree — how it works + your plan options";
  const bookUrl = `${SITE_URL}/book`;
  const onePagerUrl = `${SITE_URL}/docs/milktree-offer.pdf`;

  const html = shell(`
    ${h(`Hi ${input.firstName} — here's how Milktree works.`)}
    ${p(
      "Milktree becomes your embedded brand &amp; design team — unlimited requests, senior work back in around 48 hours, for one flat monthly fee. No proposals, no quotes, no hourly billing.",
    )}
    ${planCard("Essentials", "£1,999/mo", [
      "Unlimited requests, one at a time",
      "~48h turnaround · pause anytime, unused time banks",
    ])}
    ${planCard(
      "Design Lead",
      "£3,999/mo",
      [
        "Unlimited requests, two at a time",
        "Your own dedicated senior designer, plus creative direction on everything",
        "Direct Slack access to your design lead",
        "Full brand builds in 4–6 weeks",
      ],
      true,
    )}
    ${p(
      `<strong style="color:#ffffff;">Founding rate:</strong> the first 10 Design Lead clients lock <strong style="color:#ffffff;">£3,500/mo for life</strong> — ${input.foundingSpots} spots left.`,
    )}
    ${p("If you haven't already, grab a time for your intro call:")}
    ${button("Book your intro call", bookUrl)}
    ${p(
      `The one-pager with the full breakdown is here: <a href="${onePagerUrl}" style="color:${YELLOW};">Milktree — the offer (PDF)</a>.`,
    )}
    ${p("Speak soon,<br/>The Milktree team")}
  `);

  const text = [
    `Hi ${input.firstName} — here's how Milktree works.`,
    "",
    "Milktree becomes your embedded brand & design team — unlimited requests, senior work back in ~48 hours, one flat monthly fee.",
    "",
    "Essentials — £1,999/mo (+VAT): unlimited requests, one at a time, vetted designers matched per request and checked by a creative director, ~48h turnaround, pause anytime.",
    "Design Lead — £3,999/mo (+VAT): two at a time, your own dedicated senior designer reachable on Slack, creative direction on everything, brand builds in 4–6 weeks.",
    `Founding rate: first 10 Design Lead clients lock £3,500/mo for life — ${input.foundingSpots} spots left.`,
    "",
    `Book your intro call: ${bookUrl}`,
    `The offer one-pager: ${onePagerUrl}`,
    "",
    "Speak soon,",
    "The Milktree team",
  ].join("\n");

  return { subject, html, text };
}

/* --------------------------- Team notification ---------------------------- */

export function teamNotifyEmail(input: {
  name: string;
  email: string;
  phone?: string;
  company: string;
  website?: string;
  teamSize: string;
  budget: string;
  need: string;
  marketing: string;
  route: string;
}): { subject: string; html: string; text: string } {
  const subject = `New ${input.route} lead — ${input.company}`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.45);white-space:nowrap;">${label}</td><td style="padding:6px 0;font-family:${FONT};font-size:13px;color:#ffffff;">${value}</td></tr>`;

  const html = shell(`
    ${h(`New ${input.route} lead`)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      ${row("Name", input.name)}
      ${row("Email", input.email)}
      ${row("Phone", input.phone || "—")}
      ${row("Company", input.company)}
      ${row("Website", input.website || "—")}
      ${row("Team size", input.teamSize)}
      ${row("Budget", input.budget)}
      ${row("Needs", input.need)}
      ${row("Marketing function", input.marketing)}
      ${row("Route", input.route)}
      ${row("Booked", "Not yet — booking happens on the confirmation screen")}
    </table>
  `);

  const text = [
    `New ${input.route} lead`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "—"}`,
    `Company: ${input.company}`,
    `Website: ${input.website || "—"}`,
    `Team size: ${input.teamSize}`,
    `Budget: ${input.budget}`,
    `Needs: ${input.need}`,
    `Marketing function: ${input.marketing}`,
    `Route: ${input.route}`,
  ].join("\n");

  return { subject, html, text };
}

/* ------------------------- Brand audit email ------------------------------ */

import type { AuditFinding } from "@/lib/audit";
import { SEVERITY_LABELS } from "@/lib/audit";
import type { BenchmarkResult as AuditBenchmark } from "@/lib/quiz";

const SEVERITY_COLORS: Record<AuditFinding["severity"], string> = {
  critical: "#FF5C5C",
  warning: YELLOW,
  good: "rgba(255,255,255,0.45)",
};

export function auditReportEmail(input: {
  company: string;
  score: number | null;
  findings: AuditFinding[];
  benchmark: AuditBenchmark | null;
}): { subject: string; html: string; text: string } {
  const subject =
    input.score !== null
      ? `Your Brand Audit — ${input.company} scored ${input.score}/100`
      : `Your Brand Audit — ${input.company}`;

  const findingRows = input.findings
    .map(
      (f) => `
      <tr>
        <td style="padding:10px 12px 10px 0;vertical-align:top;white-space:nowrap;">
          <span style="font-family:${FONT};font-size:10.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${SEVERITY_COLORS[f.severity]};">${SEVERITY_LABELS[f.severity]}</span>
        </td>
        <td style="padding:10px 0;">
          <p style="margin:0;font-family:${FONT};font-size:14px;font-weight:800;color:#ffffff;">${f.title}</p>
          <p style="margin:4px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:rgba(255,255,255,0.65);">${f.detail}</p>
        </td>
      </tr>`,
    )
    .join("");

  const bm = input.benchmark;
  let benchmarkHtml = "";
  let benchmarkText = "";
  if (bm && bm.competitors.length > 0) {
    const compRows = bm.competitors
      .map(
        (c) => `
        <tr>
          <td style="padding:8px 12px 8px 0;font-family:${FONT};font-size:13.5px;color:#ffffff;font-weight:700;">${c.name || c.domain}</td>
          <td style="padding:8px 12px 8px 0;font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.55);">${c.domain}</td>
          <td style="padding:8px 0;font-family:${FONT};font-size:13.5px;color:${YELLOW};font-weight:700;">#${c.bestPosition}</td>
        </tr>`,
      )
      .join("");
    benchmarkHtml = `
      <p style="margin:20px 0 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);">You vs the page-1 players</p>
      ${p(`Live Google results for ${bm.terms.map((t) => `“${t}”`).join(", ")}:`)}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">${compRows}</table>
      ${p(
        bm.userBestPosition !== null
          ? `${input.company} ranks <strong style="color:#ffffff;">#${bm.userBestPosition}</strong> for “${bm.userBestTerm}”.`
          : `${input.company} doesn't appear in the top 20 for these terms.`,
      )}
    `;
    benchmarkText = [
      "You vs the page-1 players:",
      ...bm.competitors.map(
        (c) => `  ${c.name || c.domain} (${c.domain}) — best position #${c.bestPosition}`,
      ),
      bm.userBestPosition !== null
        ? `  ${input.company} — #${bm.userBestPosition} for "${bm.userBestTerm}"`
        : `  ${input.company} — not in the top 20`,
      "",
    ].join("\n");
  }

  const html = shell(`
    ${h(
      input.score !== null
        ? `${input.company} — Brand Audit <span style="color:${YELLOW};">${input.score}/100</span>`
        : `${input.company} — Brand Audit`,
    )}
    ${p(
      "This is what we actually found when we looked at your website and your market's live search results — no self-assessment, no fluff. Keep it, forward it, action it.",
    )}
    <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Findings</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;">${findingRows}</table>
    ${benchmarkHtml}
    ${p(
      `Every “fix first” item above is a standard request on a Milktree plan — from <strong style="color:#ffffff;">£1,999/mo</strong>, unlimited requests, senior work back in ~48 hours, cancel any month.`,
    )}
    ${button("See if Milktree fits", `${SITE_URL}/start`)}
  `);

  const text = [
    input.score !== null
      ? `${input.company} — Brand Audit ${input.score}/100`
      : `${input.company} — Brand Audit`,
    "",
    "Findings:",
    ...input.findings.map(
      (f) => `  [${SEVERITY_LABELS[f.severity]}] ${f.title} — ${f.detail}`,
    ),
    "",
    benchmarkText,
    "Every 'fix first' item is a standard request on a Milktree plan — from £1,999/mo.",
    `See if Milktree fits: ${SITE_URL}/start`,
  ].join("\n");

  return { subject, html, text };
}

/* ----------------------- Hire calculator email ---------------------------- */

import {
  PLAN_COSTS,
  formatGBP,
  type CostBreakdown,
} from "@/lib/calculator";

export function calculatorReportEmail(input: {
  firstName?: string;
  roleLabel: string;
  breakdown: CostBreakdown;
}): { subject: string; html: string; text: string } {
  const { breakdown } = input;
  const subject = `The real cost of that ${input.roleLabel.toLowerCase()}: ${formatGBP(breakdown.total)}`;
  const greeting = input.firstName ? `Hi ${input.firstName} — ` : "";
  const saving = breakdown.total - PLAN_COSTS.designLead.annual;

  const lineRows = breakdown.lines
    .map(
      (l) => `
      <tr>
        <td style="padding:8px 12px 8px 0;font-family:${FONT};font-size:13.5px;color:#ffffff;font-weight:700;">${l.label}<br/><span style="font-size:12px;font-weight:400;color:rgba(255,255,255,0.45);">${l.detail}</span></td>
        <td style="padding:8px 0;font-family:${FONT};font-size:13.5px;font-weight:700;color:#ffffff;text-align:right;vertical-align:top;">${formatGBP(l.amount)}</td>
      </tr>`,
    )
    .join("");

  const html = shell(`
    ${h(`${greeting}here's the real number.`)}
    ${p(`The true first-year cost of hiring a ${input.roleLabel.toLowerCase()}, itemised:`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px;">
      ${lineRows}
      <tr>
        <td style="padding:14px 12px 0 0;border-top:1px solid rgba(255,255,255,0.15);font-family:${FONT};font-size:15px;font-weight:800;color:#ffffff;">Real cost, year one</td>
        <td style="padding:14px 0 0;border-top:1px solid rgba(255,255,255,0.15);font-family:${FONT};font-size:18px;font-weight:800;color:${YELLOW};text-align:right;">${formatGBP(breakdown.total)}</td>
      </tr>
    </table>
    ${p(`That's ${formatGBP(breakdown.monthly)}/month — for one skill set, three months of ramp-up, and a notice period if it doesn't work out.`)}
    ${p(`<strong style="color:#ffffff;">The same money at Milktree:</strong>`)}
    ${planCard("Essentials", "£1,999/mo", [
      `${formatGBP(PLAN_COSTS.essentials.annual)}/yr — unlimited requests, one at a time`,
      "~48h turnaround · pause anytime, unused time banks",
    ])}
    ${planCard(
      "Design Lead",
      "£3,999/mo",
      [
        `${formatGBP(PLAN_COSTS.designLead.annual)}/yr — unlimited requests, two at a time`,
        "Your own dedicated senior designer, direct on Slack",
        "Creative direction on everything · brand builds in 4–6 weeks",
      ],
      true,
    )}
    ${
      saving > 0
        ? p(
            `Against your numbers, Design Lead is <strong style="color:#ffffff;">${formatGBP(saving)} less in year one</strong> than the hire — senior across every discipline, starts this week, cancel any month.`,
          )
        : p(
            "Senior across every discipline, starts this week, cancel any month — with no recruitment risk and no notice periods.",
          )
    }
    ${button("See if Milktree fits", `${SITE_URL}/start`)}
    ${p("Two minutes, and you'll know which plan (if any) makes sense for you.")}
  `);

  const text = [
    `${greeting}here's the real number.`,
    "",
    `True first-year cost of hiring a ${input.roleLabel.toLowerCase()}:`,
    ...breakdown.lines.map((l) => `  ${l.label}: ${formatGBP(l.amount)} (${l.detail})`),
    `  Real cost, year one: ${formatGBP(breakdown.total)} — ${formatGBP(breakdown.monthly)}/month`,
    "",
    "The same money at Milktree:",
    `  Essentials — £1,999/mo (${formatGBP(PLAN_COSTS.essentials.annual)}/yr): unlimited requests, one at a time, ~48h turnaround, pause anytime.`,
    `  Design Lead — £3,999/mo (${formatGBP(PLAN_COSTS.designLead.annual)}/yr): two at a time, your own dedicated senior designer on Slack, creative direction on everything.`,
    saving > 0
      ? `Against your numbers, Design Lead is ${formatGBP(saving)} less in year one than the hire.`
      : "Senior across every discipline, starts this week, cancel any month.",
    "",
    `See if Milktree fits: ${SITE_URL}/start`,
  ].join("\n");

  return { subject, html, text };
}

/* ---------------------- Brand Score document email ------------------------ */

export function brandScoreDocEmail(input: {
  firstName: string;
  company: string;
  score: number | null;
  pdfUrl: string;
}): { subject: string; html: string; text: string } {
  const greeting = input.firstName ? `Hi ${input.firstName},` : "Hi,";
  const subject = input.firstName
    ? `${input.firstName}, your Brand Score document is ready`
    : "Your Brand Score document is ready";

  const html = shell(`
    ${h("Your Brand Score document is ready.")}
    ${p(greeting)}
    ${p(
      `As promised, here is your full Brand Score document for <strong style="color:#ffffff;">${input.company}</strong>: how your brand really ranks${
        input.score !== null
          ? ` (you scored <strong style="color:#ffffff;">${input.score}/100</strong>)`
          : ""
      }, your identity as your buyers meet it, who is winning your market right now, and the exact fixes we would make first.`,
    )}
    ${button("Download your Brand Score document", input.pdfUrl)}
    ${p(
      "Inside you'll find your score breakdown, a one-page read-out of your own brand pulled live from your site, the brands leading your space side by side, your 10 prioritised fixes and a 90-day roadmap you can run with any team.",
    )}
    ${p(
      `And if you'd rather skip the queue: Milktree is an embedded design team on a flat monthly fee, from <strong style="color:#ffffff;">£1,999/mo</strong>. Closing exactly these gaps is what we do every week.`,
    )}
    ${p(`<a href="${SITE_URL}/start" style="color:${YELLOW};font-weight:700;">Get started &rarr;</a>`)}
    ${p("— The Milktree team")}
  `);

  const text = [
    greeting,
    "",
    `As promised, here is your full Brand Score document for ${input.company}: how your brand really ranks${
      input.score !== null ? ` (you scored ${input.score}/100)` : ""
    }, your identity as your buyers meet it, who is winning your market right now, and the exact fixes we would make first.`,
    "",
    `Download your Brand Score document: ${input.pdfUrl}`,
    "",
    "Inside you'll find your score breakdown, a one-page read-out of your own brand pulled live from your site, the brands leading your space side by side, your 10 prioritised fixes and a 90-day roadmap you can run with any team.",
    "",
    "And if you'd rather skip the queue: Milktree is an embedded design team on a flat monthly fee, from £1,999/mo. Closing exactly these gaps is what we do every week.",
    `Get started: ${SITE_URL}/start`,
    "",
    "— The Milktree team",
  ].join("\n");

  return { subject, html, text };
}

/* --------------------------- Quiz report email ---------------------------- */

import type { BenchmarkResult, QuizCategory } from "@/lib/quiz";
import { CATEGORY_LABELS } from "@/lib/quiz";

export function quizReportEmail(input: {
  company: string;
  score: number;
  categoryScores: Record<QuizCategory, number>;
  actions: string[];
  benchmark: BenchmarkResult | null;
  /** Stable document link; the email's primary call to action when present. */
  docUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Your Brand Score — ${input.company} scored ${input.score}/100`;

  const scoreRows = (Object.entries(input.categoryScores) as [QuizCategory, number][])
    .map(
      ([category, score]) => `
      <tr>
        <td style="padding:7px 12px 7px 0;font-family:${FONT};font-size:13.5px;color:rgba(255,255,255,0.6);">${CATEGORY_LABELS[category]}</td>
        <td style="padding:7px 0;width:120px;">
          <div style="background:#1A1A1A;border-radius:99px;height:8px;width:120px;"><div style="background:${score >= 7 ? YELLOW : score >= 4 ? "rgba(255,220,4,0.55)" : "rgba(255,255,255,0.25)"};border-radius:99px;height:8px;width:${Math.max(6, score * 12)}px;"></div></div>
        </td>
        <td style="padding:7px 0 7px 10px;font-family:${FONT};font-size:13.5px;font-weight:700;color:#ffffff;">${score}/10</td>
      </tr>`,
    )
    .join("");

  const bm = input.benchmark;
  let benchmarkHtml = "";
  let benchmarkText = "";
  if (bm && bm.competitors.length > 0) {
    const compRows = bm.competitors
      .map(
        (c) => `
        <tr>
          <td style="padding:8px 12px 8px 0;font-family:${FONT};font-size:13.5px;color:#ffffff;font-weight:700;">${c.name || c.domain}</td>
          <td style="padding:8px 12px 8px 0;font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.55);">${c.domain}</td>
          <td style="padding:8px 0;font-family:${FONT};font-size:13.5px;color:${YELLOW};font-weight:700;">#${c.bestPosition}</td>
        </tr>`,
      )
      .join("");
    // Leads who already rank well must not be told they're invisible; the
    // line has to match the position we actually found.
    const rivals = "these three";
    const positionText =
      bm.userBestPosition === null
        ? `You don't appear in the top 20 results for the terms your customers type. Right now ${rivals} own page 1.`
        : bm.userBestPosition <= 3
          ? `You rank #${bm.userBestPosition} for “${bm.userBestTerm}”, which puts you ahead of your market. ${rivals[0].toUpperCase()}${rivals.slice(1)} are the names closest behind you, so the job now is holding the position.`
          : bm.userBestPosition <= 10
            ? `You rank #${bm.userBestPosition} for “${bm.userBestTerm}”. You're on page 1, but ${rivals} are the names your buyers see first.`
            : `Your best position is #${bm.userBestPosition} for “${bm.userBestTerm}”, past where most buyers stop looking. ${rivals[0].toUpperCase()}${rivals.slice(1)} own page 1.`;
    const positionLine = positionText.replace(
      /#(\d+)/,
      `<strong style="color:#ffffff;">#$1</strong>`,
    );
    benchmarkHtml = `
      ${p(`<strong style="color:#ffffff;">You vs the top 3 in your market.</strong> Positions are live Google results for: ${bm.terms.map((t) => `“${t}”`).join(", ")}.`)}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">${compRows}</table>
      ${p(positionLine)}
    `;
    benchmarkText = [
      "You vs the top 3 in your market:",
      ...bm.competitors.map((c) => `  ${c.name || c.domain} (${c.domain}): best position #${c.bestPosition}`),
      positionText,
      "",
    ].join("\n");

    const withBrand = bm.competitors.filter((c) => c.brand);
    if (withBrand.length > 0) {
      const brandRow = (label: string, extract: { colors?: string[]; fonts?: string[]; headline?: string } | null | undefined) => {
        const swatches = (extract?.colors ?? [])
          .slice(0, 5)
          .map(
            (c) =>
              `<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:${c};border:1px solid #1A1A1A;margin-right:4px;"></span>`,
          )
          .join("");
        return `
        <tr>
          <td style="padding:8px 12px 8px 0;font-family:${FONT};font-size:13px;font-weight:700;color:#ffffff;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:8px 12px 8px 0;vertical-align:top;">${swatches || `<span style="font-family:${FONT};font-size:12px;color:rgba(255,255,255,0.4);">—</span>`}</td>
          <td style="padding:8px 0;font-family:${FONT};font-size:12.5px;color:rgba(255,255,255,0.6);vertical-align:top;">${extract?.headline ? `“${extract.headline.slice(0, 80)}”` : "—"}</td>
        </tr>`;
      };
      benchmarkHtml += `
        ${p(`<strong style="color:#ffffff;">How the page-1 players present themselves vs you</strong> — palette and headline pulled from each site:`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">
          ${withBrand.map((c) => brandRow(c.name || c.domain, c.brand)).join("")}
          ${bm.userBrand ? brandRow(`${input.company} (you)`, bm.userBrand) : ""}
        </table>
      `;
    }
  } else {
    benchmarkHtml = p(
      "We couldn't complete the live market benchmark for your report, so your score is based on the self-assessment alone — honest data only, nothing made up.",
    );
    benchmarkText = "Live market benchmark unavailable — score based on self-assessment only.\n";
  }

  const actionsHtml = input.actions
    .map(
      (a, i) => `
      <tr>
        <td style="padding:8px 12px 8px 0;font-family:${FONT};font-size:14px;font-weight:800;color:${YELLOW};vertical-align:top;">${String(i + 1).padStart(2, "0")}</td>
        <td style="padding:8px 0;font-family:${FONT};font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.75);">${a}</td>
      </tr>`,
    )
    .join("");

  // The designed document is the better read, so it gets the primary CTA
  // high in the email, above the inline summary for skimmers.
  const docBlock = input.docUrl
    ? `
    ${p(
      `<strong style="color:#ffffff;">Your designed Brand Score document is ready to read.</strong> Your own brand identity pulled live from your site, the brands winning your market side by side, your fixes in priority order and a 90-day plan.`,
    )}
    ${button("Open your Brand Score document", input.docUrl)}`
    : "";

  const html = shell(`
    ${h(`${input.company} — Brand Score <span style="color:${YELLOW};">${input.score}/100</span>`)}
    ${p("Here's your full Brand Score: score breakdown, how you stack up against the players dominating your market's search results, and the 10 fixes that will move the needle fastest.")}
    <p style="margin:0 0 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Score breakdown</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">${scoreRows}</table>
    ${docBlock}
    ${benchmarkHtml}
    <p style="margin:20px 0 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Your 10 fixes</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">${actionsHtml}</table>
    ${p(
      `When you're ready for a team to do this for you, Milktree starts at <strong style="color:#ffffff;">£1,999/mo</strong> — unlimited requests, senior work back in ~48 hours, cancel any month.`,
    )}
    ${button("See how Milktree works", `${SITE_URL}/#plans`)}
  `);

  const text = [
    `${input.company} — Brand Score ${input.score}/100`,
    "",
    "Score breakdown:",
    ...(Object.entries(input.categoryScores) as [QuizCategory, number][]).map(
      ([c, s]) => `  ${CATEGORY_LABELS[c]}: ${s}/10`,
    ),
    "",
    ...(input.docUrl
      ? [
          "Your designed Brand Score document is ready to read: your own brand identity pulled live from your site, the brands winning your market side by side, your fixes in priority order and a 90-day plan.",
          input.docUrl,
          "",
        ]
      : []),
    benchmarkText,
    "Your 10 fixes:",
    ...input.actions.map((a, i) => `  ${i + 1}. ${a}`),
    "",
    "When you're ready for a team to do this for you, Milktree starts at £1,999/mo.",
    `${SITE_URL}/#plans`,
  ].join("\n");

  return { subject, html, text };
}
