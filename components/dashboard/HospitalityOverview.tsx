'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Hotel, MapPin } from 'lucide-react';
import { formatDate, getFriendlyErrorMessage } from '@/lib/utils';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import type { Hospitality } from '@/types';
import Link from 'next/link';

interface HospitalityOverviewProps {
  bookings: Hospitality[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

function HospitalitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HospitalityOverview({ bookings, isLoading, isError, error, onRetry }: HospitalityOverviewProps) {
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const recent = [...safeBookings]
    .sort((a, b) => new Date(b.bookingDate ?? b.serviceDate ?? 0).getTime() - new Date(a.bookingDate ?? a.serviceDate ?? 0).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Hospitality / Concierge</CardTitle>
        <Link href="/hospitality">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <HospitalitySkeleton />
        ) : isError ? (
          <ErrorState
            title="Unable to load hospitality bookings"
            message={getFriendlyErrorMessage(error)}
            onRetry={onRetry}
          />
        ) : recent.length === 0 ? (
          <EmptyState icon={Hotel} title="No hospitality requests" description="Hotel, transport and other bookings will appear here." />
        ) : (
          <div className="space-y-3">
            {recent.map((booking) => (
              <div key={booking.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Hotel className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-none">{booking.guestName || 'Guest'}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{booking.type}</span>
                    {booking.venue && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {booking.venue}
                      </span>
                    )}
                    <span>{formatDate(booking.serviceDate ?? booking.scheduledAt)}</span>
                  </div>
                </div>
                <StatusBadge status={booking.status} className="shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
