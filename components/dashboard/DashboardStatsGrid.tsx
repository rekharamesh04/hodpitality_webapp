'use client';

import { UserCheck, DoorOpen, Clock, Hotel, Percent, Users, CalendarDays, ShieldCheck } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatsCardSkeleton } from '@/components/common/SkeletonLoader';
import { ErrorState } from '@/components/common/ErrorState';
import { getFriendlyErrorMessage } from '@/lib/utils';
import { useTerminology } from '@/hooks';
import type { DashboardStats } from '@/types';
import { cn } from '@/lib/utils';

/** Columns per tile count (industries show 6–8), so the grid ends on a full row where it can. */
const LEDGER_COLUMNS: Record<number, string> = {
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-3 xl:grid-cols-6',
  7: 'md:grid-cols-4 xl:grid-cols-7',
  8: 'md:grid-cols-4',
};

interface DashboardStatsGridProps {
  stats?: DashboardStats;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
}

export function DashboardStatsGrid({ stats, isLoading, isError, error, onRetry }: DashboardStatsGridProps) {
  const t = useTerminology();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load dashboard statistics"
        message={getFriendlyErrorMessage(error)}
        onRetry={onRetry}
      />
    );
  }

  // In the tenant's vocabulary, and without a tile for a module the industry
  // is not offered — the same rule as the cards below the grid.
  const cards = [
    { title: "Today's Check-ins", value: stats?.todayCheckIns ?? 0, icon: UserCheck },
    { title: `${t.person.many} Arrived`, value: stats?.guestsArrived ?? 0, icon: DoorOpen },
    { title: `Pending ${t.person.many}`, value: stats?.pendingGuests ?? 0, icon: Clock },
    ...(t.has('hospitality')
      ? [{ title: `${t.place.one} Service Bookings`, value: stats?.hospitalityBookings ?? 0, icon: Hotel }]
      : []),
    { title: `${t.place.one} Occupancy`, value: `${stats?.venueOccupancy ?? 0}%`, icon: Percent },
    { title: `Total ${t.person.many}`, value: stats?.totalGuests ?? 0, icon: Users },
    ...(t.has('events') ? [{ title: 'Total Events', value: stats?.totalEvents ?? 0, icon: CalendarDays }] : []),
    { title: 'Active Staff', value: stats?.activeStaff ?? 0, icon: ShieldCheck },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-4', LEDGER_COLUMNS[cards.length] ?? 'md:grid-cols-4')}>
      {cards.map((card) => (
        <StatsCard key={card.title} title={card.title} value={card.value} icon={card.icon} />
      ))}
    </div>
  );
}
