/**
 * A signed-out-proof local session, for demoing without a Cognito account.
 *
 * The pharmacy screens render lib/mock/pharmacy.ts and call no API, so the
 * only thing standing between them and a demo is the login gate. This opens
 * that gate locally — it does not fake any data, and every other screen still
 * talks to the real backend and still fails without a real session.
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
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types';

export const DEV_BYPASS_ENABLED =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';

/** The demo identity. A company_admin so the whole navigation is reachable. */
const DEV_USER: User = {
  id: 'dev-local-user',
  name: 'Dev Pharmacist',
  email: 'dev@localhost.invalid',
  role: 'company_admin',
  tenant_id: 'tenant-dev-local',
  // Drives every label in the product — see useTerminology(). Pharmacy rather
  // than healthcare so the demo reads "Pharmacy Admin" and "Pharmacist"
  // instead of "Hospital Admin" and "Doctor".
  industry: 'pharmacy',
};

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
function makeDevToken(): string {
  const header = base64Url({ alg: 'none', typ: 'JWT' });
  const payload = base64Url({
    sub: DEV_USER.id,
    email: DEV_USER.email,
    'custom:role': DEV_USER.role,
    'custom:tenant_id': DEV_USER.tenant_id,
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

  useAuthStore.getState().login(DEV_USER, { token: makeDevToken() });

  // The login page would otherwise sit there looking signed out.
  return pathname === '/' || pathname.startsWith('/login') ? '/dashboard' : null;
}
