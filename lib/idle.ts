/**
 * Automatic sign-out after inactivity (HIPAA §164.312(a)(2)(iii), "automatic logoff").
 *
 * The last activity time is shared through localStorage, so working in one tab keeps every
 * EntryFlow tab signed in, and a laptop closed overnight is signed out the moment it opens.
 * The kiosk is exempt: it is meant to stay open all day, behind its exit PIN.
 */
export const IDLE_LIMIT_MS = 15 * 60 * 1000;
export const LAST_ACTIVITY_KEY = 'entryflow_last_activity';
export const KIOSK_ACTIVE_KEY = 'entryflow_kiosk_active';
export const IDLE_SIGN_OUT_REASON = 'You were signed out after 15 minutes without activity, to protect patient information.';

/** True when `last` (ms since epoch) is more than `limit` before `now`. A missing time is not idle. */
export function isIdle(last: number | null, now: number, limit: number = IDLE_LIMIT_MS): boolean {
  if (last == null || !Number.isFinite(last)) return false;
  return now - last > limit;
}

/** Whether idle sign-out applies on this page: never on the kiosk, or while kiosk mode is on. */
export function idleSignOutApplies(pathname: string, kioskFlag: string | null): boolean {
  if (pathname.startsWith('/kiosk')) return false;
  return !kioskFlag;
}
