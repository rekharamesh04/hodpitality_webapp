'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, Hotel } from 'lucide-react';
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
import api from '@/lib/axios';
import type { DashboardStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockDashboardStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/reports/dashboard-stats')
      .then((res) => {
        console.log('[Dashboard] dashboard-stats:', res.data);
        setStats(res.data);
      })
      .catch((err) => {
        console.error('[Dashboard] Failed to fetch stats, using mock data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Check-ins"
          value={loading ? '…' : stats.todayCheckIns}
          icon={UserCheck}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Guests"
          value={loading ? '…' : stats.totalGuests}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Guests"
          value={loading ? '…' : stats.pendingGuests}
          icon={Clock}
          trend={{ value: -5, isPositive: false }}
        />
        <StatsCard
          title="Hospitality Bookings"
          value={loading ? '…' : stats.hospitalityBookings}
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
