"use client";

import { useRef, useState } from "react";

type Delivery =
  | "report-sent-early"
  | "report-still-queued"
  | "doc-ready-email"
  | "none";

const DELIVERY_NOTE: Record<Delivery, string> = {
  "report-sent-early":
    "Published inside the 45-minute window, so their Brand Score email has just gone out with the document link in it — one email, not two. Re-publish replaces the hosted PDF at the same link.",
  "report-still-queued":
    "PDF is hosted and their Brand Score email is still queued, so it will arrive as scheduled with a working document link. Nothing else to do.",
  "doc-ready-email":
    "Their Brand Score email had already gone out, so we've sent a short follow-up with the document link. Re-publish replaces the hosted PDF at the same link.",
  none: "PDF is hosted, but no email reached the lead (check RESEND_API_KEY / server logs). The GHL webhook still fired.",
};

/**
 * Internal review toolbar for the Brand Score document. Hidden in print.
 * Workflow: review the pages → Save as PDF (browser print) → drop the PDF on
 * Publish, which hosts it, gets the document link to the lead and fires the GHL
 * doc-ready webhook.
 */
export function DocToolbar({
  sessionId,
  reviewKey,
  publishedUrl,
}: {
  sessionId: string;
  reviewKey: string;
  publishedUrl: string | null;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<
    | { state: "idle" | "uploading" }
    | { state: "done"; url: string; delivery: Delivery | null }
    | { state: "error"; message: string }
  >(
    publishedUrl
      ? { state: "done", url: publishedUrl, delivery: null }
      : { state: "idle" },
  );

  async function publish(file: File) {
    if (file.type !== "application/pdf") {
      setStatus({ state: "error", message: "That isn't a PDF." });
      return;
    }
    setStatus({ state: "uploading" });
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("sessionId", sessionId);
      const res = await fetch(`/api/doc/publish?k=${encodeURIComponent(reviewKey)}`, {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        url?: string;
        delivery?: Delivery;
        error?: string;
      };
      if (!res.ok || !json.url) {
        setStatus({ state: "error", message: json.error ?? "Upload failed." });
        return;
      }
      setStatus({ state: "done", url: json.url, delivery: json.delivery ?? "none" });
    } catch {
      setStatus({ state: "error", message: "Upload failed. Check the connection and retry." });
    }
  }

  return (
    <div className="doc-toolbar sticky top-0 z-50 border-b border-white/15 bg-black/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-3 px-4 py-3">
        <p className="mr-auto text-xs font-bold uppercase tracking-[0.14em] text-white/50">
          Internal review · not for sharing
        </p>

        {status.state === "done" ? (
          <a
            href={status.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-brand/50 bg-brand/10 px-4 py-2 text-xs font-bold text-brand"
          >
            Published — open PDF
          </a>
        ) : (
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:border-white/50"
            >
              1 · Save as PDF (Cmd+P)
            </button>
            <button
              type="button"
              disabled={status.state === "uploading"}
              onClick={() => fileInput.current?.click()}
              className="rounded-full bg-brand px-4 py-2 text-xs font-black text-black transition-opacity disabled:opacity-50"
            >
              {status.state === "uploading" ? "Publishing…" : "2 · Publish PDF"}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void publish(file);
                e.target.value = "";
              }}
            />
          </>
        )}

        {status.state === "error" && (
          <p className="w-full text-xs font-medium text-red-400">{status.message}</p>
        )}
        {status.state === "done" && status.delivery && (
          <p className="w-full text-xs font-medium text-white/50">
            {DELIVERY_NOTE[status.delivery]}
          </p>
        )}
      </div>
    </div>
  );
}
