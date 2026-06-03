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

// ── Types ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    __MT_INIT_PV_ID?: string;
  }
}

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
}

interface ViewContentParams extends BaseEventParams {
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
}

interface CustomEventParams extends BaseEventParams {
  customData?: Record<string, any>;
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

/** Read Meta cookies (_fbp, _fbc) for improved match rates */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/** Get the _fbc parameter from URL (click ID from Meta ads) */
function getFbcFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  if (!fbclid) return undefined;
  // Build _fbc cookie format: fb.1.{timestamp}.{fbclid}
  return `fb.1.${Date.now()}.${fbclid}`;
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
async function collectUserData(extra?: Partial<UserData>): Promise<Record<string, any>> {
  const userData: Record<string, any> = {};

  // _fbp cookie (browser ID)
  const fbp = getCookie('_fbp');
  if (fbp) userData.fbp = fbp;

  // _fbc cookie (click ID) — check cookie first, then URL param
  const fbc = getCookie('_fbc') || getFbcFromUrl();
  if (fbc) userData.fbc = fbc;

  // Client user agent
  if (typeof navigator !== 'undefined') {
    userData.client_user_agent = navigator.userAgent;
  }

  // Source URL
  if (typeof window !== 'undefined') {
    userData.event_source_url = window.location.href;
  }

  // External ID — persistent anonymous ID for cross-device matching (EMQ boost)
  const externalId = getOrCreateExternalId();
  if (externalId) {
    userData.external_id = [await sha256(externalId)];
  }

  // Country (ISO-3166 alpha-2) — UK-targeted campaign. Meta's CAPI country
  // field is `country`; `ct` is CITY, so 'gb' belongs here, not in ct.
  userData.country = [await sha256('gb')];

  // Hash email if provided
  if (extra?.email) {
    userData.em = [await sha256(extra.email)];
  }

  // Hash phone if provided
  if (extra?.phone) {
    userData.ph = [await sha256(extra.phone)];
  }

  // Hash first name if provided
  if (extra?.firstName) {
    userData.fn = [await sha256(extra.firstName)];
  }

  // Hash last name if provided
  if (extra?.lastName) {
    userData.ln = [await sha256(extra.lastName)];
  }

  return userData;
}

// ── Core send function ───────────────────────────────────────────────────────

/**
 * Fires an event to both the Meta Pixel (client) and the CAPI (server).
 * Uses a shared event_id for deduplication.
 */
async function sendMetaEvent(
  eventName: string,
  pixelCustomData: Record<string, any> = {},
  capiCustomData: Record<string, any> = {},
  userData?: Partial<UserData>
): Promise<void> {
  const eventId = generateEventId();
  const eventTime = Math.floor(Date.now() / 1000);

  // 1. Client-side Pixel (fbq)
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, pixelCustomData, { eventID: eventId });
  }

  // 2. Server-side CAPI via our Vercel function
  try {
    const collectedUserData = await collectUserData(userData);

    const payload = {
      event_name: eventName,
      event_id: eventId,
      event_time: eventTime,
      event_source_url: window?.location?.href || '',
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
        event_source_url: window?.location?.href || '',
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
        event_source_url: window?.location?.href || '',
        action_source: 'website',
        user_data: collectedUserData,
        custom_data: {},
      }),
      keepalive: true,
    }).catch(() => {});
  }).catch(() => {});
}

/**
 * Contact — user clicks a CTA to book a brand audit.
 * This is the primary conversion event for Milktree.
 */
export function trackContact(params: BaseEventParams = {}): void {
  const customData: Record<string, any> = {};
  if (params.eventSource) customData.event_source = params.eventSource;

  sendMetaEvent('Contact', customData, customData, params.userData);
}

/**
 * Lead / Schedule — user completes a Cal.com booking.
 * This is the highest-value conversion event.
 */
export function trackLead(params: BaseEventParams = {}): void {
  const customData: Record<string, any> = { currency: 'GBP', value: 0 };
  if (params.eventSource) customData.event_source = params.eventSource;

  sendMetaEvent('Lead', customData, customData, params.userData);
}

/**
 * Schedule — fires alongside Lead for additional signal.
 */
export function trackSchedule(params: BaseEventParams = {}): void {
  const customData: Record<string, any> = {};
  if (params.eventSource) customData.event_source = params.eventSource;

  sendMetaEvent('Schedule', customData, customData, params.userData);
}

/**
 * ViewContent — user views a case study or key page.
 */
export function trackViewContent(params: ViewContentParams = {}): void {
  const customData: Record<string, any> = {};
  if (params.contentName) customData.content_name = params.contentName;
  if (params.contentCategory) customData.content_category = params.contentCategory;
  if (params.contentIds) customData.content_ids = params.contentIds;

  sendMetaEvent('ViewContent', customData, customData, params.userData);
}

/**
 * Custom event — for micro-conversions like FAQ interaction, social clicks, scroll depth.
 * Uses fbq('trackCustom', ...) instead of fbq('track', ...).
 */
export function trackCustom(eventName: string, params: CustomEventParams = {}): void {
  const eventId = generateEventId();
  const eventTime = Math.floor(Date.now() / 1000);
  const customData = params.customData || {};

  // Client-side: custom event
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
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
        event_source_url: window?.location?.href || '',
        action_source: 'website',
        user_data: collectedUserData,
        custom_data: customData,
      }),
      keepalive: true,
    }).catch(() => {});
  }).catch(() => {});
}
