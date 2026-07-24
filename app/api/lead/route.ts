import { after } from "next/server";
import {
  evaluateRoute,
  validateLeadSubmission,
} from "@/lib/server/qualification";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { sendToFormspree } from "@/lib/server/formspree";
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
 *   3. AWAIT persistence — Formspree (intake endpoint) and Supabase in
 *      parallel; the request only fails if BOTH stores fail
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

  // Persist FIRST — Formspree and Supabase in parallel. As long as one store
  // has the lead we proceed; if both fail the client gets a 500 and can retry,
  // and we fire a best-effort team notify so the lead isn't lost silently.
  const supabase = getSupabase();
  const [formspreeStored, supabaseResult] = await Promise.all([
    sendToFormspree("intake", {
      _subject: `${route === "qualified" ? "New Qualified Lead" : "New Unqualified Lead"} — ${lead.company}`,
      form: "intake",
      route,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? "",
      company: lead.company,
      website: lead.website,
      need: optionLabel(NEED_OPTIONS, lead.need),
      teamSize: optionLabel(TEAM_OPTIONS, lead.teamSize),
      marketing: optionLabel(MARKETING_OPTIONS, lead.marketing),
      budget: optionLabel(BUDGET_OPTIONS, lead.budget),
      consent: lead.consent,
      attribution: lead.attribution ?? undefined,
    }),
    supabase
      ? supabase
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
          .single()
      : Promise.resolve(null),
  ]);

  let leadId: string | null = null;
  let supabaseStored = false;
  if (supabaseResult) {
    if (supabaseResult.error) {
      console.error("[lead] insert failed:", supabaseResult.error.message);
    } else {
      leadId = supabaseResult.data.id;
      supabaseStored = true;
    }
  } else {
    console.error("[lead] Supabase not configured; relying on Formspree:", lead.email);
  }

  if (!formspreeStored && !supabaseStored) {
    after(() => notifyTeam(lead, route, "ALL STORES FAILED — lead only in this notification"));
    return Response.json(
      { error: "Something went wrong saving your details. Please try again." },
      { status: 500 },
    );
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
