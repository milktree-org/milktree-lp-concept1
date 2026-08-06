/**
 * Cookie consent — shared state, storage and the signals we send downstream.
 *
 * UK PECR requires opt-in before non-essential storage. Meta's `_fbp`/`_fbc`,
 * GA4's `_ga` and Clarity's `_clck` are all non-essential, and the site's
 * privacy policy names consent as the legal basis — so the policy and the code
 * have to agree.
 *
 * How each vendor is handled when consent is absent:
 *   - GA4     — loaded, but Consent Mode v2 defaults everything to `denied`.
 *               Google then sends cookieless pings that still power behavioural
 *               modelling, so a rejection costs far less measurement than
 *               blocking the tag outright. No cookies are written.
 *   - Meta    — loaded with `fbq('consent','revoke')` set BEFORE `init`, so the
 *               Pixel writes nothing and holds events until consent is granted.
 *   - Clarity — not loaded at all. It has no cookieless mode worth having, and
 *               session replay is the highest-risk recorder on the site.
 */

import { safeLocalStorage, safeSessionStorage, safeGet, safeSet, safeRemove } from './safe-storage';

export type ConsentState = 'granted' | 'denied';

/**
 * Master switch for the consent gate.
 *
 * Turned OFF on 2026-08-06 at Akash's instruction: the gate was costing ~85% of
 * paid signal. Measured on the Jul-26 campaign — 96 outbound ad clicks produced
 * 14 landing-page views (14.6%; healthy is 70–85%), because BOTH the Pixel and
 * the CAPI leg were held until a visitor accepted the bar. 96% of delivery is
 * the Facebook/Instagram in-app browser, the worst case for acceptance rates.
 *
 * With this false: tags load for everyone, Consent Mode defaults to granted and
 * the bar is not rendered. `/privacy` has been updated in the same change to
 * state legitimate interests rather than consent — the policy and the code have
 * to agree, and leaving a "we ask for your consent" claim next to a site that
 * no longer asks would be a misrepresentation, not just a stale doc.
 *
 * This is a commercial/legal trade-off, not a technical one. UK PECR reg. 6
 * requires opt-in for non-essential storage and the ICO's published position is
 * that legitimate interests does not cure that for advertising cookies. Flip
 * this back to `true` to restore the compliant behaviour — nothing else needs
 * to change, every gate in the app reads through `readConsent()`.
 */
export const CONSENT_REQUIRED = false;

export const CONSENT_KEY = 'mt_cookie_consent';

/** Broadcast within the tab when the choice changes (storage events only fire
 *  in *other* tabs, so the banner needs its own signal). */
export const CONSENT_EVENT = 'mt:consent-change';

export function readConsent(): ConsentState | null {
  // Single choke point: every gate in the app (ConsentedScripts, RouteAnalytics,
  // hasConsent() in meta-tracking, useConsent()) resolves through here, so the
  // switch only has to be honoured once.
  if (!CONSENT_REQUIRED) return 'granted';
  if (typeof window === 'undefined') return null;
  try {
    const v = safeGet(safeLocalStorage(), CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    safeSet(safeLocalStorage(), CONSENT_KEY, state);
  } catch {
    // private browsing — the choice just won't persist past this tab
  }
  applyConsent(state);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/**
 * Push the decision to Google and Meta. Safe to call before either tag has
 * finished loading: gtag queues via dataLayer and fbq queues via its stub.
 */
export function applyConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  const granted = state === 'granted';

  window.gtag?.('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  });

  window.fbq?.('consent', granted ? 'grant' : 'revoke');
}

/**
 * Clear the identifiers we control when consent is withdrawn. Vendor cookies on
 * their own domains can't be reached from here, but everything first-party can
 * be, and leaving them behind would contradict the withdrawal.
 */
export function clearTrackingStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const ls = safeLocalStorage(), ss = safeSessionStorage();
    safeRemove(ls, 'mt_external_id');
    safeRemove(ls, 'mt_first_touch');
    safeRemove(ss, 'mt_last_touch');
  } catch {
    /* nothing we can do */
  }

  // Every tracking cookie these vendors set is first-party on our own domain,
  // so all of them are reachable from here. Consent Mode alone only stops
  // Google *using* `_ga`; it leaves the cookie in place, which reads badly for
  // someone who just declined. `_ga_<MEASUREMENT_ID>` has a dynamic suffix, so
  // match by prefix rather than listing names.
  const apex = window.location.hostname.split('.').slice(-2).join('.');
  const names = document.cookie
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter((n) => /^(_fbp|_fbc|_ga|_gid|_clck|_clsk)/.test(n));

  for (const name of new Set(names)) {
    document.cookie = `${name}=;max-age=0;path=/`;
    document.cookie = `${name}=;max-age=0;path=/;domain=.${apex}`;
    document.cookie = `${name}=;max-age=0;path=/;domain=${window.location.hostname}`;
  }
}
