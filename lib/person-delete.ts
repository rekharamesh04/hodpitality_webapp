import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';

/** What the backend removed along with a person: { APPOINTMENT: 2, PRESCRIPTION: 1, … }. */
export type RemovedCounts = Partial<Record<string, number>>;

export interface PersonDeleteResult {
  success?: boolean;
  removed?: RemovedCounts;
}

const LABELS: Record<string, [string, string]> = {
  APPOINTMENT: ['appointment', 'appointments'],
  PRESCRIPTION: ['prescription', 'prescriptions'],
  DOCUMENT: ['report', 'reports'],
  CHECKIN: ['visit', 'visits'],
  HOSPITALITY: ['request', 'requests'],
  REGISTRATION: ['registration', 'registrations'],
};

/** "with 2 appointments and 1 prescription", or "" when nothing else went. */
export function describeRemoved(removed?: RemovedCounts): string {
  const parts = Object.entries(LABELS)
    .map(([key, [one, many]]) => {
      const n = removed?.[key] ?? 0;
      return n > 0 ? `${n} ${n === 1 ? one : many}` : '';
    })
    .filter(Boolean);
  if (parts.length === 0) return '';
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  return `with ${list}`;
}

/** The warning every "delete this person" confirmation shows. */
export function personDeleteWarning(personLabel: string): string {
  return `This also deletes their appointments, prescriptions, reports, visits and face data. `
    + `Payments are kept for your accounts, marked "${personLabel} deleted". This cannot be undone.`;
}

/** Everything that listed the person's records has to refetch, not just the people list. */
export function invalidateAfterPersonDelete(qc: QueryClient) {
  for (const key of [
    QUERY_KEYS.GUESTS, QUERY_KEYS.CUSTOMERS, QUERY_KEYS.APPOINTMENTS, QUERY_KEYS.CALENDAR,
    QUERY_KEYS.PRESCRIPTIONS, QUERY_KEYS.CHECKINS, QUERY_KEYS.PAYMENTS,
  ]) {
    qc.invalidateQueries({ queryKey: key });
  }
}
