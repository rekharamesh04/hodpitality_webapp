import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCHEDULE_LABELS, isControlled } from '@/constants/prescription';
import type { ControlledSchedule } from '@/types/prescription';

/**
 * The DEA schedule marker, shown only when there is one.
 *
 * A controlled substance changes what the counter is allowed to do — who may
 * collect it, what ID is required, what gets reported — so it is marked
 * everywhere a prescription appears rather than only on the detail page.
 */
export function ControlledBadge({
  schedule,
  className,
}: {
  schedule: ControlledSchedule;
  className?: string;
}) {
  if (!isControlled(schedule)) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold',
        'border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400',
        className,
      )}
      title={`Schedule ${SCHEDULE_LABELS[schedule]} controlled substance`}
    >
      <Lock className="h-3 w-3" aria-hidden="true" />
      {SCHEDULE_LABELS[schedule]}
    </span>
  );
}
