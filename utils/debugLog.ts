// Structured, dev-only diagnostic logging for tracing the Admin Web
// customer/appointment flow (customer fetch → customer<->user link →
// appointment create → appointments list/detail). Gated on the existing
// NODE_ENV convention already used elsewhere in this codebase (see
// lib/storage/indexeddb.ts, providers/QueryProvider.tsx) — no new config
// flag — so these are minimized/no-op in production builds.
//
// NEVER pass tokens/passwords/Authorization headers/AWS credentials here —
// only booleans like tokenPresent/tokenType and non-secret ids/fields that
// already exist on the relevant object.
export function debugLog(tag: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') return;
  if (data) console.log(tag, data);
  else console.log(tag);
}

/** Masks an email as `f***@domain.com` for logging. Returns null for missing input. */
export function maskEmail(email?: string | null): string | null {
  if (!email) return null;
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  return `${user[0] ?? '*'}***@${domain}`;
}
