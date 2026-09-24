import { AlertOctagon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PRESCRIPTION_PIPELINE,
  PRESCRIPTION_STATUS_LABELS,
  isExceptionStatus,
} from '@/constants/prescription';
import type { PrescriptionStatus } from '@/types/prescription';

/**
 * Where this prescription has got to.
 *
 * An exception status (a rejection, a hold, a cancellation) is not a point on
 * the line, so it is drawn as an interruption: the pipeline still shows how
 * far the prescription got, with a banner naming what stopped it. Collapsing
 * the two would make "on hold" look like progress.
 */
export function PipelineStepper({
  status,
  /** The last pipeline stage reached before an exception, when there is one. */
  stalledAfter,
  className,
}: {
  status: PrescriptionStatus;
  stalledAfter?: PrescriptionStatus;
  className?: string;
}) {
  const exception = isExceptionStatus(status);
  const reference = exception ? stalledAfter ?? 'received' : status;
  const currentIndex = PRESCRIPTION_PIPELINE.indexOf(reference);

  return (
    <div className={cn('space-y-3', className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-3">
        {PRESCRIPTION_PIPELINE.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex && !exception;
          const stalled = index === currentIndex && exception;
          return (
            <li key={step} className="flex items-center gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                    done && 'border-primary bg-primary text-primary-foreground',
                    current && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/10',
                    stalled && 'border-amber-500 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
                    !done && !current && !stalled && 'border-border bg-muted text-muted-foreground',
                  )}
                  aria-hidden="true"
                >
                  {done ? <Check className="h-3 w-3" /> : stalled ? <AlertOctagon className="h-3 w-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs',
                    current || stalled ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {PRESCRIPTION_STATUS_LABELS[step]}
                </span>
              </div>
              {index < PRESCRIPTION_PIPELINE.length - 1 && (
                <span
                  className={cn('mx-1 h-px w-5 shrink-0', done ? 'bg-primary' : 'bg-border')}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {exception && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
          <p className="text-xs text-amber-900 dark:text-amber-300">
            <span className="font-semibold">{PRESCRIPTION_STATUS_LABELS[status]}</span> — this prescription has
            left the normal workflow and needs someone to decide what happens next.
          </p>
        </div>
      )}
    </div>
  );
}
