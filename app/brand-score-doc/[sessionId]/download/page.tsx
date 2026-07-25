import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/server/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Brand Score document",
  robots: { index: false, follow: false },
};

/**
 * The lead-facing document link. Stable per session, so it can go into the
 * report email at quiz completion and still work once the PDF is published 45
 * minutes (or a day) later. No key: the session id is the unguessable secret,
 * and it only ever reveals that lead's own document.
 */
export default async function DownloadPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const url = /^[0-9a-f-]{36}$/i.test(sessionId)
    ? await documentUrl(sessionId)
    : null;

  if (url) redirect(url);

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

async function documentUrl(sessionId: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("quiz_sessions")
    .select("doc_url")
    .eq("id", sessionId)
    .maybeSingle();
  return (data?.doc_url as string | null) ?? null;
}
