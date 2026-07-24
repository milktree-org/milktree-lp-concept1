"use client";

import { useRef, useState } from "react";

/**
 * Internal review toolbar for the Brand Score document. Hidden in print.
 * Workflow: review the 10 pages → Save as PDF (browser print) → drop the PDF
 * on Publish, which uploads it to Supabase Storage and fires the GHL
 * doc-ready webhook so the delivery email goes out automatically.
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
    | { state: "done"; url: string; emailSent: boolean | null }
    | { state: "error"; message: string }
  >(
    publishedUrl
      ? { state: "done", url: publishedUrl, emailSent: null }
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
        emailSent?: boolean;
        error?: string;
      };
      if (!res.ok || !json.url) {
        setStatus({ state: "error", message: json.error ?? "Upload failed." });
        return;
      }
      setStatus({ state: "done", url: json.url, emailSent: json.emailSent ?? false });
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
        {status.state === "done" && (
          <p className="w-full text-xs font-medium text-white/50">
            {status.emailSent === false
              ? "PDF is hosted, but the delivery email did not send (check RESEND_API_KEY / server logs). The GHL webhook still fired."
              : "Delivery email sent to the lead with the download link. Re-publish replaces the hosted PDF at the same link."}
          </p>
        )}
      </div>
    </div>
  );
}
