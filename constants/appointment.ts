/** Canonical appointment statuses this app surfaces (backend may also send legacy 'in-progress' / 'no_show'). */
export const APPOINTMENT_STATUSES = [
  'scheduled', 'confirmed', 'pending', 'arrived', 'completed', 'incomplete', 'cancelled', 'no-show',
] as const;

export type AppointmentStatusOption = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  pending: 'Pending',
  arrived: 'Arrived',
  'in-progress': 'Arrived',
  completed: 'Completed',
  incomplete: 'Incomplete',
  cancelled: 'Cancelled',
  'no-show': 'No-show',
  no_show: 'No-show',
};

export const APPOINTMENT_STATUS_STYLES: Record<string, string> = {
  scheduled:     'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  confirmed:     'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
  pending:       'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  arrived:       'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  'in-progress': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  completed:     'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  incomplete:    'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800',
  cancelled:     'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  'no-show':     'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  no_show:       'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
};

/** Terminal states — no desk actions are offered once an appointment reaches one. */
export const TERMINAL_APPOINTMENT_STATUSES = new Set(['completed', 'incomplete', 'cancelled', 'no-show', 'no_show']);

/**
 * How a session ended. Both are closed states; once closed, only a company admin (or above)
 * may reopen or change one — the backend returns 403 to anyone else.
 */
export const SESSION_OUTCOMES = ['completed', 'incomplete'] as const;
export type SessionOutcome = (typeof SESSION_OUTCOMES)[number];

export function isClosedSession(status?: string): boolean {
  return !!status && (SESSION_OUTCOMES as readonly string[]).includes(status);
}

/**
 * What the Update Status menu offers.
 *
 * "end-session" opens the End Session dialog, which records the outcome (completed or
 * incomplete) together with the payment, so a session is never closed without the desk
 * deciding about the fee. "reopen" is for a company admin correcting a closed session.
 * "arrived" is never offered as a manual action — the backend sets it on check-in.
 */
export type StatusMenuAction = 'confirmed' | 'end-session' | 'cancelled' | 'no-show' | 'reopen';

export function getStatusMenuActions(current?: string, canReopen = false): StatusMenuAction[] {
  if (isClosedSession(current)) return canReopen ? ['reopen'] : [];
  if (!current || TERMINAL_APPOINTMENT_STATUSES.has(current)) return [];
  const actions: StatusMenuAction[] = [];
  if (current === 'scheduled' || current === 'pending') actions.push('confirmed');
  actions.push('end-session', 'cancelled', 'no-show');
  return actions;
}
