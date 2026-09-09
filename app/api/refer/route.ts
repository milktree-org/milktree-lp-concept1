import { after } from "next/server";
import { sendToFormspree } from "@/lib/server/formspree";
import { sendToGhlWebhook, ghlAttribution, parseAttribution } from "@/lib/server/ghl";
import { getResend, FROM, NOTIFY_TO, notifySlack } from "@/lib/server/resend";
import { getSupabase, rateLimit, requestIp } from "@/lib/server/supabase";
import { RELATIONSHIP_OPTIONS } from "@/lib/referral";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/refer — a referral introduction (PRD 3.4).
 *
 * Persists to Formspree (intake) and Supabase `referrals` in parallel and
 * succeeds if either accepts; forwards to GHL tagged `referral`; notifies
 * the team in after(). The introduced business is a lead; the referrer is
 * the person we owe a reward to, so both are stored.
 */
export async function POST(request: Request) {
  const allowed = await rateLimit(`refer:${requestIp(request)}`, 8, 600);
  if (!allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const referrerName = str(body.referrerName);
  const referrerEmail = str(body.referrerEmail).toLowerCase();
  const referrerCompany = str(body.referrerCompany);
  const relationship = str(body.relationship, 40);
  const leadName = str(body.leadName);
  const leadCompany = str(body.leadCompany);
  const leadContact = str(body.leadContact);
  const note = str(body.note, 2000);
  const attribution = parseAttribution(body.attribution);

  if (referrerName.length < 2) return Response.json({ error: "Please add your name." }, { status: 400 });
  if (!EMAIL_RE.test(referrerEmail)) return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!RELATIONSHIP_OPTIONS.some((o) => o.value === relationship))
    return Response.json({ error: "Tell us how you know them." }, { status: 400 });
  if (leadCompany.length < 2) return Response.json({ error: "Please add the business you're introducing." }, { status: 400 });
  if (leadContact.length < 5) return Response.json({ error: "Please add an email or phone number for them." }, { status: 400 });

  const relationshipLabel = RELATIONSHIP_OPTIONS.find((o) => o.value === relationship)?.label ?? relationship;

  const [formspreeStored, supabaseStored] = await Promise.all([
    sendToFormspree("intake", {
      _subject: `Referral — ${leadCompany} (from ${referrerName})`,
      form: "referral",
      referrerName,
      referrerEmail,
      referrerCompany,
      relationship: relationshipLabel,
      leadName,
      leadCompany,
      leadContact,
      note,
      source: "website-refer",
      attribution: attribution ?? undefined,
    }),
    storeReferral({ referrerName, referrerEmail, referrerCompany, relationship, leadName, leadCompany, leadContact, note, attribution }),
  ]);

  if (!formspreeStored && !supabaseStored) {
    after(() => notifyTeam({ referrerName, referrerEmail, relationshipLabel, leadName, leadCompany, leadContact, note }, "ALL STORES FAILED"));
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  after(async () => {
    await Promise.allSettled([
      notifyTeam({ referrerName, referrerEmail, relationshipLabel, leadName, leadCompany, leadContact, note }),
      sendToGhlWebhook("referral", {
        name: referrerName,
        email: referrerEmail,
        company: referrerCompany,
        relationship: relationshipLabel,
        introduced_name: leadName,
        introduced_company: leadCompany,
        introduced_contact: leadContact,
        note,
        source: "website-refer",
        tags: ["referral", "referrer"],
        ...ghlAttribution(attribution),
      }),
    ]);
  });

  return Response.json({ ok: true });
}

async function storeReferral(input: {
  referrerName: string;
  referrerEmail: string;
  referrerCompany: string;
  relationship: string;
  leadName: string;
  leadCompany: string;
  leadContact: string;
  note: string;
  attribution?: Record<string, string>;
}): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("referrals").insert({
      referrer_name: input.referrerName,
      referrer_email: input.referrerEmail,
      referrer_company: input.referrerCompany || null,
      relationship: input.relationship,
      lead_name: input.leadName || null,
      lead_company: input.leadCompany,
      lead_contact: input.leadContact,
      note: input.note || null,
      status: "new",
      attribution: input.attribution ?? null,
    });
    if (error) {
      console.error("[refer] insert failed:", error.message, "— run supabase/migrations/20260909_referrals_and_stripe.sql");
      return false;
    }
    return true;
  } catch (e) {
    console.error("[refer] insert threw:", e);
    return false;
  }
}

async function notifyTeam(
  d: { referrerName: string; referrerEmail: string; relationshipLabel: string; leadName: string; leadCompany: string; leadContact: string; note: string },
  warning?: string,
) {
  try {
    const text = [
      warning ? `:rotating_light: ${warning}` : null,
      `*New referral* — ${d.leadCompany}${d.leadName ? ` (${d.leadName})` : ""} · ${d.leadContact}`,
      `Introduced by ${d.referrerName} · ${d.referrerEmail} · ${d.relationshipLabel}`,
      d.note ? `Note: ${d.note}` : null,
      "Reward owed if this becomes a Brand Build: a free sprint or £799 subscription credit.",
    ]
      .filter(Boolean)
      .join("\n");
    const sent = await notifySlack(text).catch(() => false);
    if (!sent) {
      const resend = getResend();
      if (!resend) return;
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        replyTo: d.referrerEmail,
        subject: `${warning ? "⚠ " : ""}Referral — ${d.leadCompany} from ${d.referrerName}`,
        text,
      });
    }
  } catch (e) {
    console.error("[refer] team notify failed:", e);
  }
}
