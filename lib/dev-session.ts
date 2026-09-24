/**
 * A signed-out-proof local session, for demoing without a Cognito account.
 *
 * Every screen now talks to the real backend, so this opens the login gate
 * and nothing else: it fakes an identity, never data. A screen that needs the
 * API still needs a real session, and will show its error state without one.
 * That makes this useful for walking the UI, not for demoing live data.
 *
 * TWO GUARDS, BOTH REQUIRED
 * -------------------------
 * `NODE_ENV !== 'production'` is the one that matters. `next build` sets
 * NODE_ENV to production, so DEV_BYPASS_ENABLED is folded to a literal `false`
 * at build time and installDevSession() returns on its first line, whatever
 * NEXT_PUBLIC_DEV_BYPASS_AUTH is set to. Verified rather than assumed: a build
 * run with the flag deliberately ON emits `let i=!1` for the constant.
 *
 * Note what that does NOT mean. The function body survives minification as
 * unreachable code, so grepping a bundle for "DEV BYPASS" finds the warning
 * string and proves nothing either way. The property to rely on is the
 * constant being false, not the code being absent.
 *
 * The explicit NEXT_PUBLIC_DEV_BYPASS_AUTH is the second guard, so this stays
 * off for everyone who has not asked for it even in development.
 *
 * The token is shaped like a Cognito ID token because middleware.ts reads the
 * payload to decide whether a request carries a real staff session. It is not
 * signed, and nothing accepts it: the API Gateway authorizer verifies
 * signatures, so any request made with it is answered 401. That is the point —
 * this grants a local UI session and no access to anything.
 */
import { STORAGE_KEYS } from '@/constants';
import { isIndustrySlug, type IndustrySlug } from '@/constants/industry';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types';

export const DEV_BYPASS_ENABLED =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

/**
 * Which industry the local session belongs to.
 *
 * The whole point of the demo is that one product looks like three: a
 * pharmacy, a spa and a hotel differ in what they call people and which
 * modules they are offered. Switching that used to mean editing this file, so
 * it reads an env var, and `setDevIndustry` lets the running app change it
 * without a restart — a demo should not need a terminal.
 */
const DEV_INDUSTRY_KEY = 'entryflow_dev_industry';

function readDevIndustry(): IndustrySlug {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(DEV_INDUSTRY_KEY);
      if (isIndustrySlug(stored)) return stored;
    } catch {
      // Storage unavailable (private mode) — fall through to the env default.
    }
  }
  const fromEnv = process.env.NEXT_PUBLIC_DEV_BYPASS_INDUSTRY;
  return isIndustrySlug(fromEnv) ? fromEnv : 'pharmacy';
}

/** What the demo user is called in each industry, so the name is not jarring. */
const DEV_NAMES: Partial<Record<IndustrySlug, string>> = {
  pharmacy: 'Dev Pharmacist',
  wellness: 'Dev Spa Manager',
  hospitality: 'Dev Hotel Manager',
  healthcare: 'Dev Clinician',
};

/** The demo identity. A company_admin so the whole navigation is reachable. */
function devUser(industry: IndustrySlug): User {
  return {
    id: 'dev-local-user',
    name: DEV_NAMES[industry] ?? 'Dev Manager',
    email: 'dev@localhost.invalid',
    role: 'company_admin',
    tenant_id: 'tenant-dev-local',
    // Drives every label in the product — see useTerminology().
    industry,
  };
}

/**
 * Switch the local session to another industry and reload.
 *
 * A reload rather than a store update: the vocabulary is read by every page
 * through useTerminology, and a hard reload is the one way to be certain no
 * screen is left holding the previous industry's words mid-demo.
 */
export function setDevIndustry(slug: IndustrySlug): void {
  if (!DEV_BYPASS_ENABLED || typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEV_INDUSTRY_KEY, slug);
  } catch {
    return;
  }
  window.location.reload();
}

/** The industry the local session is currently pretending to be. */
export function currentDevIndustry(): IndustrySlug {
  return readDevIndustry();
}

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * A JWT-shaped token carrying the claims middleware.ts looks for.
 *
 * It must not begin with `mock-jwt-`, `local-session-` or
 * `local-google-session-`: the auth store treats those prefixes as leftovers
 * from the removed mock layer and force-logs-out on sight. A base64url header
 * always begins "eyJ", so this is safe by construction rather than by luck.
 */
function makeDevToken(industry: IndustrySlug): string {
  const header = base64Url({ alg: 'none', typ: 'JWT' });
  const user = devUser(industry);
  const payload = base64Url({
    sub: user.id,
    email: user.email,
    'custom:role': user.role,
    'custom:tenant_id': user.tenant_id,
    token_use: 'id',
    // Far enough out that a demo is never interrupted by an expiry.
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    iat: Math.floor(Date.now() / 1000),
  });
  return `${header}.${payload}.dev-not-a-signature`;
}

/**
 * Installs the local session if the flag is on and there is no real one.
 *
 * Returns the path to redirect to, or null to stay put. A real session is
 * never replaced: someone who can log in properly should keep their own
 * identity even with the flag left on.
 */
export function installDevSession(pathname: string): string | null {
  if (!DEV_BYPASS_ENABLED || typeof window === 'undefined') return null;

  const existing = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const alreadyAuthenticated = useAuthStore.getState().isAuthenticated;
  if (existing && alreadyAuthenticated) return null;

  // eslint-disable-next-line no-console
  console.warn(
    '[DEV BYPASS] Signed in as a local demo user — no real session exists.\n' +
      'Every API call will still be rejected 401; only screens with local data work.\n' +
      'Unset NEXT_PUBLIC_DEV_BYPASS_AUTH to turn this off.',
  );

  const industry = readDevIndustry();
  useAuthStore.getState().login(devUser(industry), { token: makeDevToken(industry) });

  // The login page would otherwise sit there looking signed out.
  return pathname === '/' || pathname.startsWith('/login') ? '/dashboard' : null;
}
