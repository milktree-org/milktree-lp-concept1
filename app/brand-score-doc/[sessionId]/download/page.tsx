import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandScoreDocument } from "@/components/doc/brand-score-document";
import { DocSaveBar } from "@/components/doc/doc-save-bar";
import { loadBrandScoreDoc } from "@/lib/server/brand-score-doc-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Brand Score document",
  robots: { index: false, follow: false },
};

/**
 * The lead-facing document link — stable per session, so it can go into the
 * report email at quiz completion and always resolve. No key: the session id
 * is the unguessable secret, and it only ever reveals that lead's own
 * document.
 *
 * Resolution order:
 * 1. A published, human-reviewed PDF exists → redirect to it.
 * 2. The quiz is complete → render the designed document as a web page, no
 *    operator required (this is what keeps the email's "ready to read"
 *    promise true at ad volume).
 * 3. Otherwise → holding page.
 */
export default async function DownloadPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const data = /^[0-9a-f-]{36}$/i.test(sessionId)
    ? await loadBrandScoreDoc(sessionId)
    : null;

  if (data?.publishedUrl) redirect(data.publishedUrl);

  if (data?.completedAt) {
    return (
      <div className="min-h-screen bg-[#181818] pb-16 print:min-h-0 print:bg-black print:pb-0">
        <DocSaveBar />
        <div className="pt-10 print:pt-0">
          <BrandScoreDocument data={data.doc} />
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-32">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand">
        <span className="inline-block h-[2px] w-5 bg-brand" />
        Brand Score
      </p>
      <h1 className="mt-5 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
        Your document is being finalised.
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        A designer is running the last checks on your Brand Score document.
        You&apos;ll get an email with the download link as soon as it&apos;s
        ready, and this page will take you straight to it from then on.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href="/start"
          className="inline-flex min-h-11 items-center rounded-full bg-brand px-7 font-bold text-brand-ink"
        >
          Get started
        </Link>
        <Link
          href="/#plans"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-7 font-bold"
        >
          See plans
        </Link>
      </div>
    </main>
  );
}
