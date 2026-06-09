/**
 * Lead tracking utility.
 *
 * Captures marketing-attribution data (UTMs, platform click IDs, referrer,
 * landing URL) from the URL of every page load, and persists it across
 * sessions so that any form submission or Cal.com booking can include the
 * full attribution context for downstream analysis and optimisation.
 *
 * Two layers of attribution are kept:
 *   1. FIRST-TOUCH  (localStorage)   — what ORIGINALLY brought the visitor.
 *      Set once on the first attribution-bearing visit, never overwritten.
 *      This is the "who paid for this lead" signal.
 *   2. LAST-TOUCH   (sessionStorage) — what brought them THIS visit.
 *      Updated every time a new attribution-bearing URL is loaded.
 *      Useful for understanding the path between first touch and conversion.
 *
 * Plus a third real-time layer captured at submission time:
 *   3. SUBMIT context — page URL, timestamp, user-agent, screen, etc.
 *
 * No cookies, no third-party services. All first-party storage that the
 * user is implicitly consenting to by submitting the form.
 */

const FIRST_TOUCH_KEY = 'mt_first_touch';
const LAST_TOUCH_KEY = 'mt_last_touch';
const VISITOR_ID_KEY = 'mt_external_id'; // shared with utils/meta-tracking.ts

/** All URL parameters we treat as "attribution signals". If at least one is
 *  present, the visit counts as a real "touch" worth recording. */
const ATTR_PARAMS = [
  // UTM standards
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  // Platform click IDs (gold for ad-platform attribution)
  'fbclid',     // Meta
  'gclid',      // Google Ads
  'gbraid',     // Google enhanced conversions (iOS web)
  'wbraid',     // Google enhanced conversions (cross-device)
  'msclkid',    // Microsoft (Bing) Ads
  'ttclid',     // TikTok Ads
  'li_fat_id',  // LinkedIn Ads
  'twclid',     // X / Twitter Ads
] as const;

type AttrKey = (typeof ATTR_PARAMS)[number];

interface TouchData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  msclkid?: string;
  ttclid?: string;
  li_fat_id?: string;
  twclid?: string;
  referrer?: string;
  landing_url?: string;
  landing_path?: string;
  seen_at?: string;
}

/** Read all attribution params from the current URL. Returns {} if none. */
function readCurrentTouch(): TouchData {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const data: TouchData = {};
  for (const key of ATTR_PARAMS) {
    const v = params.get(key);
    if (v) (data as Record<string, string>)[key as string] = v;
  }
  // Only count this as a real "touch" if at least one attribution param fired.
  // Otherwise we'd overwrite real data with an empty object on every reload.
  if (Object.keys(data).length === 0) return {};

  data.referrer = document.referrer || '(direct)';
  data.landing_url = window.location.href;
  data.landing_path = window.location.pathname;
  data.seen_at = new Date().toISOString();
  return data;
}

function safeReadJSON<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeWriteJSON(storage: Storage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // private browsing / quota — silent
  }
}

/** Read a cookie value by name (used to avoid clobbering a Pixel-set _fbc). */
function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Capture attribution from the current URL. Call this on app mount.
 *   - If the URL has any UTM/click-ID params and we don't yet have a
 *     first-touch on file, save it to localStorage forever.
 *   - If the URL has any UTM/click-ID params, save the latest as the
 *     last-touch in sessionStorage (overwriting any previous last-touch
 *     for this visit).
 *   - If the URL has NO attribution params, do nothing (don't blow away
 *     existing storage with empty data).
 */
export function captureLeadTracking(): void {
  const current = readCurrentTouch();
  if (Object.keys(current).length === 0) return;

  // First-touch: write only if missing
  const existingFirst = safeReadJSON<TouchData>(localStorage, FIRST_TOUCH_KEY);
  if (!existingFirst || Object.keys(existingFirst).length === 0) {
    safeWriteJSON(localStorage, FIRST_TOUCH_KEY, current);
  }

  // Last-touch: always overwrite with the most recent attribution this session
  safeWriteJSON(sessionStorage, LAST_TOUCH_KEY, current);

  // Persist a 90-day first-party _fbc cookie from the fbclid so the click ID
  // survives ITP cookie-capping on return visits (the Pixel's own _fbc is capped
  // to ~7 days on Safari/iOS, and meta-tracking reads _fbc first). Skip if a _fbc
  // already exists for this same fbclid — never clobber a Pixel-set value.
  if (current.fbclid && current.seen_at && typeof document !== 'undefined') {
    const existing = readCookie('_fbc');
    if (!existing || !existing.includes(current.fbclid)) {
      const idx = window.location.hostname.split('.').length > 2 ? 2 : 1;
      const epochMs = new Date(current.seen_at).getTime() || Date.now();
      const value = `fb.${idx}.${epochMs}.${current.fbclid}`;
      const maxAge = 90 * 24 * 60 * 60; // 90 days
      document.cookie = `_fbc=${encodeURIComponent(value)};max-age=${maxAge};path=/;SameSite=Lax;Secure`;
    }
  }
}

/**
 * Returns a flat map of every tracking field, ready to be rendered as
 * <input type="hidden" name="..." value="..."> inside a Formspree form.
 *
 * Field naming convention:
 *   first_*  : first-touch attribution (persistent across sessions)
 *   last_*   : last-touch attribution (this session only)
 *   submit_* : real-time context at moment of submission
 *   visitor_id, user_agent, screen_size, viewport_size, language, timezone
 *
 * All values are strings. Empty strings are dropped.
 */
export function getLeadTrackingFields(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const out: Record<string, string> = {};

  const first = safeReadJSON<TouchData>(localStorage, FIRST_TOUCH_KEY) || {};
  const last = safeReadJSON<TouchData>(sessionStorage, LAST_TOUCH_KEY) || {};

  const addTouch = (prefix: 'first' | 'last', t: TouchData) => {
    for (const [k, v] of Object.entries(t)) {
      if (v && String(v).trim() !== '') out[`${prefix}_${k}`] = String(v);
    }
  };

  addTouch('first', first);
  addTouch('last', last);

  // Submission-time context
  out.submit_url = window.location.href;
  out.submit_path = window.location.pathname;
  out.submit_at = new Date().toISOString();
  if (navigator.userAgent) out.user_agent = navigator.userAgent;
  out.screen_size = `${window.screen.width}x${window.screen.height}`;
  out.viewport_size = `${window.innerWidth}x${window.innerHeight}`;
  if (navigator.language) out.language = navigator.language;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) out.timezone = tz;
  } catch { /* unsupported */ }

  // Persistent visitor ID (shared with meta-tracking — ties Formspree
  // submissions to Meta Pixel events for cross-system attribution)
  try {
    const visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (visitorId) out.visitor_id = visitorId;
  } catch { /* private mode */ }

  return out;
}

/**
 * Returns a Cal.com-friendly metadata object containing first-touch +
 * last-touch attribution. Cal.com flattens metadata into the booking
 * payload and exposes it on webhooks + booking emails.
 *
 * Cal.com metadata values must be strings (not nested), so we flatten
 * the same way the form fields do.
 */
export function getCalcomTrackingMetadata(): Record<string, string> {
  // Same data, same naming — Cal.com just stores them as flat metadata.
  // Reuse the form fields helper but drop the noisy stuff that wouldn't
  // help in a calendar booking record (user_agent, screen_size, etc.).
  const all = getLeadTrackingFields();
  const drop = new Set(['user_agent', 'screen_size', 'viewport_size', 'language', 'timezone']);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(all)) {
    if (!drop.has(k)) out[k] = v;
  }
  return out;
}

/** Re-export the raw key constants in case calling code needs to inspect
 *  or clear storage manually (e.g. in tests). */
export const STORAGE_KEYS = {
  FIRST_TOUCH: FIRST_TOUCH_KEY,
  LAST_TOUCH: LAST_TOUCH_KEY,
  VISITOR_ID: VISITOR_ID_KEY,
} as const;

// Mark AttrKey as exported-used to keep TS happy when only tests import it
export type { AttrKey, TouchData };
