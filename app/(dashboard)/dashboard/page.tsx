'use client';

import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { CheckInOverview } from '@/components/dashboard/CheckInOverview';
import { RecentGuests } from '@/components/dashboard/RecentGuests';
import { RecentPayments } from '@/components/dashboard/RecentPayments';
import { HospitalityOverview } from '@/components/dashboard/HospitalityOverview';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { WorkflowGuide } from '@/components/workflow/WorkflowGuide';
import { getWorkflow } from '@/constants/workflow';
import { useTerminology } from '@/hooks';
import { useDashboardStats, useDashboardActivity } from '@/hooks/useReports';
import { useUpcomingEvents } from '@/hooks/useEvents';
import { useCheckIns, useCheckInStats } from '@/hooks/useCheckins';
import { useGuests } from '@/hooks/use-guests';
import { usePayments } from '@/hooks/usePayments';
import { useHospitalityBookings } from '@/hooks/useHospitality';
import { useNotifications, useMarkAllNotificationsRead } from '@/hooks/use-notifications';

export default function DashboardPage() {
  const t = useTerminology();
  const workflow = getWorkflow(t.slug);
  const hasPayments = t.has('payments');

  const stats = useDashboardStats();
  const activity = useDashboardActivity();
  const upcomingEvents = useUpcomingEvents();
  const checkIns = useCheckIns();
  const checkInStats = useCheckInStats();
  const guests = useGuests({ limit: 5 });
  const payments = usePayments({ limit: 20 }, { enabled: hasPayments });
  const hospitality = useHospitalityBookings();
  const notifications = useNotifications({ limit: 5 });
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* With a workflow, the flow itself is the set of quick actions. */}
      {workflow.length > 0 && <WorkflowGuide steps={workflow} />}

      <DashboardStatsGrid
        stats={stats.data}
        isLoading={stats.isLoading}
        isError={stats.isError}
        error={stats.error}
        onRetry={() => stats.refetch()}
      />

      {workflow.length === 0 && <QuickActions />}

      {/* Cards for modules this industry is not offered are left out rather than shown empty. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityFeed
          activities={activity.data ?? []}
          isLoading={activity.isLoading}
          isError={activity.isError}
          error={activity.error}
          onRetry={() => activity.refetch()}
        />
        {hasPayments && (
          <RecentPayments
            payments={payments.data?.data ?? []}
            isLoading={payments.isLoading}
            isError={payments.isError}
            error={payments.error}
            onRetry={() => payments.refetch()}
          />
        )}
        {t.has('events') && (
          <UpcomingEvents
            events={upcomingEvents.data ?? []}
            isLoading={upcomingEvents.isLoading}
            isError={upcomingEvents.isError}
            error={upcomingEvents.error}
            onRetry={() => upcomingEvents.refetch()}
          />
        )}
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
        {t.has('hospitality') && (
          <HospitalityOverview
            bookings={hospitality.data ?? []}
            isLoading={hospitality.isLoading}
            isError={hospitality.isError}
            error={hospitality.error}
            onRetry={() => hospitality.refetch()}
          />
        )}
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
