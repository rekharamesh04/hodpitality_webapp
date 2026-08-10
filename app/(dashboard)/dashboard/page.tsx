'use client';

import { Users, UserCheck, Clock, Hotel, Building2, Calendar } from 'lucide-react';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { VenueOccupancy } from '@/components/dashboard/VenueOccupancy';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import {
  mockDashboardStats,
  mockActivityFeed,
  mockEvents,
  mockVenues,
  mockCheckInTrends,
  mockGuestCategories,
} from '@/constants/mock-data';

export default function DashboardPage() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Check-ins"
          value={stats.todayCheckIns}
          icon={UserCheck}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Guests"
          value={stats.totalGuests}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Guests"
          value={stats.pendingGuests}
          icon={Clock}
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="Hospitality Bookings"
          value={stats.hospitalityBookings}
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
          data={mockCheckInTrends}
          dataKey="value"
          xAxisKey="name"
        />
        <PieChartComponent
          title="Guest Categories"
          description="Distribution of guest types"
          data={mockGuestCategories}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed activities={mockActivityFeed} />
        <div className="space-y-6">
          <UpcomingEvents events={mockEvents} />
          <VenueOccupancy venues={mockVenues.slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
