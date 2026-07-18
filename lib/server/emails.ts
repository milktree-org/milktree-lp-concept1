import "server-only";

/**
 * On-brand transactional email templates (black canvas, yellow accent,
 * Satoshi with system fallback). Plain HTML strings — no client runtime.
 */

const SITE_URL = "https://www.milktreeagency.com";
const YELLOW = "#FFDC04";
const FONT = "'Satoshi', Helvetica, Arial, sans-serif";

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
                <p style="margin:0 0 28px;font-family:${FONT};font-size:22px;font-weight:800;color:${YELLOW};letter-spacing:-0.02em;">milktree</p>
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

/* --------------------------- Quiz report email ---------------------------- */

import type { BenchmarkResult, QuizCategory } from "@/lib/quiz";
import { CATEGORY_LABELS } from "@/lib/quiz";

export function quizReportEmail(input: {
  company: string;
  score: number;
  categoryScores: Record<QuizCategory, number>;
  actions: string[];
  benchmark: BenchmarkResult | null;
}): { subject: string; html: string; text: string } {
  const subject = `Your Brand Ranking Report — ${input.company} scored ${input.score}/100`;

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
    const positionLine =
      bm.userBestPosition !== null
        ? `You rank <strong style="color:#ffffff;">#${bm.userBestPosition}</strong> for “${bm.userBestTerm}” — these three own page 1.`
        : `You don't appear in the top 20 results for the terms your customers type — these three own page 1.`;
    benchmarkHtml = `
      ${p(`<strong style="color:#ffffff;">You vs the top 3 in your market.</strong> Positions are live Google results for: ${bm.terms.map((t) => `“${t}”`).join(", ")}.`)}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px;">${compRows}</table>
      ${p(positionLine)}
    `;
    benchmarkText = [
      "You vs the top 3 in your market:",
      ...bm.competitors.map((c) => `  ${c.name || c.domain} (${c.domain}) — best position #${c.bestPosition}`),
      bm.userBestPosition !== null
        ? `You rank #${bm.userBestPosition} for "${bm.userBestTerm}".`
        : "You don't appear in the top 20 for your key terms.",
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

  const html = shell(`
    ${h(`${input.company} — Brand Score <span style="color:${YELLOW};">${input.score}/100</span>`)}
    ${p("Here's your full Brand Ranking Report — score breakdown, how you stack up against the players dominating your market's search results, and the 10 fixes that will move the needle fastest.")}
    <p style="margin:0 0 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Score breakdown</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">${scoreRows}</table>
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
    benchmarkText,
    "Your 10 fixes:",
    ...input.actions.map((a, i) => `  ${i + 1}. ${a}`),
    "",
    "When you're ready for a team to do this for you, Milktree starts at £1,999/mo.",
    `${SITE_URL}/#plans`,
  ].join("\n");

  return { subject, html, text };
}
