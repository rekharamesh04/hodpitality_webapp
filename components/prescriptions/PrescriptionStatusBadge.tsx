import { cn } from '@/lib/utils';
import { PRESCRIPTION_STATUS_CLASSES, PRESCRIPTION_STATUS_LABELS } from '@/constants/prescription';
import type { PrescriptionStatus } from '@/types/prescription';

/**
 * A prescription's queue, as a badge.
 *
 * Deliberately not the shared `<StatusBadge>`: that one de-underscores and
 * capitalises whatever string it is handed, which would render
 * `clinical_review` as "Clinical review" rather than the words a pharmacy
 * actually uses ("Pharmacist review").
 */
export function PrescriptionStatusBadge({
  status,
  className,
}: {
  status: PrescriptionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium',
        PRESCRIPTION_STATUS_CLASSES[status],
        className,
      )}
    >
      {PRESCRIPTION_STATUS_LABELS[status]}
    </span>
  );
}
