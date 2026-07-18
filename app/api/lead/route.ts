import { after } from "next/server";
import {
  evaluateRoute,
  validateLeadSubmission,
} from "@/lib/server/qualification";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { getResend, FROM, NOTIFY_TO, addToNurture, notifySlack } from "@/lib/server/resend";
import { qualifiedOfferEmail, teamNotifyEmail } from "@/lib/server/emails";
import {
  NEED_OPTIONS,
  TEAM_OPTIONS,
  MARKETING_OPTIONS,
  BUDGET_OPTIONS,
  optionLabel,
  type LeadSubmission,
  type LeadRoute,
} from "@/lib/funnel";
import { foundingSpotsRemaining } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/lead — the qualification funnel's single write path.
 *
 * Non-negotiable ordering (zero lead loss):
 *   1. validate
 *   2. recompute qualification server-side (client route values are ignored)
 *   3. AWAIT the Supabase insert — nothing downstream runs until the lead
 *      is persisted
 *   4. respond with the route
 *   5. after(): Resend offer email, team notify, nurture add — failures are
 *      logged and never affect the stored lead or the response
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

  // Persist FIRST. If this fails the client gets a 500 and can retry; we also
  // fire a best-effort team notify so even a DB outage doesn't lose the lead.
  const supabase = getSupabase();
  let leadId: string | null = null;
  if (supabase) {
    const { data, error } = await supabase
      .from("website_leads")
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        company: lead.company,
        website: lead.website || null,
        need: lead.need,
        team_size: lead.teamSize,
        marketing_function: lead.marketing,
        budget: lead.budget,
        route,
        consent: lead.consent,
        source: "start-form",
        attribution: lead.attribution ?? null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[lead] insert failed:", error.message);
      after(() => notifyTeam(lead, route, "DB INSERT FAILED — lead only in this notification"));
      return Response.json(
        { error: "Something went wrong saving your details. Please try again." },
        { status: 500 },
      );
    }
    leadId = data.id;
  } else {
    // No persistence configured (local dev) — log loudly, keep the funnel usable.
    console.error("[lead] Supabase not configured; lead not persisted:", lead.email);
  }

  after(async () => {
    await Promise.allSettled([
      route === "qualified" ? sendQualifiedEmail(lead, leadId) : Promise.resolve(),
      notifyTeam(lead, route),
      lead.consent
        ? addToNurture({
            email: lead.email,
            firstName: lead.name.split(" ")[0],
            lastName: lead.name.split(" ").slice(1).join(" ") || undefined,
          }).catch((e) => console.error("[lead] nurture add failed:", e))
        : Promise.resolve(),
    ]);
  });

  return Response.json({ route, leadId });
}

async function sendQualifiedEmail(lead: LeadSubmission, leadId: string | null) {
  const resend = getResend();
  if (!resend) return;
  try {
    const email = qualifiedOfferEmail({
      firstName: lead.name.split(" ")[0] || "there",
      foundingSpots: foundingSpotsRemaining,
    });
    await resend.emails.send({
      from: FROM,
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
    console.error("[lead] qualified email failed:", e);
  }
}

async function notifyTeam(
  lead: LeadSubmission,
  route: LeadRoute,
  warning?: string,
) {
  const details = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    website: lead.website,
    teamSize: optionLabel(TEAM_OPTIONS, lead.teamSize),
    budget: optionLabel(BUDGET_OPTIONS, lead.budget),
    need: optionLabel(NEED_OPTIONS, lead.need),
    marketing: optionLabel(MARKETING_OPTIONS, lead.marketing),
    route,
  };

  try {
    const slackText = [
      warning ? `:rotating_light: ${warning}` : null,
      `*New ${route} lead* — ${details.company}`,
      `${details.name} · ${details.email}${details.phone ? ` · ${details.phone}` : ""}`,
      `Team: ${details.teamSize} · Budget: ${details.budget} · Needs: ${details.need}`,
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
