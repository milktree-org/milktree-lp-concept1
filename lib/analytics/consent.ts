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

export const CONSENT_KEY = 'mt_cookie_consent';

/** Broadcast within the tab when the choice changes (storage events only fire
 *  in *other* tabs, so the banner needs its own signal). */
export const CONSENT_EVENT = 'mt:consent-change';

export function readConsent(): ConsentState | null {
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
