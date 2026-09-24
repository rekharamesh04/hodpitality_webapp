import { cn } from '@/lib/utils';
import { statusClass, statusLabel } from '@/constants/prescription';

/**
 * A prescription's status.
 *
 * Takes `unknown` rather than a closed union on purpose: the API writes
 * `active` on create but accepts anything on update, so a row can hold a value
 * this build has never heard of. An unknown value renders neutral and
 * de-underscored instead of vanishing.
 */
export function PrescriptionStatusBadge({
  status,
  className,
}: {
  status?: unknown;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        statusClass(status),
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
