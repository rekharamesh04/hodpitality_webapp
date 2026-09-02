'use client';

import { useMemo } from 'react';
import {
  RefreshCw, Download, UserCheck, DoorOpen, Clock, Hotel, Percent, Users, CalendarDays, ShieldCheck, History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StatsCardSkeleton } from '@/components/common/SkeletonLoader';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { useDashboardStats, useRevenueTrendChart } from '@/hooks/useReports';
import { exportToCSV, getFriendlyErrorMessage } from '@/lib/utils';
import type { DashboardStats } from '@/types';

const METRIC_LABELS: Record<keyof DashboardStats, string> = {
  todayCheckIns: "Today's Check-ins",
  guestsArrived: 'Guests Arrived',
  pendingGuests: 'Pending Guests',
  hospitalityBookings: 'Hospitality Bookings',
  venueOccupancy: 'Venue Occupancy',
  totalGuests: 'Total Guests',
  totalEvents: 'Total Events',
  activeStaff: 'Active Staff',
};

// Venue Occupancy is a percentage, not a count — charting it alongside raw counts on the same
// axis would be misleading, so it's excluded from the comparison chart and shown as its own stat.
const CHART_METRIC_KEYS: (keyof DashboardStats)[] = [
  'todayCheckIns', 'guestsArrived', 'pendingGuests', 'hospitalityBookings', 'totalGuests', 'totalEvents', 'activeStaff',
];

export default function ReportsPage() {
  const { data: stats, isLoading, isError, error, refetch, isFetching } = useDashboardStats();

  const chartData = useMemo(
    () => CHART_METRIC_KEYS.map((key) => ({ name: METRIC_LABELS[key], value: stats?.[key] ?? 0 })),
    [stats]
  );

  const tableRows = useMemo(
    () => (Object.keys(METRIC_LABELS) as (keyof DashboardStats)[]).map((key) => ({
      key,
      label: METRIC_LABELS[key],
      value: stats?.[key],
      display: stats?.[key] == null ? '—' : key === 'venueOccupancy' ? `${stats[key]}%` : String(stats[key]),
    })),
    [stats]
  );

  function handleExport() {
    if (!stats) return;
    exportToCSV(
      tableRows.map((r) => ({ Metric: r.label, Value: r.display })),
      `dashboard-report-${new Date().toISOString().slice(0, 10)}`
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Reports</h1>
          <p className="text-muted-foreground">Operational performance and business insights.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExport} disabled={!stats}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Unable to load reporting data"
          message={getFriendlyErrorMessage(error, 'We ran into a problem generating this report. Please try again.')}
          onRetry={() => refetch()}
        />
      ) : !isLoading && !stats ? (
        <EmptyState
          icon={History}
          title="No report data available"
          description="There is currently not enough data to generate this report."
        />
      ) : (
        <>
          {/* Overview */}
          <section aria-labelledby="reports-overview-heading">
            <h2 id="reports-overview-heading" className="sr-only">Overview</h2>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatsCard title="Today's Check-ins" value={stats!.todayCheckIns} icon={UserCheck} />
                <StatsCard title="Total Guests" value={stats!.totalGuests} icon={Users} />
                <StatsCard title="Total Events" value={stats!.totalEvents} icon={CalendarDays} />
                <StatsCard title="Venue Occupancy" value={`${stats!.venueOccupancy}%`} icon={Percent} />
              </div>
            )}
          </section>

          {/* Performance overview */}
          <section aria-labelledby="reports-performance-heading" className="grid gap-6 lg:grid-cols-3">
            <h2 id="reports-performance-heading" className="sr-only">Performance Overview</h2>
            <div className="lg:col-span-2">
              {isLoading ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Current operational counts by category</CardDescription>
                  </CardHeader>
                  <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
                </Card>
              ) : (
                <BarChartComponent
                  title="Performance Overview"
                  description="Current operational counts by category"
                  data={chartData}
                  dataKey="value"
                  xAxisKey="name"
                />
              )}
            </div>
            <div className="lg:col-span-1">
              <RevenueTrendWidget />
            </div>
          </section>

          {/* Detailed report */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Report</CardTitle>
              <CardDescription>All metrics returned by the reporting API</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableRows.map((row) => (
                        <TableRow key={row.key}>
                          <TableCell className="flex items-center gap-2 text-sm font-medium">
                            <MetricIcon metricKey={row.key} />
                            {row.label}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{row.display}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

const METRIC_ICONS: Record<keyof DashboardStats, React.ComponentType<{ className?: string }>> = {
  todayCheckIns: UserCheck,
  guestsArrived: DoorOpen,
  pendingGuests: Clock,
  hospitalityBookings: Hotel,
  venueOccupancy: Percent,
  totalGuests: Users,
  totalEvents: CalendarDays,
  activeStaff: ShieldCheck,
};

function MetricIcon({ metricKey }: { metricKey: keyof DashboardStats }) {
  const Icon = METRIC_ICONS[metricKey];
  return <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
}

function RevenueTrendWidget() {
  const { data, isLoading, isError, error, refetch } = useRevenueTrendChart();
  const normalizedData = useMemo(() => {
    return (data ?? []).map((d: any) => ({
      date: d.date ?? d.label ?? '',
      revenue: Number(d.revenue ?? d.value ?? d.amount ?? 0),
    }));
  }, [data]);

  if (isLoading) return <Skeleton className="h-[300px] w-full" />;
  if (isError) {
    return <ErrorState title="Revenue data error" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />;
  }
  return (
    <AreaChartComponent
      title="Revenue Trend"
      description="Last 30 days paid revenue (GET /reports/revenue-trend)"
      data={normalizedData}
      dataKey="revenue"
      xAxisKey="date"
      height={300}
    />
  );
}
