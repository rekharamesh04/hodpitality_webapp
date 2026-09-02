'use client';

import { useMemo } from 'react';
import {
  RefreshCw, Users, Contact, ClipboardList, CheckCircle2, History, Info, TrendingUp, MapPin, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatsCardSkeleton } from '@/components/common/SkeletonLoader';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import {
  useDashboardStats, useDashboardActivity,
  useDailyReports, useGuestArrivalsChart, useRevenueTrendChart, useMonthlyEventsChart,
} from '@/hooks/useReports';
import { useCheckIns, useCheckInStats } from '@/hooks/useCheckins';
import { useAppointments } from '@/hooks/useAppointments';
import { useEvents } from '@/hooks/useEvents';
import { useVenues } from '@/hooks/useVenues';
import { useStaff } from '@/hooks/useStaff';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuthStore } from '@/store';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { AnalyticsDistribution, VenueUtilization } from '@/types/analytics';

function distributionOf<T>(items: T[], keyFn: (item: T) => string | undefined | null): AnalyticsDistribution[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function titleCase(s: string): string {
  return s.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Different check-in entry points populate `checkInMethod`/`method` with inconsistent casing
 * and vocabulary for the same real method (e.g. "Manual" vs "manual", "QR" vs "qr_scan",
 * "facial" vs "facial_recognition") — normalize so the distribution groups by actual method,
 * not by which field/casing happened to be written. */
function normalizeCheckInMethod(raw: string): string {
  const key = raw.toLowerCase().replace(/[_\s-]/g, '');
  if (key.includes('qr')) return 'QR';
  if (key.includes('facial') || key.includes('face')) return 'Facial Recognition';
  if (key.includes('manual')) return 'Manual';
  if (key.includes('self')) return 'Self';
  return titleCase(raw);
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const canView = user?.role === 'super_admin' || user?.role === 'reseller_admin';

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
          <p className="text-muted-foreground">Understand operational performance and activity across your organisation.</p>
        </div>
        <ErrorState
          title="Access denied"
          message="Analytics is restricted to super admins and reseller admins. Contact your platform administrator if you believe this is a mistake."
        />
      </div>
    );
  }

  return <AnalyticsPageInner />;
}

function AnalyticsPageInner() {
  const stats = useDashboardStats();
  const activity = useDashboardActivity();
  const checkInStats = useCheckInStats();
  const checkIns = useCheckIns();
  const appointments = useAppointments({});
  const events = useEvents({});
  const venues = useVenues({});
  const staff = useStaff({});
  // limit:1 — only the paginated envelope's real `total` count is needed here, not the records.
  const customers = useCustomers({ limit: 1 });

  // Live time-series endpoints (now active on backend)
  const dailyReports = useDailyReports(30);
  const guestArrivals = useGuestArrivalsChart();
  const revenueTrend = useRevenueTrendChart();
  const monthlyEvents = useMonthlyEventsChart();

  const isRefreshing = [
    stats, activity, checkInStats, checkIns, appointments, events, venues, staff, customers,
    dailyReports, guestArrivals, revenueTrend, monthlyEvents,
  ].some((q) => q.isFetching);

  function refreshAll() {
    stats.refetch(); activity.refetch(); checkInStats.refetch(); checkIns.refetch();
    appointments.refetch(); events.refetch(); venues.refetch(); staff.refetch(); customers.refetch();
    dailyReports.refetch(); guestArrivals.refetch(); revenueTrend.refetch(); monthlyEvents.refetch();
  }

  const appointmentStatusData = useMemo(
    () => distributionOf(appointments.data ?? [], (a) => a.status).map((d) => ({ ...d, name: titleCase(d.name) })),
    [appointments.data]
  );
  const checkInMethodData = useMemo(
    () => distributionOf(checkIns.data ?? [], (c) => {
      const raw = c.checkInMethod ?? c.method;
      return raw ? normalizeCheckInMethod(raw) : undefined;
    }),
    [checkIns.data]
  );
  const eventStatusData = useMemo(
    () => distributionOf(events.data ?? [], (e) => e.status).map((d) => ({ ...d, name: titleCase(d.name) })),
    [events.data]
  );
  const eventCategoryData = useMemo(
    () => distributionOf(events.data ?? [], (e) => e.category),
    [events.data]
  );
  const staffDepartmentData = useMemo(
    () => distributionOf(staff.data ?? [], (s) => s.department),
    [staff.data]
  );

  const dailyBookingsData = useMemo(() => {
    return (dailyReports.data ?? []).map((d: any) => ({
      date: d.date ?? d.label ?? '',
      count: Number(d.count ?? d.appointments ?? d.value ?? 0),
    }));
  }, [dailyReports.data]);

  const revenueTrendData = useMemo(() => {
    return (revenueTrend.data ?? []).map((d: any) => ({
      date: d.date ?? d.label ?? '',
      revenue: Number(d.revenue ?? d.value ?? d.amount ?? 0),
    }));
  }, [revenueTrend.data]);

  const guestArrivalsData = useMemo(() => {
    return (guestArrivals.data ?? []).map((d: any) => ({
      hour: d.hour ?? d.time ?? d.label ?? '',
      arrivals: Number(d.arrivals ?? d.count ?? d.value ?? 0),
    }));
  }, [guestArrivals.data]);

  const monthlyEventsData = useMemo(() => {
    return (monthlyEvents.data ?? []).map((d: any) => ({
      month: d.month ?? d.date ?? d.label ?? '',
      count: Number(d.count ?? d.events ?? d.value ?? 0),
    }));
  }, [monthlyEvents.data]);

  const venueUtilization: VenueUtilization[] = useMemo(() => {
    return (venues.data ?? [])
      .map((v): VenueUtilization => {
        const occupancy = v.occupancy ?? v.currentOccupancy ?? null;
        const utilizationPct = v.capacity > 0 && occupancy != null ? Math.round((occupancy / v.capacity) * 100) : null;
        return { id: v.id ?? v.PK ?? v.name ?? '', name: v.name || 'Unnamed venue', capacity: v.capacity, occupancy, utilizationPct };
      })
      .sort((a, b) => (b.utilizationPct ?? -1) - (a.utilizationPct ?? -1));
  }, [venues.data]);

  const topVenue = venueUtilization.find((v) => v.utilizationPct != null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
          <p className="text-muted-foreground">Multi-tenant operational performance and activity for your organization.</p>
        </div>
        <Button size="sm" variant="outline" onClick={refreshAll} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* KPIs */}
      <section aria-labelledby="analytics-kpi-heading" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <h2 id="analytics-kpi-heading" className="sr-only">Key Performance Indicators</h2>
        {stats.isLoading ? <StatsCardSkeleton /> : (
          <StatsCard title="Total Guests" value={stats.data?.totalGuests ?? '—'} icon={Users} />
        )}
        {customers.isLoading ? <StatsCardSkeleton /> : (
          <StatsCard title="Customers" value={customers.isError ? '—' : customers.data?.total ?? '—'} icon={Contact} />
        )}
        {appointments.isLoading ? <StatsCardSkeleton /> : (
          <StatsCard title="Appointments" value={appointments.isError ? '—' : (appointments.data?.length ?? '—')} icon={ClipboardList} />
        )}
        {checkIns.isLoading ? <StatsCardSkeleton /> : (
          <StatsCard
            title="Check-ins"
            value={checkIns.isError ? '—' : (checkIns.data?.length ?? '—')}
            icon={CheckCircle2}
          />
        )}
      </section>

      {/* Time-Series Trends — live endpoints */}
      <section aria-labelledby="analytics-trends-heading" className="space-y-6">
        <h2 id="analytics-trends-heading" className="text-lg font-semibold">Trends &amp; Revenue</h2>

        {/* Row 1: Daily bookings (bar) + Revenue trend (area) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Daily Bookings (Last 30 Days)"
            description="Booking count per day — GET /reports/daily"
            isLoading={dailyReports.isLoading}
            isError={dailyReports.isError}
            error={dailyReports.error}
            onRetry={() => dailyReports.refetch()}
            empty={dailyBookingsData.length === 0}
          >
            <BarChartComponent
              title=""
              data={dailyBookingsData}
              dataKey="count"
              xAxisKey="date"
              height={260}
            />
          </ChartCard>

          <ChartCard
            title="Revenue Trend (Last 30 Days)"
            description="Daily paid revenue — GET /reports/revenue-trend"
            isLoading={revenueTrend.isLoading}
            isError={revenueTrend.isError}
            error={revenueTrend.error}
            onRetry={() => revenueTrend.refetch()}
            empty={revenueTrendData.length === 0}
          >
            <AreaChartComponent
              title=""
              data={revenueTrendData}
              dataKey="revenue"
              xAxisKey="date"
              height={260}
            />
          </ChartCard>
        </div>

        {/* Row 2: Guest arrivals by hour (line) + Monthly events (bar) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Guest Arrivals Time-of-Day"
            description="Peak walk-in traffic by hour — GET /reports/guest-arrivals"
            isLoading={guestArrivals.isLoading}
            isError={guestArrivals.isError}
            error={guestArrivals.error}
            onRetry={() => guestArrivals.refetch()}
            empty={guestArrivalsData.length === 0}
          >
            <LineChartComponent
              title=""
              data={guestArrivalsData}
              dataKey="arrivals"
              xAxisKey="hour"
              height={260}
            />
          </ChartCard>

          <ChartCard
            title="Monthly Events (Last 12 Months)"
            description="Event count per month — GET /reports/monthly-events"
            isLoading={monthlyEvents.isLoading}
            isError={monthlyEvents.isError}
            error={monthlyEvents.error}
            onRetry={() => monthlyEvents.refetch()}
            empty={monthlyEventsData.length === 0}
          >
            <BarChartComponent
              title=""
              data={monthlyEventsData}
              dataKey="count"
              xAxisKey="month"
              height={260}
            />
          </ChartCard>
        </div>
      </section>

      {/* Appointments & Check-ins */}
      <section aria-labelledby="analytics-appts-heading" className="space-y-6">
        <h2 id="analytics-appts-heading" className="text-lg font-semibold">Appointments &amp; Check-ins</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <DistributionCard
            title="Appointment Status"
            description="Current appointments grouped by status"
            query={appointments}
            data={appointmentStatusData}
            chart="bar"
          />
          <ChartCard title="Check-in Method" description="How guests have been checked in" isLoading={checkIns.isLoading} isError={checkIns.isError} error={checkIns.error} onRetry={() => checkIns.refetch()} empty={checkInMethodData.length === 0}>
            {checkInMethodData.length <= 5 ? (
              <PieChartComponent title="" data={checkInMethodData} height={260} />
            ) : (
              <BarChartComponent title="" data={checkInMethodData} dataKey="value" xAxisKey="name" height={260} />
            )}
          </ChartCard>
        </div>
        <ChartCard
          title="Check-in Funnel"
          description="Expected vs. actual check-in outcomes (GET /check-ins/stats)"
          isLoading={checkInStats.isLoading}
          isError={checkInStats.isError}
          error={checkInStats.error}
          onRetry={() => checkInStats.refetch()}
          empty={!checkInStats.data}
        >
          {checkInStats.data && (
            <BarChartComponent
              title=""
              data={[
                { name: 'Expected', value: checkInStats.data.expected },
                { name: 'Arrived', value: checkInStats.data.arrived },
                { name: 'On Site', value: checkInStats.data.onSite },
                { name: 'Completed', value: checkInStats.data.completed },
                { name: 'No-shows', value: checkInStats.data.noShows },
                { name: 'Cancelled', value: checkInStats.data.cancelled },
              ]}
              dataKey="value"
              xAxisKey="name"
              height={260}
            />
          )}
        </ChartCard>
      </section>

      {/* Events & Guests */}
      <section aria-labelledby="analytics-events-heading" className="space-y-6">
        <h2 id="analytics-events-heading" className="text-lg font-semibold">Events &amp; Guests</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Events by Status" description="Current events grouped by status" isLoading={events.isLoading} isError={events.isError} error={events.error} onRetry={() => events.refetch()} empty={eventStatusData.length === 0}>
            {/* Too many distinct statuses make a donut unreadable — fall back to a bar chart. */}
            {eventStatusData.length <= 5 ? (
              <PieChartComponent title="" data={eventStatusData} height={260} />
            ) : (
              <BarChartComponent title="" data={eventStatusData} dataKey="value" xAxisKey="name" height={260} />
            )}
          </ChartCard>
          {eventCategoryData.length > 0 ? (
            <ChartCard title="Events by Category" description="Current events grouped by category" isLoading={events.isLoading} isError={events.isError} error={events.error} onRetry={() => events.refetch()} empty={false}>
              <BarChartComponent title="" data={eventCategoryData} dataKey="value" xAxisKey="name" height={260} />
            </ChartCard>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Events by Category</CardTitle>
                <CardDescription>Current events grouped by category</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState icon={Info} title="No category data" description="No events currently have a category assigned." />
              </CardContent>
            </Card>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Guest Activity</CardTitle>
            <CardDescription>Current guest status snapshot (GET /reports/dashboard-stats)</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : stats.isError ? (
              <ErrorState title="Unable to load guest activity" message={getFriendlyErrorMessage(stats.error)} onRetry={() => stats.refetch()} />
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <GuestStat label="Total Guests" value={stats.data?.totalGuests} />
                <GuestStat label="Arrived" value={stats.data?.guestsArrived} />
                <GuestStat label="Pending" value={stats.data?.pendingGuests} />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Venue utilization */}
      <section aria-labelledby="analytics-venue-heading" className="space-y-4">
        <h2 id="analytics-venue-heading" className="text-lg font-semibold">Venue Utilization</h2>
        <Card>
          <CardHeader>
            <CardTitle>Utilization by Venue</CardTitle>
            <CardDescription>Current occupancy ÷ capacity, per venue</CardDescription>
          </CardHeader>
          <CardContent>
            {venues.isLoading ? (
              <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : venues.isError ? (
              <ErrorState title="Unable to load venue data" message={getFriendlyErrorMessage(venues.error)} onRetry={() => venues.refetch()} />
            ) : venueUtilization.length === 0 ? (
              <EmptyState icon={MapPin} title="No venues yet" description="Venue utilization will appear here once venues are added." />
            ) : (
              <div className="space-y-4">
                {venueUtilization.slice(0, 10).map((v) => (
                  <div key={v.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{v.name}</span>
                      <span className="text-muted-foreground" aria-hidden="true">
                        {v.utilizationPct != null ? `${v.occupancy} / ${v.capacity}` : 'N/A'}
                      </span>
                    </div>
                    <Progress
                      value={v.utilizationPct ?? 0}
                      aria-label={`${v.name} utilization`}
                      aria-valuetext={v.utilizationPct != null ? `${v.utilizationPct}% occupied` : 'Utilization not available'}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {v.utilizationPct != null ? `${v.utilizationPct}% occupied` : 'Capacity not set — utilization unavailable'}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {topVenue && (
              <p className="mt-6 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <TrendingUp className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span><span className="font-medium">{topVenue.name}</span> currently has the highest occupancy at {topVenue.utilizationPct}%.</span>
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Staff overview */}
      <section aria-labelledby="analytics-staff-heading" className="space-y-4">
        <h2 id="analytics-staff-heading" className="text-lg font-semibold">Staff Overview</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                <p className="text-3xl font-bold">{stats.isLoading ? '—' : stats.data?.activeStaff ?? '—'}</p>
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2">
            <ChartCard title="Staff by Department" description="Current staff grouped by department" isLoading={staff.isLoading} isError={staff.isError} error={staff.error} onRetry={() => staff.refetch()} empty={staffDepartmentData.length === 0}>
              <BarChartComponent title="" data={staffDepartmentData} dataKey="value" xAxisKey="name" height={220} />
            </ChartCard>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section aria-labelledby="analytics-activity-heading">
        <h2 id="analytics-activity-heading" className="sr-only">Recent Activity</h2>
        <ActivityFeed
          activities={activity.data ?? []}
          isLoading={activity.isLoading}
          isError={activity.isError}
          error={activity.error}
          onRetry={() => activity.refetch()}
        />
      </section>
    </div>
  );
}

function GuestStat({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <p className="text-2xl font-bold tabular-nums">{value ?? '—'}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ChartCard({
  title, description, isLoading, isError, error, onRetry, empty, children,
}: {
  title: string;
  description?: string;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : isError ? (
          <ErrorState title="Unable to load this data" message={getFriendlyErrorMessage(error)} onRetry={onRetry} />
        ) : empty ? (
          <EmptyState icon={Info} title="Not enough data" description="Not enough data is available to calculate this metric." />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function DistributionCard({
  title, description, query, data, chart,
}: {
  title: string;
  description?: string;
  query: { isLoading: boolean; isError: boolean; error?: unknown; refetch: () => void };
  data: AnalyticsDistribution[];
  chart: 'bar' | 'pie';
}) {
  return (
    <ChartCard
      title={title}
      description={description}
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      onRetry={() => query.refetch()}
      empty={data.length === 0}
    >
      {chart === 'bar' ? (
        <BarChartComponent title="" data={data} dataKey="value" xAxisKey="name" height={260} />
      ) : (
        <PieChartComponent title="" data={data} height={260} />
      )}
    </ChartCard>
  );
}
