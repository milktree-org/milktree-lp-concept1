/**
 * Routes that must never be tracked at all.
 *
 * `/brand-score-doc/[sessionId]` is the internal review page. It is opened with
 * `?k=<DOC_REVIEW_KEY>` and renders a named lead's full report, so loading any
 * recorder on it means:
 *   - Clarity indexes the URL verbatim (URLs are never masked) — putting a live
 *     secret into Microsoft's session list,
 *   - Clarity's replay captures the client's report content,
 *   - Meta receives the same URL as `event_source_url`.
 *
 * The URL is now redacted before it reaches either vendor, but the honest fix
 * for an internal page is not to load the tags in the first place. It carries
 * no marketing value — nobody converts on it.
 */
const EXCLUDED_PREFIXES = ['/brand-score-doc'];

export function isTrackingExcluded(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
