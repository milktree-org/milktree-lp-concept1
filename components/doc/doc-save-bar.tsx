"use client";

/**
 * Lead-facing header for the web Brand Score document. One action — save the
 * document as a PDF via the browser's print dialog (the print styles turn the
 * page into the A4 document). Hidden in print so it never appears in the PDF.
 */
export function DocSaveBar() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/15 bg-black/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[210mm] flex-wrap items-center gap-3 px-4 py-3">
        <p className="mr-auto text-xs font-bold uppercase tracking-[0.14em] text-white/50">
          Your Brand Score document
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-brand px-4 py-2 text-xs font-black text-brand-ink"
        >
          Save as PDF
        </button>
      </div>
    </div>
  );
}
