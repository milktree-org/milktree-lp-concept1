export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** TEMPORARY diagnostic: why the benchmark chain fails in production. */
export async function GET(request: Request) {
  const key = process.env.DOC_REVIEW_KEY;
  if (!key || new URL(request.url).searchParams.get("k") !== key) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }

  const checks: Record<string, unknown> = {
    reportDelayMinutes: process.env.REPORT_DELAY_MINUTES ?? "(unset → 45)",
    resendFrom: process.env.RESEND_FROM ?? "(unset → hello@milktreeagency.com)",
    emailLogoUrl: process.env.EMAIL_LOGO_URL ? "set" : "(unset → GHL CDN default)",
    hasApify: Boolean(process.env.APIFY_API_TOKEN),
    hasFirecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    hasSupabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  for (const mod of ["sharp", "@/lib/server/logo", "@/lib/server/firecrawl", "@/lib/server/apify", "@/lib/server/benchmark"]) {
    try {
      await import(/* webpackIgnore: true */ mod);
      checks[mod] = "ok";
    } catch (e) {
      checks[mod] = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    }
  }

  return Response.json(checks);
}
