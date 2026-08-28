/**
 * Minimal, dependency-free JWT payload decoder. Only used to read the `exp` claim so the
 * session-refresh scheduler knows when a token is about to expire — never used for
 * verification (signature is never checked client-side; the backend is the source of truth
 * for whether a token is actually valid).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = typeof window === 'undefined'
      ? Buffer.from(padded, 'base64').toString('utf-8')
      : decodeURIComponent(
          atob(padded)
            .split('')
            .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
        );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns the token's absolute expiry time in epoch milliseconds, or null if it isn't a decodable JWT with an `exp` claim (e.g. the local-only dev/Google session tokens). */
export function getJwtExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') return null;
  return exp * 1000;
}
