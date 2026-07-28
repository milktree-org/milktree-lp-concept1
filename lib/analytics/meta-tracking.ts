/**
 * Meta Pixel + Conversions API (CAPI) — Centralized Tracking Utility
 *
 * Fires events to BOTH the client-side Meta Pixel (fbq) AND our Vercel
 * serverless function that forwards them to Meta's Conversions API.
 * Uses a shared `event_id` for deduplication so Meta counts each event once.
 *
 * Usage:
 *   import { trackContact, trackLead, trackViewContent, trackPageView, trackCustom } from '@/utils/meta-tracking';
 *   trackContact({ eventSource: 'Navbar CTA' });
 *   trackLead({ eventSource: 'Cal.com Booking' });
 *   trackViewContent({ contentName: 'Brand Case Study', contentCategory: 'Case Study' });
 */

import { STORAGE_KEYS } from './lead-tracking';
import { readConsent } from './consent';

/**
 * Nothing here runs without consent. The Pixel is separately held by
 * `fbq('consent','revoke')`, but the CAPI leg is our own server call that Meta's
 * consent API knows nothing about — and `collectUserData` also writes the
 * persistent `mt_external_id` to localStorage. Both are non-essential storage
 * under UK PECR, so they need the same gate.
 */
function hasConsent(): boolean {
  return readConsent() === 'granted';
}

// ── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fbc?: string;
  fbp?: string;
  userAgent?: string;
  sourceUrl?: string;
}

interface BaseEventParams {
  eventSource?: string;   // e.g. 'Navbar CTA', 'Footer CTA', 'Final CTA'
  userData?: Partial<UserData>;
  /** Override the generated event_id. Pass a value derived from a stable
   *  server-visible key (e.g. the Cal.com booking uid) when the same event may
   *  also be sent server-side, so Meta deduplicates the two copies. */
  eventId?: string;
}

interface ViewContentParams extends BaseEventParams {
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
}

interface CustomEventParams extends BaseEventParams {
  customData?: Record<string, unknown>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a UUID v4 for event deduplication between Pixel & CAPI */
function generateEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** SHA-256 hash a string (for email/phone sent to CAPI) */
async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Normalise a phone to digits-only E.164 *without* the leading `+`, which is
 *  what Meta expects before hashing. `trim().toLowerCase()` alone is not enough:
 *  "07700 900123", "+44 7700 900123" and "(07700) 900123" are the same number
 *  but hash to three different values, so `ph` would never match. UK-first:
 *  strip the IDD prefix, then map a national leading 0 to the 44 country code.
 *  Returns undefined for anything too short to be a real number. */
function normalizePhone(raw: string): string | undefined {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = `44${digits.slice(1)}`;
  return digits.length >= 7 ? digits : undefined;
}

/** Normalise a name for hashing: Meta wants lowercase, trimmed, punctuation-free
 *  UTF-8. Deliberately does NOT strip diacritics — Meta hashes the accented form,
 *  so "josé" must stay "josé" or it stops matching. */
function normalizeName(raw: string): string | undefined {
  const v = raw.trim().toLowerCase().replace(/[.,'"()]/g, '');
  return v || undefined;
}

/**
 * Current href with PII and secrets stripped, for `event_source_url`.
 *
 * Deliberately keeps `fbclid` and the UTMs: when `_fbc` is missing Meta
 * recovers the click ID from event_source_url, so blanket-stripping the query
 * string would silently destroy attribution. Only params that must never enter
 * Meta's event log are removed — `k` is the DOC_REVIEW_KEY on /brand-score-doc,
 * the rest are legacy funnel hand-off params.
 */
const URL_REDACT_PARAMS = ['k', 'name', 'email', 'company', 'website'];

function safeSourceUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    const url = new URL(window.location.href);
    for (const p of URL_REDACT_PARAMS) url.searchParams.delete(p);
    return url.toString();
  } catch {
    return window.location.origin + window.location.pathname;
  }
}

/** Read Meta cookies (_fbp, _fbc) for improved match rates */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

// ── fbc (Meta click ID) recovery ─────────────────────────────────────────────
// `fbclid` only lives in the URL on the landing page; our conversion events
// (Lead/Contact/Schedule) fire later — after the modal, the Cal.com booking and
// the thank-you redirect, or in a return session — by which point fbclid is gone
// from the URL and the Pixel's _fbc cookie may have been ITP-purged (Safari/iOS
// caps script-set cookies to ~7 days). lead-tracking.ts persists the fbclid plus
// its click time (`seen_at`), so we recover _fbc from there instead of dropping
// it. Format: fb.{subdomainIndex}.{clickEpochMs}.{fbclid}.

function readStoredTouch(storage: Storage, key: string): { fbclid?: string; seen_at?: string } | null {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as { fbclid?: string; seen_at?: string }) : null;
  } catch {
    return null;
  }
}

/** subdomain index for the _fbc format: 1 for an apex domain, 2 when a subdomain is present. */
function fbcSubdomainIndex(): number {
  if (typeof window === 'undefined') return 1;
  return window.location.hostname.split('.').length > 2 ? 2 : 1;
}

/** Build a spec-compliant _fbc from a raw fbclid + its first-seen ISO timestamp
 *  (the CLICK time, not event-fire time). Falls back to current time only when
 *  the stored timestamp is missing/unparseable. */
function buildFbc(fbclid: string, seenAtIso?: string): string {
  const epochMs = (seenAtIso ? new Date(seenAtIso).getTime() : NaN) || Date.now();
  return `fb.${fbcSubdomainIndex()}.${epochMs}.${fbclid}`;
}

/** Resolve the best available _fbc: cookie → live URL → session last-touch →
 *  first-touch within Meta's 28-day click window. Returns undefined for purely
 *  organic/direct visitors (no fbclid ever) — we must never fabricate one. */
function resolveFbc(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  // 1) Pixel-set or app-set _fbc cookie — already formatted, use verbatim.
  const cookie = getCookie('_fbc');
  if (cookie) return cookie;

  const lastTouch = readStoredTouch(sessionStorage, STORAGE_KEYS.LAST_TOUCH);

  // 2) fbclid live in the current URL (landing page). Use the stored click time
  //    if we captured this same fbclid this session, else fall back to now.
  const urlFbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (urlFbclid) {
    const seenAt = lastTouch?.fbclid === urlFbclid ? lastTouch?.seen_at : undefined;
    return buildFbc(urlFbclid, seenAt);
  }

  // 3) Same-session last-touch (URL already navigated away from the landing page).
  if (lastTouch?.fbclid) return buildFbc(lastTouch.fbclid, lastTouch.seen_at);

  // 4) Cross-session first-touch — only within Meta's 28-day click attribution
  //    window, so an organic return is never attributed to a stale paid click.
  const firstTouch = readStoredTouch(localStorage, STORAGE_KEYS.FIRST_TOUCH);
  if (firstTouch?.fbclid && firstTouch?.seen_at) {
    const ageMs = Date.now() - new Date(firstTouch.seen_at).getTime();
    if (ageMs >= 0 && ageMs < 28 * 24 * 60 * 60 * 1000) {
      return buildFbc(firstTouch.fbclid, firstTouch.seen_at);
    }
  }
  return undefined;
}

/**
 * Get or create a persistent anonymous external ID for cross-device matching.
 * Stored in localStorage so it persists across sessions.
 */
function getOrCreateExternalId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'mt_external_id';
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = generateEventId();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
    return generateEventId();
  }
}

/** Collect user data for CAPI (hashed where needed) */
async function collectUserData(extra?: Partial<UserData>): Promise<Record<string, unknown>> {
  const userData: Record<string, unknown> = {};

  // _fbp cookie (browser ID)
  const fbp = getCookie('_fbp');
  if (fbp) userData.fbp = fbp;

  // _fbc (Meta click ID) — recovered from cookie / live URL / persisted storage
  // (see resolveFbc) so paid-click attribution survives SPA nav, the thank-you
  // redirect, ITP cookie purges, and return sessions.
  const fbc = resolveFbc();
  if (fbc) userData.fbc = fbc;

  // Client user agent
  if (typeof navigator !== 'undefined') {
    userData.client_user_agent = navigator.userAgent;
  }

  // Source URL
  if (typeof window !== 'undefined') {
    userData.event_source_url = safeSourceUrl();
  }

  // External ID — persistent anonymous ID for cross-device matching (EMQ boost)
  const externalId = getOrCreateExternalId();
  if (externalId) {
    userData.external_id = [await sha256(externalId)];
  }

  // NOTE: `country` is deliberately NOT set here. It used to be hardcoded to
  // sha256('gb') on every event, which is fabricated data for 100% of traffic
  // and contradicts client_ip_address for anyone outside GB — it adds no
  // matching entropy (a constant matches everyone) and can only hurt EMQ.
  // The server derives the real country from `x-vercel-ip-country` instead
  // (see app/api/meta-capi/route.ts).

  // Hash email if provided
  if (extra?.email) {
    userData.em = [await sha256(extra.email)];
  }

  // Hash phone if provided — normalised to E.164 digits first, or Meta can
  // never match it against the number the user gave Facebook.
  if (extra?.phone) {
    const phone = normalizePhone(extra.phone);
    if (phone) userData.ph = [await sha256(phone)];
  }

  // Hash first name if provided
  if (extra?.firstName) {
    const fn = normalizeName(extra.firstName);
    if (fn) userData.fn = [await sha256(fn)];
  }

  // Hash last name if provided
  if (extra?.lastName) {
    const ln = normalizeName(extra.lastName);
    if (ln) userData.ln = [await sha256(ln)];
  }

  return userData;
}

/**
 * Feed RAW (unhashed) identifiers to the browser Pixel for Advanced Matching.
 * `fbq('set','userData',…)` hashes client-side, so passing the SHA-256 values
 * from collectUserData would double-hash and match nobody. Values persist for
 * subsequent fbq calls in the same page session.
 */
function applyAdvancedMatching(extra?: Partial<UserData>): void {
  if (!extra || typeof window === 'undefined' || typeof window.fbq !== 'function') return;

  const am: Record<string, string> = {};
  if (extra.email) am.em = extra.email.trim().toLowerCase();
  if (extra.phone) {
    const phone = normalizePhone(extra.phone);
    if (phone) am.ph = phone;
  }
  if (extra.firstName) {
    const fn = normalizeName(extra.firstName);
    if (fn) am.fn = fn;
  }
  if (extra.lastName) {
    const ln = normalizeName(extra.lastName);
    if (ln) am.ln = ln;
  }

  if (Object.keys(am).length > 0) {
    window.fbq('set', 'userData', am);
  }
}

// ── Core send function ───────────────────────────────────────────────────────

/**
 * Fires an event to both the Meta Pixel (client) and the CAPI (server).
 * Uses a shared event_id for deduplication.
 */
async function sendMetaEvent(
  eventName: string,
  pixelCustomData: Record<string, unknown> = {},
  capiCustomData: Record<string, unknown> = {},
  userData?: Partial<UserData>,
  overrideEventId?: string
): Promise<void> {
  if (!hasConsent()) return;
  const eventId = overrideEventId || generateEventId();
  const eventTime = Math.floor(Date.now() / 1000);

  // 1. Client-side Pixel (fbq). Advanced Matching first so the identifiers are
  //    attached to this event, not only to whatever fires next.
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    applyAdvancedMatching(userData);
    window.fbq('track', eventName, pixelCustomData, { eventID: eventId });
  }

  // 2. Server-side CAPI via our Vercel function
  try {
    const collectedUserData = await collectUserData(userData);

    const payload = {
      event_name: eventName,
      event_id: eventId,
      event_time: eventTime,
      event_source_url: safeSourceUrl(),
      action_source: 'website',
      user_data: collectedUserData,
      custom_data: {
        ...capiCustomData,
      },
    };

    // Fire-and-forget — don't block the UI
    fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // Survives page navigation
    }).catch(() => {
      // Silently fail — the Pixel event is the fallback
    });
  } catch {
    // CAPI is a bonus — Pixel already fired
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Initial PageView CAPI — fires the server-side counterpart for the initial
 * PageView that the Pixel base code in index.html already fired.
 * Uses the same eventID stored on window.__MT_INIT_PV_ID for deduplication.
 *
 * Call this ONCE from AnalyticsTracker on first mount.
 */
export function trackInitialPageViewCAPI(): void {
  if (!hasConsent()) return;
  const eventId = typeof window !== 'undefined' ? window.__MT_INIT_PV_ID : undefined;
  if (!eventId) return;

  // Clear it so it can't fire again
  window.__MT_INIT_PV_ID = undefined;

  // CAPI only — pixel already fired in index.html with matching eventID
  collectUserData().then((collectedUserData) => {
    fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'PageView',
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: safeSourceUrl(),
        action_source: 'website',
        user_data: collectedUserData,
        custom_data: {},
      }),
      keepalive: true,
    }).catch(() => {});
  }).catch(() => {});
}

/**
 * PageView — call on SPA route changes.
 * Fires BOTH pixel and CAPI with matching eventID.
 */
export function trackPageView(): void {
  if (!hasConsent()) return;
  const eventId = generateEventId();

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }

  // CAPI PageView
  collectUserData().then((collectedUserData) => {
    fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'PageView',
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: safeSourceUrl(),
        action_source: 'website',
        user_data: collectedUserData,
        custom_data: {},
      }),
      keepalive: true,
    }).catch(() => {});
  }).catch(() => {});
}

/**
 * Contact — user clicks a primary CTA into the qualification funnel.
 * This is the primary conversion event for Milktree.
 */
export function trackContact(params: BaseEventParams = {}): void {
  const customData: Record<string, unknown> = {};
  if (params.eventSource) customData.event_source = params.eventSource;

  sendMetaEvent('Contact', customData, customData, params.userData, params.eventId);
}

/**
 * Representative per-booking value, so Meta value-optimisation has signal and
 * Ads Manager doesn't read £0.00. Shared by Lead, Schedule and the GA4
 * `generate_lead` event so all three report the same number.
 */
export const LEAD_VALUE = 150;
export const LEAD_CURRENCY = 'GBP';

/**
 * Lead — the campaign's single optimisation event. Fires ONCE, on a completed
 * Cal.com booking. Deliberately NOT fired on a qualified /start submission:
 * one human going form → booking would otherwise report two Leads and £300,
 * training delivery toward form-fillers rather than bookers.
 */
export function trackLead(params: BaseEventParams = {}): void {
  const customData: Record<string, unknown> = { currency: LEAD_CURRENCY, value: LEAD_VALUE };
  if (params.eventSource) customData.event_source = params.eventSource;

  sendMetaEvent('Lead', customData, customData, params.userData, params.eventId);
}

/**
 * Schedule — fires alongside Lead for additional signal. Carries the same value
 * so it isn't reported at £0.00 in Ads Manager.
 */
export function trackSchedule(params: BaseEventParams = {}): void {
  const customData: Record<string, unknown> = { currency: LEAD_CURRENCY, value: LEAD_VALUE };
  if (params.eventSource) customData.event_source = params.eventSource;

  sendMetaEvent('Schedule', customData, customData, params.userData, params.eventId);
}

/**
 * Any other Meta STANDARD event (e.g. `CompleteRegistration`).
 *
 * Standard events go through `fbq('track', ...)` and are optimisable in Ads
 * Manager; `trackCustom` uses `fbq('trackCustom', ...)` and is not. Use this
 * when the action maps onto a name Meta already knows.
 */
export function trackStandard(
  eventName: string,
  params: CustomEventParams = {},
): void {
  const customData = { ...(params.customData || {}) } as Record<string, unknown>;
  if (params.eventSource) customData.event_source = params.eventSource;

  sendMetaEvent(eventName, customData, customData, params.userData, params.eventId);
}

/**
 * ViewContent — user views a case study or key page.
 */
export function trackViewContent(params: ViewContentParams = {}): void {
  const customData: Record<string, unknown> = {};
  if (params.contentName) customData.content_name = params.contentName;
  if (params.contentCategory) customData.content_category = params.contentCategory;
  if (params.contentIds) customData.content_ids = params.contentIds;

  sendMetaEvent('ViewContent', customData, customData, params.userData, params.eventId);
}

/**
 * Custom event — for micro-conversions like FAQ interaction, social clicks, scroll depth.
 * Uses fbq('trackCustom', ...) instead of fbq('track', ...).
 */
export function trackCustom(eventName: string, params: CustomEventParams = {}): void {
  if (!hasConsent()) return;
  const eventId = params.eventId || generateEventId();
  const eventTime = Math.floor(Date.now() / 1000);
  const customData = params.customData || {};

  // Client-side: custom event
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    applyAdvancedMatching(params.userData);
    window.fbq('trackCustom', eventName, customData, { eventID: eventId });
  }

  // Server-side CAPI
  collectUserData(params.userData).then((collectedUserData) => {
    fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_time: eventTime,
        event_source_url: safeSourceUrl(),
        action_source: 'website',
        user_data: collectedUserData,
        custom_data: customData,
      }),
      keepalive: true,
    }).catch(() => {});
  }).catch(() => {});
}
