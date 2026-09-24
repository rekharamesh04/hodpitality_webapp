'use client';

import { useMemo } from 'react';
import { AlertTriangle, Ban, Info, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import {
  ALERT_KIND_LABELS,
  ALERT_SEVERITY_CLASSES,
  ALERT_SEVERITY_LABELS,
  SEVERITY_RANK,
  isBlockingSeverity,
} from '@/constants/prescription';
import type { AlertSeverity, ClinicalAlert } from '@/types/prescription';

const SEVERITY_ICON: Record<AlertSeverity, LucideIcon> = {
  info: Info,
  moderate: AlertTriangle,
  severe: ShieldAlert,
  contraindicated: Ban,
};

/**
 * The clinical screening result for one prescription.
 *
 * Alerts are sorted worst-first so a contraindication is never below a piece
 * of trivia, and an overridden alert stays in the list — greyed, with who
 * accepted it and why — rather than disappearing, because the override is the
 * part a later reviewer needs to see.
 *
 * The list advises; it never decides. `onOverride` is what lets a pharmacist
 * record their judgement, and a blocking alert shows that button rather than
 * removing the fill action elsewhere on the page.
 */
export function ClinicalAlertList({
  alerts,
  onOverride,
  className,
}: {
  alerts: ClinicalAlert[];
  onOverride?: (alert: ClinicalAlert) => void;
  className?: string;
}) {
  const sorted = useMemo(
    () =>
      [...alerts].sort((a, b) => {
        const overrideDiff = Number(!!a.overriddenAt) - Number(!!b.overriddenAt);
        if (overrideDiff !== 0) return overrideDiff;
        return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
      }),
    [alerts],
  );

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4',
          'dark:border-green-900 dark:bg-green-950/20',
          className,
        )}
      >
        <ShieldCheck className="h-5 w-5 shrink-0 text-green-700 dark:text-green-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-green-900 dark:text-green-300">No clinical alerts</p>
          <p className="text-xs text-green-800/80 dark:text-green-400/80">
            Screening found no interaction, allergy or duplicate-therapy issue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className={cn('space-y-3', className)}>
      {sorted.map((alert) => {
        const Icon = SEVERITY_ICON[alert.severity];
        const overridden = !!alert.overriddenAt;
        return (
          <li
            key={alert.id}
            className={cn(
              'rounded-lg border p-4',
              overridden
                ? 'border-border bg-muted/40'
                : ALERT_SEVERITY_CLASSES[alert.severity],
            )}
          >
            <div className="flex items-start gap-3">
              <Icon
                className={cn('mt-0.5 h-4 w-4 shrink-0', overridden && 'text-muted-foreground')}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn('text-sm font-semibold', overridden && 'text-muted-foreground')}>
                    {alert.title}
                  </p>
                  <span className="rounded border border-current/25 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide opacity-80">
                    {ALERT_SEVERITY_LABELS[alert.severity]}
                  </span>
                  <span className="text-[11px] opacity-70">{ALERT_KIND_LABELS[alert.kind]}</span>
                </div>

                <p className={cn('mt-1 text-xs leading-relaxed opacity-90', overridden && 'text-muted-foreground')}>
                  {alert.detail}
                </p>

                {alert.againstDrug && (
                  <p className="mt-1 text-[11px] opacity-70">Against: {alert.againstDrug}</p>
                )}

                {overridden ? (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Overridden by {alert.overriddenBy ?? 'a pharmacist'} on{' '}
                    {formatDate(alert.overriddenAt, 'MMM dd, yyyy HH:mm')}
                    {alert.overrideReason ? ` — ${alert.overrideReason}` : ''}
                  </p>
                ) : (
                  onOverride &&
                  isBlockingSeverity(alert.severity) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => onOverride(alert)}
                    >
                      Review &amp; override
                    </Button>
                  )
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
