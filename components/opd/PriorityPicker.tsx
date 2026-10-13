'use client';

import { cn } from '@/lib/utils';
import { VISIT_PRIORITIES, VISIT_PRIORITY_LABEL, VISIT_PRIORITY_STYLE } from '@/constants/opd';
import type { VisitPriority } from '@/types';

/** Emergency / Urgent / Routine as three buttons — one tap at a busy desk, not a dropdown. */
export function PriorityPicker({
  value, onChange, disabled, id,
}: {
  value: VisitPriority;
  onChange: (value: VisitPriority) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <div id={id} role="radiogroup" aria-label="Visit priority" className="grid grid-cols-3 gap-2">
      {VISIT_PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          role="radio"
          aria-checked={value === p}
          disabled={disabled}
          onClick={() => onChange(p)}
          className={cn(
            'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
            value === p ? VISIT_PRIORITY_STYLE[p] : 'bg-background text-muted-foreground hover:bg-accent',
          )}
        >
          {VISIT_PRIORITY_LABEL[p]}
        </button>
      ))}
    </div>
  );
}

/** A small badge for a visit's priority. Routine draws nothing — most visits are routine. */
export function PriorityBadge({ priority, className }: { priority: VisitPriority; className?: string }) {
  if (priority === 'routine') return null;
  return (
    <span className={cn('inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase', VISIT_PRIORITY_STYLE[priority], className)}>
      {VISIT_PRIORITY_LABEL[priority]}
    </span>
  );
}
