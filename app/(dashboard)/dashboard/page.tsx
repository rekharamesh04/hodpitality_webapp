'use client';

import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { CheckInOverview } from '@/components/dashboard/CheckInOverview';
import { RecentGuests } from '@/components/dashboard/RecentGuests';
import { HospitalityOverview } from '@/components/dashboard/HospitalityOverview';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { useDashboardStats, useDashboardActivity } from '@/hooks/useReports';
import { useUpcomingEvents } from '@/hooks/useEvents';
import { useCheckIns, useCheckInStats } from '@/hooks/useCheckins';
import { useGuests } from '@/hooks/use-guests';
import { useHospitalityBookings } from '@/hooks/useHospitality';
import { useNotifications, useMarkAllNotificationsRead } from '@/hooks/use-notifications';

export default function DashboardPage() {
  const stats = useDashboardStats();
  const activity = useDashboardActivity();
  const upcomingEvents = useUpcomingEvents();
  const checkIns = useCheckIns();
  const checkInStats = useCheckInStats();
  const guests = useGuests({ limit: 5 });
  const hospitality = useHospitalityBookings();
  const notifications = useNotifications({ limit: 5 });
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      <DashboardStatsGrid
        stats={stats.data}
        isLoading={stats.isLoading}
        isError={stats.isError}
        error={stats.error}
        onRetry={() => stats.refetch()}
      />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed
          activities={activity.data ?? []}
          isLoading={activity.isLoading}
          isError={activity.isError}
          error={activity.error}
          onRetry={() => activity.refetch()}
        />
        <UpcomingEvents
          events={upcomingEvents.data ?? []}
          isLoading={upcomingEvents.isLoading}
          isError={upcomingEvents.isError}
          error={upcomingEvents.error}
          onRetry={() => upcomingEvents.refetch()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CheckInOverview
          checkIns={checkIns.data ?? []}
          stats={checkInStats.data}
          isLoading={checkIns.isLoading}
          isError={checkIns.isError}
          error={checkIns.error}
          onRetry={() => checkIns.refetch()}
        />
        <RecentGuests
          guests={guests.data?.data ?? []}
          isLoading={guests.isLoading}
          isError={guests.isError}
          error={guests.error}
          onRetry={() => guests.refetch()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <HospitalityOverview
          bookings={hospitality.data ?? []}
          isLoading={hospitality.isLoading}
          isError={hospitality.isError}
          error={hospitality.error}
          onRetry={() => hospitality.refetch()}
        />
        <NotificationsPanel
          notifications={notifications.data ?? []}
          isLoading={notifications.isLoading}
          isError={notifications.isError}
          error={notifications.error}
          onRetry={() => notifications.refetch()}
          onMarkAllRead={() => markAllRead.mutate()}
          isMarkingAllRead={markAllRead.isPending}
        />
      </div>
    </div>
  );
}
