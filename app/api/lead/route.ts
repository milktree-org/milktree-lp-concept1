import { after } from "next/server";
import {
  evaluateRoute,
  validateLeadSubmission,
} from "@/lib/server/qualification";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { sendToFormspree } from "@/lib/server/formspree";
import { sendToGhlWebhook, ghlAttribution } from "@/lib/server/ghl";
import {
  getResend,
  FROM,
  REPLY_TO,
  NOTIFY_TO,
  addToNurture,
  notifySlack,
} from "@/lib/server/resend";
import { productFollowUpEmail, teamNotifyEmail } from "@/lib/server/emails";
import {
  NEED_OPTIONS,
  SECTOR_OPTIONS,
  TEAM_OPTIONS,
  TIMING_OPTIONS,
  optionLabel,
  type LeadSubmission,
  type LeadRoute,
} from "@/lib/funnel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/lead — the start form's single write path (spec §6.10).
 *
 * Non-negotiable ordering (zero lead loss):
 *   1. validate
 *   2. route server-side by product (client route values are ignored)
 *   3. AWAIT persistence — Formspree (intake endpoint) and Supabase in
 *      parallel; the request only fails if BOTH stores fail
 *   4. respond with the route
 *   5. after(): Resend follow-up email, team notify, GHL, nurture add —
 *      failures are logged and never affect the stored lead or the response
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`lead:${requestIp(request)}`, 20, 600);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validated = validateLeadSubmission(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }
  const lead = validated.data;
  const route = evaluateRoute(lead);
  const labels = labelsFor(lead);

  // Persist FIRST — Formspree and Supabase in parallel. As long as one store
  // has the lead we proceed; if both fail the client gets a 500 and can retry,
  // and we fire a best-effort team notify so the lead isn't lost silently.
  const [formspreeStored, supabaseInsert] = await Promise.all([
    sendToFormspree("intake", {
      _subject: `New ${route} lead — ${lead.company}`,
      form: "intake",
      route,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? "",
      company: lead.company,
      website: lead.website,
      need: labels.need,
      sector: labels.sector,
      teamSize: labels.teamSize,
      timing: labels.timing,
      consent: lead.consent,
      attribution: lead.attribution ?? undefined,
    }),
    insertLead(lead, route),
  ]);

  const leadId = supabaseInsert.id;
  const supabaseStored = supabaseInsert.stored;

  if (!formspreeStored && !supabaseStored) {
    after(() => notifyTeam(lead, route, "ALL STORES FAILED — lead only in this notification"));
    return Response.json(
      { error: "Something went wrong saving your details. Please try again." },
      { status: 500 },
    );
  }

  const firstName = lead.name.split(" ")[0];
  const lastName = lead.name.split(" ").slice(1).join(" ") || undefined;

  after(async () => {
    await Promise.allSettled([
      sendFollowUpEmail(lead, route, leadId),
      notifyTeam(lead, route),
      sendToGhlWebhook("lead", {
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? "",
        firstName,
        lastName,
        first_name: firstName,
        last_name: lastName,
        company: lead.company,
        website: lead.website,
        route,
        product: lead.need,
        need: labels.need,
        sector: labels.sector,
        teamSize: labels.teamSize,
        timing: labels.timing,
        consent: lead.consent,
        leadId,
        source: "start-form",
        tags: ["start-form", `start-${route}`, `product-${lead.need}`, `sector-${lead.sector}`],
        ...ghlAttribution(lead.attribution),
      }),
      lead.consent
        ? addToNurture({
            email: lead.email,
            firstName,
            lastName,
          }).catch((e) => console.error("[lead] nurture add failed:", e))
        : Promise.resolve(),
    ]);
  });

  return Response.json({ route, leadId });
}

function labelsFor(lead: LeadSubmission) {
  return {
    need: optionLabel(NEED_OPTIONS, lead.need),
    sector: optionLabel(SECTOR_OPTIONS, lead.sector),
    teamSize: optionLabel(TEAM_OPTIONS, lead.teamSize),
    timing: optionLabel(TIMING_OPTIONS, lead.timing),
  };
}

/**
 * Insert into website_leads. The phase-1 columns (product, sector, timing)
 * are added by supabase/migrations/20260909_website_leads_product_routing.sql;
 * if the migration hasn't run yet, retry with the legacy shape so the lead is
 * still stored, and log loudly.
 */
async function insertLead(
  lead: LeadSubmission,
  route: LeadRoute,
): Promise<{ id: string | null; stored: boolean }> {
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[lead] Supabase not configured; relying on Formspree:", lead.email);
    return { id: null, stored: false };
  }

  const base = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? null,
    company: lead.company,
    website: lead.website || null,
    need: lead.need,
    team_size: lead.teamSize,
    route,
    consent: lead.consent,
    source: "start-form",
    attribution: lead.attribution ?? null,
  };

  const first = await supabase
    .from("website_leads")
    .insert({ ...base, product: lead.need, sector: lead.sector, timing: lead.timing })
    .select("id")
    .single();
  if (!first.error) return { id: first.data.id, stored: true };

  const missingColumn = /column .* does not exist|schema cache/i.test(first.error.message);
  if (!missingColumn) {
    console.error("[lead] insert failed:", first.error.message);
    return { id: null, stored: false };
  }

  console.error(
    "[lead] website_leads is missing the phase-1 columns; run supabase/migrations/20260909_website_leads_product_routing.sql. Storing legacy shape.",
  );
  const second = await supabase
    .from("website_leads")
    .insert({ ...base, budget: null, marketing_function: null })
    .select("id")
    .single();
  if (second.error) {
    console.error("[lead] legacy insert failed:", second.error.message);
    return { id: null, stored: false };
  }
  return { id: second.data.id, stored: true };
}

async function sendFollowUpEmail(lead: LeadSubmission, route: LeadRoute, leadId: string | null) {
  const resend = getResend();
  if (!resend) return;
  try {
    const email = productFollowUpEmail({
      firstName: lead.name.split(" ")[0] || "there",
      route,
    });
    await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to: lead.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    const supabase = getSupabase();
    if (supabase && leadId) {
      await supabase
        .from("website_leads")
        .update({ emailed_at: new Date().toISOString() })
        .eq("id", leadId);
    }
  } catch (e) {
    console.error("[lead] follow-up email failed:", e);
  }
}

async function notifyTeam(
  lead: LeadSubmission,
  route: LeadRoute,
  warning?: string,
) {
  const labels = labelsFor(lead);
  const details = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    website: lead.website,
    ...labels,
    route,
  };

  try {
    const slackText = [
      warning ? `:rotating_light: ${warning}` : null,
      `*New ${route} lead* — ${details.company}`,
      `${details.name} · ${details.email}${details.phone ? ` · ${details.phone}` : ""}`,
      `Wants: ${details.need} · Sector: ${details.sector} · Team: ${details.teamSize} · When: ${details.timing}`,
    ]
      .filter(Boolean)
      .join("\n");

    const sentToSlack = await notifySlack(slackText).catch(() => false);
    if (!sentToSlack) {
      const resend = getResend();
      if (!resend) return;
      const email = teamNotifyEmail(details);
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: warning ? `⚠ ${email.subject}` : email.subject,
        html: email.html,
        text: email.text,
      });
    }
  } catch (e) {
    console.error("[lead] team notify failed:", e);
  }
}
