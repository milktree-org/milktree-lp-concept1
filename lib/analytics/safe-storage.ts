/**
 * Safe access to Web Storage.
 *
 * WebKit throws on the *getter* — `window.localStorage` itself raises
 * `SecurityError: The operation is insecure.` when storage is blocked (iOS
 * Settings → Safari → Advanced → Block All Cookies, and Safari desktop's
 * "Block all cookies"). Chrome and Firefox instead hand back a stub object and
 * only fail on the method call.
 *
 * That difference matters: a `try/catch` wrapped around `storage.getItem(...)`
 * does NOT protect you if `localStorage` is named at the call site, because the
 * identifier resolves — and throws — before control enters the try block. The
 * exception then propagates out of whatever effect or handler invoked it. In
 * this codebase that meant the /start submit handler and the Cal.com embed's
 * mount effect could both die outright on a Safari user with cookies blocked.
 *
 * Always go through these helpers rather than touching localStorage directly.
 * They return null when storage is unavailable, so callers degrade to
 * "no attribution" instead of crashing.
 */

export function safeLocalStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null; // SecurityError — cookies/storage blocked
  }
}

export function safeSessionStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Read a key, or null if storage is unavailable or the read fails. */
export function safeGet(storage: Storage | null, key: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** Write a key. Silently no-ops when storage is unavailable or full. */
export function safeSet(storage: Storage | null, key: string, value: string): void {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    /* quota exceeded / private mode — nothing useful to do */
  }
}

/** Remove a key. Silently no-ops when storage is unavailable. */
export function safeRemove(storage: Storage | null, key: string): void {
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* nothing to do */
  }
}
