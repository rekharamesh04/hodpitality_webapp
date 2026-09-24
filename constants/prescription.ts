/**
 * Labels and colouring for prescriptions.
 *
 * The lifecycle here is only what the backend recognises — it writes `active`
 * on create and accepts anything on update. That is a much shorter list than a
 * dispensing pharmacy would use; the queue lifecycle sketched in
 * docs/PHARMACY_MODULE.md belongs to a fill record that does not exist yet, so
 * inventing statuses the API cannot store would mean a UI that silently
 * disagrees with the database.
 */
import type { PrescriptionStatus } from '@/types/prescription';

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const PRESCRIPTION_STATUS_CLASSES: Record<PrescriptionStatus, string> = {
  active:    'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  completed: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
  cancelled: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
};

const UNKNOWN_CLASS =
  'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700';

export function isKnownStatus(value: unknown): value is PrescriptionStatus {
  return value === 'active' || value === 'completed' || value === 'cancelled';
}

/** A status's label. An unknown value is shown de-underscored rather than hidden. */
export function statusLabel(value: unknown): string {
  if (isKnownStatus(value)) return PRESCRIPTION_STATUS_LABELS[value];
  if (typeof value === 'string' && value.trim()) return value.replace(/[_-]/g, ' ');
  return 'Unknown';
}

/** Tailwind classes for a status, neutral when the API sends something new. */
export function statusClass(value: unknown): string {
  return isKnownStatus(value) ? PRESCRIPTION_STATUS_CLASSES[value] : UNKNOWN_CLASS;
}

/** The filter tabs the worklist offers. `undefined` means "everything". */
export const PRESCRIPTION_QUEUES: readonly { id: string; label: string; status?: PrescriptionStatus }[] = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'Active',    status: 'active' },
  { id: 'completed', label: 'Completed', status: 'completed' },
  { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
];
