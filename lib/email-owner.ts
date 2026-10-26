import { industryPack } from '@/constants/industry';
import type { Company, Reseller } from '@/types';

/**
 * Which organisation or reseller already uses this email, for an instant form error — or null.
 *
 * One email is one login, and a login opens one organisation in one industry, so the backend
 * refuses a second company (or a reseller) with an email already in use (409 EMAIL_IN_USE). This
 * says so before the form is sent, from the lists the page already has. The backend still has
 * the last word: it also checks staff and logins this page cannot see.
 */
export function findEmailOwner(
  email: string,
  { companies = [], resellers = [], exceptId }: { companies?: Company[]; resellers?: Reseller[]; exceptId?: string },
): string | null {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return null;
  const same = (value?: string) => (value ?? '').trim().toLowerCase() === wanted;
  // Some rows carry their id only in the key ("COMPANY#<id>").
  const isExcepted = (row: { id?: string; PK?: string }) =>
    !!exceptId && (row.id === exceptId || (row.PK ?? '').split('#')[1] === exceptId);
  const company = companies.find((c) => !isExcepted(c) && same(c.email));
  if (company) return `${company.name || 'another company'} (${industryPack(company.industry).label})`;
  const reseller = resellers.find((r) => !isExcepted(r) && same(r.email));
  if (reseller) return `the reseller ${reseller.name || 'account'}`;
  return null;
}

export function emailInUseMessage(owner: string): string {
  return `Already used by ${owner}. One email can sign in to only one organisation — use a different email.`;
}
