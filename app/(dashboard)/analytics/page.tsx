'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import {
  mockCheckInTrends,
  mockGuestCategories,
  mockVenueUtilization,
  mockMonthlyStats,
} from '@/constants/mock-data';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Insights and trends across your hospitality operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$487K</div>
            <p className="text-xs text-success">+18.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-success">+5.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Guest Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-success">+0.3 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Events Held</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LineChartComponent
          title="Check-in Trends"
          description="Daily check-ins for the past week"
          data={mockCheckInTrends}
          dataKey="value"
          xAxisKey="name"
        />
        <BarChartComponent
          title="Venue Utilization"
          description="Current occupancy by venue"
          data={mockVenueUtilization}
          dataKey="value"
          xAxisKey="name"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PieChartComponent
          title="Guest Categories"
          description="Distribution of guest types"
          data={mockGuestCategories}
        />
        <AreaChartComponent
          title="Monthly Revenue"
          description="Revenue trend over 6 months"
          data={mockMonthlyStats}
          dataKey="revenue"
          xAxisKey="name"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Guests, events, and revenue by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMonthlyStats.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{stat.name} 2024</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.guests} guests • {stat.events} events
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(stat.revenue / 1000).toFixed(0)}K</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
