/** Canonical appointment statuses this app surfaces (backend may also send legacy 'in-progress' / 'no_show'). */
export const APPOINTMENT_STATUSES = [
  'scheduled', 'confirmed', 'pending', 'arrived', 'completed', 'cancelled', 'no-show',
] as const;

export type AppointmentStatusOption = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  pending: 'Pending',
  arrived: 'Arrived',
  'in-progress': 'Arrived',
  completed: 'Completed',
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
  cancelled:     'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  'no-show':     'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  no_show:       'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
};

/** Terminal states — the backend doesn't allow moving out of these, so no manual actions are offered. */
export const TERMINAL_APPOINTMENT_STATUSES = new Set(['completed', 'cancelled', 'no-show', 'no_show']);

/**
 * Manual status actions a staff/admin can trigger from the UI, keyed by current status.
 * "arrived" is intentionally never offered here — the backend sets it automatically when a
 * guest checks in, and the frontend must not override that transition.
 */
export function getManualStatusActions(current?: string): AppointmentStatusOption[] {
  if (!current || TERMINAL_APPOINTMENT_STATUSES.has(current)) return [];
  const actions: AppointmentStatusOption[] = [];
  if (current === 'scheduled' || current === 'pending') actions.push('confirmed');
  actions.push('completed', 'cancelled', 'no-show');
  return actions;
}
