import { getSupabase } from "@/lib/server/supabase";
import { sendToGhlWebhook } from "@/lib/server/ghl";
import { getResend, FROM, REPLY_TO } from "@/lib/server/resend";
import { brandScoreDocEmail, docDownloadUrl } from "@/lib/server/emails";
import { composeReportEmail } from "@/lib/server/quiz-report";
import type { BenchmarkResult, QuizAnswers } from "@/lib/quiz";

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
    .select(
      "id, name, email, company, sector, region, final_score, answers, benchmark, report_email_id, report_sent_at",
    )
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

  const delivery = await deliverToLead(sessionId, {
    email: session.email as string | null,
    name: session.name as string | null,
    company: session.company as string | null,
    score: session.final_score as number | null,
    answers: (session.answers ?? {}) as QuizAnswers,
    benchmark: (session.benchmark as BenchmarkResult | null) ?? null,
    reportEmailId: session.report_email_id as string | null,
    reportSentAt: session.report_sent_at as string | null,
  });

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
    email_sent: delivery.emailSent,
  });

  return Response.json({ url, ...delivery });
}

type Delivery = {
  emailSent: boolean;
  /** How the lead hears about the document, for the operator's confirmation. */
  delivery:
    | "report-sent-early"
    | "report-still-queued"
    | "doc-ready-email"
    | "none";
};

type Lead = {
  email: string | null;
  name: string | null;
  company: string | null;
  score: number | null;
  answers: QuizAnswers;
  benchmark: BenchmarkResult | null;
  reportEmailId: string | null;
  reportSentAt: string | null;
};

/**
 * The lead gets exactly one email wherever possible.
 *
 * Their Brand Score email is scheduled 45 minutes out at quiz completion and
 * already carries the document link, which resolves the moment this upload
 * lands. So if that send is still queued, publishing cancels it and sends the
 * same email now — one email, score and document together. Only when the
 * operator misses that window, and the score email has already gone, does the
 * lead need a second, short "it's ready" note.
 */
async function deliverToLead(sessionId: string, lead: Lead): Promise<Delivery> {
  const resend = getResend();
  if (!resend || !lead.email) return { emailSent: false, delivery: "none" };

  const queued =
    lead.reportEmailId !== null &&
    lead.reportSentAt !== null &&
    new Date(lead.reportSentAt).getTime() > Date.now();

  if (queued) {
    // Cancel and send fresh rather than rescheduling: a scheduled time seconds
    // away can elapse before Resend processes the change, which fails the send.
    const { error: cancelError } = await resend.emails.cancel(
      lead.reportEmailId as string,
    );
    if (cancelError) {
      // The queued email still carries a link that now works, so leave it be
      // rather than risk sending two.
      console.error("[doc] report cancel failed:", cancelError.message);
      return { emailSent: false, delivery: "report-still-queued" };
    }

    const report = composeReportEmail({
      id: sessionId,
      company: lead.company,
      answers: lead.answers,
      benchmark: lead.benchmark,
    });
    if (await send(resend, lead.email, report)) {
      const supabase = getSupabase();
      await supabase
        ?.from("quiz_sessions")
        .update({ report_sent_at: new Date().toISOString() })
        .eq("id", sessionId);
      return { emailSent: true, delivery: "report-sent-early" };
    }
    // Their only email is cancelled, so fall through to the shorter note.
  }

  const doc = brandScoreDocEmail({
    firstName: firstNameOf(lead.name),
    company: lead.company ?? "your brand",
    score: lead.score,
    // The stable link, not the storage URL, so re-hosting the PDF later never
    // breaks a link already sitting in an inbox.
    pdfUrl: docDownloadUrl(sessionId),
  });
  return (await send(resend, lead.email, doc))
    ? { emailSent: true, delivery: "doc-ready-email" }
    : { emailSent: false, delivery: "none" };
}

async function send(
  resend: NonNullable<ReturnType<typeof getResend>>,
  to: string,
  email: { subject: string; html: string; text: string },
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (error) {
      console.error("[doc] delivery email failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[doc] delivery email errored:", e);
    return false;
  }
}

function firstNameOf(name: string | null): string {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}
