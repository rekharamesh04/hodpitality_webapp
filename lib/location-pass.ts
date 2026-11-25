/**
 * Location passes: how a desk login on a phone proves it is at one of its clinics.
 *
 * An organisation can limit desk staff to its clinics. On a clinic's own internet nothing is
 * needed. Elsewhere (a phone on mobile data, whose address keeps changing) the API answers
 * 403 NETWORK_NOT_ALLOWED with `location: true`; the app then reads the device's position once,
 * sends it to POST /auth/location-check, and gets back a pass that lasts 20 minutes. The pass
 * goes with every request (X-Location-Pass) and is renewed by checking again every 8 minutes.
 *
 * The server never stores the position; this module never stores it either. Only the pass is
 * kept, in localStorage, and it is dropped on sign-out.
 *
 * Nothing here imports the API client or the auth store, so both can use it.
 */

export const LOCATION_CHECK_PATH = '/auth/location-check';
export const LOCATION_PASS_HEADER = 'X-Location-Pass';
const PASS_KEY = 'entryflow_location_pass';
/** The server's pass lasts 20 minutes; renew it when about 12 are left (8 minutes in). */
export const RENEW_WHEN_LEFT_MS = 12 * 60_000;
/** Browsers can leave a location prompt unanswered forever; stop waiting after this. */
const POSITION_WAIT_MS = 30_000;

interface StoredPass {
  token: string;
  expiresAt: number;
  site?: string;
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function readStored(): StoredPass | null {
  try {
    const raw = storage()?.getItem(PASS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredPass>;
    if (typeof parsed.token !== 'string' || typeof parsed.expiresAt !== 'number') return null;
    return { token: parsed.token, expiresAt: parsed.expiresAt, site: parsed.site };
  } catch {
    return null;
  }
}

/** The pass to send, or null when there is none or it has expired. */
export function readLocationPass(now: number = Date.now()): string | null {
  const stored = readStored();
  return stored && stored.expiresAt > now ? stored.token : null;
}

/** Milliseconds until the pass should be renewed, or null when there is no live pass. */
export function msUntilRenewal(now: number = Date.now()): number | null {
  const stored = readStored();
  if (!stored || stored.expiresAt <= now) return null;
  return Math.max(0, stored.expiresAt - now - RENEW_WHEN_LEFT_MS);
}

export function saveLocationPass(token: string, expiresInSeconds: number, site?: string, now: number = Date.now()) {
  try {
    storage()?.setItem(PASS_KEY, JSON.stringify({ token, expiresAt: now + expiresInSeconds * 1000, site }));
  } catch {
    /* storage unavailable: the next request asks again */
  }
}

export function clearLocationPass() {
  try {
    storage()?.removeItem(PASS_KEY);
  } catch {
    /* storage unavailable */
  }
}

export type PositionProblem = 'denied' | 'unavailable' | 'timeout' | 'unsupported';
export type PositionReading = { lat: number; lng: number; accuracy: number } | { problem: PositionProblem };

/** What the server answers from /auth/location-check. */
export interface LocationCheckResult {
  allowed: boolean;
  /** False when no check was needed (on the clinic network, an administrator, exempt, or switched off). */
  needed?: boolean;
  pass?: string;
  expiresIn?: number;
  site?: { id: string; name: string };
  reason?: string;
  error?: string;
}

/** Refusals that mean "you are not at a clinic", as opposed to "the device could not say". */
export function isDefiniteRefusal(result: LocationCheckResult): boolean {
  return !result.allowed && ['far', 'imprecise', 'no_location'].includes(result.reason ?? '');
}

/** The device's position, once. Never rejects: a failure comes back as `{ problem }`. */
export function readPosition(
  geo: Geolocation | undefined = typeof navigator !== 'undefined' ? navigator.geolocation : undefined,
): Promise<PositionReading> {
  if (typeof window === 'undefined' || !geo || window.isSecureContext === false) {
    return Promise.resolve({ problem: 'unsupported' });
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = (reading: PositionReading) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(reading);
    };
    const timer = setTimeout(() => finish({ problem: 'timeout' }), POSITION_WAIT_MS);
    try {
      geo.getCurrentPosition(
        (pos) => finish({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => finish({ problem: err.code === 1 ? 'denied' : err.code === 3 ? 'timeout' : 'unavailable' }),
        { enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000 },
      );
    } catch {
      finish({ problem: 'unsupported' });
    }
  });
}
