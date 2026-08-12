'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { useChartData, useRevenueTrendChart, useGuestArrivalsChart, useMonthlyEventsChart } from '@/hooks/useReports';
import { useDashboardStats } from '@/hooks/useReports';

export default function AnalyticsPage() {
  const { data: stats }            = useDashboardStats();
  const { data: checkInTrends }    = useChartData('checkins');
  const { data: venueUtilization } = useChartData('venue-utilization');
  const { data: guestCategories }  = useGuestArrivalsChart();
  const { data: revenueTrend }     = useRevenueTrendChart();
  const { data: monthlyEvents }    = useMonthlyEventsChart();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Insights and trends across your hospitality operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGuests ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today Check-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayCheckIns ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents ?? '—'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeStaff ?? '—'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LineChartComponent
          title="Check-in Trends"
          description="Daily check-ins for the past week"
          data={checkInTrends ?? []}
          dataKey="value"
          xAxisKey="label"
        />
        <BarChartComponent
          title="Venue Utilization"
          description="Current occupancy by venue"
          data={venueUtilization ?? []}
          dataKey="value"
          xAxisKey="label"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PieChartComponent
          title="Guest Arrivals"
          description="Arrival flow breakdown"
          data={guestCategories ?? []}
        />
        <AreaChartComponent
          title="Revenue Trend"
          description="Revenue trend over time"
          data={revenueTrend ?? []}
          dataKey="value"
          xAxisKey="label"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Events</CardTitle>
          <CardDescription>Event attendance trends by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(monthlyEvents ?? []).map((stat) => (
              <div key={stat.label} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{stat.label}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
