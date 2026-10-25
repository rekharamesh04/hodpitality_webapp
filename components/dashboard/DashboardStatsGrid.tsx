'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { getFriendlyErrorMessage } from '@/lib/utils';
import { useTerminology } from '@/hooks';
import type { DashboardStats } from '@/types';
import { cn } from '@/lib/utils';

/** Column template per count of secondary figures: the headline gets the wider first column. */
const COLUMNS: Record<number, string> = {
  3: 'lg:grid-cols-[1.6fr_1fr_1fr_1fr]',
  4: 'lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]',
};

interface DashboardStatsGridProps {
  stats?: DashboardStats;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
}

/**
 * Today in numbers: one headline figure, a few supporting ones beside it, and
 * the all-time totals as a quiet line underneath — they describe the
 * organisation, not the day, so they don't compete with what needs doing now.
 */
export function DashboardStatsGrid({ stats, isLoading, isError, error, onRetry }: DashboardStatsGridProps) {
  const t = useTerminology();

  if (isError) {
    return (
      <ErrorState
        title="Unable to load dashboard statistics"
        message={getFriendlyErrorMessage(error)}
        onRetry={onRetry}
      />
    );
  }

  // In the tenant's vocabulary, and without a figure for a module the industry
  // is not offered — the same rule as the cards below.
  const secondary = [
    { label: `${t.person.many} arrived`, value: stats?.guestsArrived ?? 0 },
    { label: `Pending ${t.person.many.toLowerCase()}`, value: stats?.pendingGuests ?? 0 },
    ...(t.has('hospitality')
      ? [{ label: `${t.place.one} service bookings`, value: stats?.hospitalityBookings ?? 0 }]
      : []),
    { label: `${t.place.one} occupancy`, value: `${stats?.venueOccupancy ?? 0}%` },
  ];
  const totals = [
    `${(stats?.totalGuests ?? 0).toLocaleString()} ${t.person.many.toLowerCase()} on file`,
    `${stats?.activeStaff ?? 0} active staff`,
    ...(t.has('events') ? [`${stats?.totalEvents ?? 0} events`] : []),
  ];

  return (
    <section aria-label="Today in numbers" className="overflow-hidden rounded-xl border bg-card">
      <div className={cn('grid grid-cols-2 gap-px bg-border', COLUMNS[secondary.length])}>
        <div className="col-span-2 bg-card p-5 lg:col-span-1">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            Today&apos;s check-ins
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-10 w-20" />
          ) : (
            <p data-stat className="mt-1 text-4xl font-semibold tracking-tight">{stats?.todayCheckIns ?? 0}</p>
          )}
        </div>
        {secondary.map((s, i) => (
          // On phones (two columns) an odd last figure takes the full row instead of leaving a gap.
          <div
            key={s.label}
            className={cn('bg-card p-5', secondary.length % 2 === 1 && i === secondary.length - 1 && 'col-span-2 lg:col-span-1')}
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-7 w-12" />
            ) : (
              <p data-stat className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
            )}
          </div>
        ))}
      </div>
      <div className="border-t px-5 py-2.5 text-xs text-muted-foreground">
        {isLoading ? <Skeleton className="h-4 w-64" /> : totals.join(' · ')}
      </div>
    </section>
  );
}
