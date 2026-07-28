/**
 * Funnel hand-off — passing already-collected answers between funnel steps
 * WITHOUT putting them in the URL.
 *
 * The qualification form used to hand the brand-report quiz its prefill as
 * `/brand-report?name=…&company=…&email=…`. That leaks PII into three places we
 * can't retract it from:
 *   - Microsoft Clarity records page URLs verbatim; URL text is never masked,
 *     so lead names and work emails end up in Microsoft's session index.
 *   - `event_source_url` on every Meta Pixel/CAPI event carries the full href,
 *     putting the same PII in Meta's event log.
 *   - Referer headers, browser history, and anything the user pastes.
 *
 * sessionStorage keeps the hand-off same-tab and same-origin, expires with the
 * tab, and is invisible to both recorders. Only a non-identifying `lead` id and
 * `src` stay in the query string.
 */

const HANDOFF_KEY = 'mt_funnel_handoff';

export type FunnelHandoff = {
  name?: string;
  company?: string;
  website?: string;
  email?: string;
};

/** Stash answers for the next funnel step. No-op if storage is unavailable. */
export function writeFunnelHandoff(data: FunnelHandoff): void {
  if (typeof window === 'undefined') return;
  const clean: FunnelHandoff = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string' && v.trim()) clean[k as keyof FunnelHandoff] = v.trim();
  }
  if (Object.keys(clean).length === 0) return;
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(clean));
  } catch {
    // private browsing / quota — the next step just starts empty
  }
}

/** Read answers stashed by a previous funnel step. Returns {} if none. */
export function readFunnelHandoff(): FunnelHandoff {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    return raw ? (JSON.parse(raw) as FunnelHandoff) : {};
  } catch {
    return {};
  }
}
