'use client';

import { Users, UserCheck, Clock, Hotel } from 'lucide-react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { VenueOccupancy } from '@/components/dashboard/VenueOccupancy';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { useDashboardStats, useChartData } from '@/hooks/useReports';
import { useActivityFeed, useUpcomingEvents } from '@/hooks/use-dashboard';
import { useVenues } from '@/hooks/useVenues';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: activity }         = useActivityFeed();
  const { data: upcomingEvents }   = useUpcomingEvents();
  const { data: venues }           = useVenues();
  const { data: checkInTrends }    = useChartData('checkins');
  const { data: guestCategories }  = useChartData('guest-categories');

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Check-ins"
          value={isLoading ? '…' : (stats?.todayCheckIns ?? 0)}
          icon={UserCheck}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Guests"
          value={isLoading ? '…' : (stats?.totalGuests ?? 0)}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Guests"
          value={isLoading ? '…' : (stats?.pendingGuests ?? 0)}
          icon={Clock}
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="Hospitality Bookings"
          value={isLoading ? '…' : (stats?.hospitalityBookings ?? 0)}
          icon={Hotel}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChartComponent
          title="Check-in Trends"
          description="Daily check-ins over the past week"
          data={checkInTrends ?? []}
          dataKey="value"
          xAxisKey="label"
        />
        <PieChartComponent
          title="Guest Categories"
          description="Distribution of guest types"
          data={guestCategories ?? []}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed activities={(activity as any) ?? []} />
        <div className="space-y-6">
          <UpcomingEvents events={(upcomingEvents as any) ?? []} />
          <VenueOccupancy venues={((venues ?? []) as any).slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
