import { getSupabase } from "@/lib/server/supabase";
import { sendToGhlWebhook } from "@/lib/server/ghl";
import { getResend, FROM } from "@/lib/server/resend";
import { brandScoreDocEmail } from "@/lib/server/emails";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "brand-score-docs";
const MAX_PDF_BYTES = 25 * 1024 * 1024;

/**
 * POST /api/doc/publish — internal. Takes the reviewed Brand Score PDF,
 * hosts it in Supabase Storage at {sessionId}.pdf, stamps the session, sends
 * the delivery email to the lead via Resend (yellow download button + Get
 * Started CTA), and fires the GHL doc-ready webhook so the CRM keeps the
 * pdf_url on record. Auth: ?k=<DOC_REVIEW_KEY>, same gate as the review page.
 */
export async function POST(request: Request) {
  const requiredKey = process.env.DOC_REVIEW_KEY;
  const providedKey = new URL(request.url).searchParams.get("k");
  if (requiredKey ? providedKey !== requiredKey : process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const sessionId = form.get("sessionId");
  const file = form.get("file");
  if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return Response.json({ error: "Invalid session id" }, { status: 400 });
  }
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return Response.json({ error: "Attach the PDF file" }, { status: 400 });
  }
  if (file.size > MAX_PDF_BYTES) {
    return Response.json({ error: "PDF is over 25MB" }, { status: 400 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("quiz_sessions")
    .select("id, name, email, company, sector, region, final_score")
    .eq("id", sessionId)
    .maybeSingle();
  if (sessionError || !session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const path = `${sessionId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadError) {
    console.error("[doc] PDF upload failed:", uploadError.message);
    return Response.json({ error: "Upload to storage failed" }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = publicUrl.publicUrl;

  const { error: updateError } = await supabase
    .from("quiz_sessions")
    .update({ doc_url: url, doc_published_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (updateError) {
    console.error("[doc] session doc_url update failed:", updateError.message);
  }

  // Delivery email straight to the lead — no GHL workflow required.
  let emailSent = false;
  const resend = getResend();
  if (resend && session.email) {
    try {
      const email = brandScoreDocEmail({
        firstName: firstNameOf(session.name as string | null),
        company: (session.company as string | null) ?? "your brand",
        score: (session.final_score as number | null) ?? null,
        pdfUrl: url,
      });
      const { error } = await resend.emails.send({
        from: FROM,
        to: session.email as string,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      if (error) {
        console.error("[doc] delivery email failed:", error.message);
      } else {
        emailSent = true;
      }
    } catch (e) {
      console.error("[doc] delivery email errored:", e);
    }
  }

  // GHL record-keeping: saves pdf_url against the contact for future
  // campaigns (and can act as a delivery fallback if you wire an email there).
  await sendToGhlWebhook("brandScoreDoc", {
    type: "brand-score-doc-ready",
    session_id: sessionId,
    name: session.name ?? "",
    email: session.email ?? "",
    company: session.company ?? "",
    sector: session.sector ?? "",
    region: session.region ?? "",
    score: session.final_score ?? null,
    pdf_url: url,
    email_sent: emailSent,
  });

  return Response.json({ url, emailSent });
}

function firstNameOf(name: string | null): string {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}
