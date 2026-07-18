import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-side only. All funnel tables have RLS
 * enabled with no policies, so this key is the only way in or out.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured — persistence disabled",
    );
    client = null;
    return client;
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/**
 * Supabase-backed fixed-window rate limiter (no extra infra). Returns true if
 * the request is allowed. Fails OPEN — a rate-limit outage must never block a
 * lead.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;
  try {
    const now = Date.now();
    const { data } = await supabase
      .from("rate_limits")
      .select("count, window_start")
      .eq("key", key)
      .maybeSingle();

    if (
      !data ||
      now - new Date(data.window_start).getTime() > windowSeconds * 1000
    ) {
      await supabase
        .from("rate_limits")
        .upsert({ key, count: 1, window_start: new Date(now).toISOString() });
      return true;
    }
    if (data.count >= limit) return false;
    await supabase
      .from("rate_limits")
      .update({ count: data.count + 1 })
      .eq("key", key);
    return true;
  } catch {
    return true;
  }
}

/** Best-effort client IP for rate limiting. */
export function requestIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
