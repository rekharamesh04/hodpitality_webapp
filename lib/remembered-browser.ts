/**
 * Remembered browsers: after a password and authenticator code, someone can tick "Remember this
 * browser for 30 days", and is then not asked for the code on this browser until that runs out.
 * The password is always asked for.
 *
 * The server registers this browser with Cognito and hands back its key and a random secret. Only
 * this browser holds the secret; Cognito holds a verifier, and at sign-in the server proves the
 * browser has the secret without sending it anywhere else.
 *
 * Kept per email, so one shared front-desk computer can remember several people separately, and
 * kept through sign-out (that is the point). The server says `forgetDevice` when one is no longer
 * remembered (forgotten in Settings, 30 days passed, password changed), and it is dropped here.
 */

const KEY = 'entryflow_remembered_browsers';
const PART = /^[A-Za-z0-9_-]{1,128}$/;
const SECRET = /^[A-Za-z0-9+/=]{20,200}$/;

export interface RememberedBrowser {
  key: string;
  groupKey: string;
  secret: string;
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readAll(): Record<string, RememberedBrowser> {
  try {
    const parsed = JSON.parse(storage()?.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, RememberedBrowser>) {
  try {
    if (Object.keys(all).length === 0) storage()?.removeItem(KEY);
    else storage()?.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable: the code is simply asked for next time */
  }
}

const norm = (email: string) => email.trim().toLowerCase();

function valid(d: unknown): d is RememberedBrowser {
  const v = d as Partial<RememberedBrowser> | null;
  return !!v && typeof v.key === 'string' && typeof v.groupKey === 'string' && typeof v.secret === 'string'
    && PART.test(v.key) && PART.test(v.groupKey) && SECRET.test(v.secret);
}

/** What to send with this person's sign-in, or undefined. */
export function rememberedBrowserFor(email: string | null | undefined): RememberedBrowser | undefined {
  if (!email) return undefined;
  const d = readAll()[norm(email)];
  return valid(d) ? { key: d.key, groupKey: d.groupKey, secret: d.secret } : undefined;
}

export function saveRememberedBrowser(email: string, device: unknown) {
  if (!email || !valid(device)) return;
  writeAll({ ...readAll(), [norm(email)]: { key: device.key, groupKey: device.groupKey, secret: device.secret } });
}

export function forgetRememberedBrowser(email: string | null | undefined) {
  if (!email) return;
  const all = readAll();
  if (norm(email) in all) {
    delete all[norm(email)];
    writeAll(all);
  }
}

/** The email inside a Google or Microsoft ID token (to find that person's remembered browser). */
export function emailFromIdToken(idToken: string): string {
  try {
    const part = idToken.split('.')[1] ?? '';
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')));
    return String(json.email || json.preferred_username || '').toLowerCase();
  } catch {
    return '';
  }
}
