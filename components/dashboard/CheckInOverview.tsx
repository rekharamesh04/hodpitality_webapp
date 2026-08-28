'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, UserCheck, QrCode, ScanFace, MapPin, Calendar } from 'lucide-react';
import { getRelativeTime, getFriendlyErrorMessage } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import type { CheckIn, CheckInStats } from '@/types';
import Link from 'next/link';

interface CheckInOverviewProps {
  checkIns: CheckIn[];
  stats?: CheckInStats;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

const METHOD_ICON: Record<string, typeof UserCheck> = {
  qr: QrCode,
  qr_scan: QrCode,
  facial_recognition: ScanFace,
  manual: UserCheck,
  quick: UserCheck,
};

function CheckInSkeleton() {
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

export function CheckInOverview({ checkIns, stats, isLoading, isError, error, onRetry }: CheckInOverviewProps) {
  const safeCheckIns = Array.isArray(checkIns) ? checkIns : [];
  const recent = [...safeCheckIns]
    .sort((a, b) => {
      const at = new Date(a.timestamp ?? a.checkInTime ?? 0).getTime();
      const bt = new Date(b.timestamp ?? b.checkInTime ?? 0).getTime();
      return bt - at;
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Check-in Overview</CardTitle>
        <Link href="/check-ins">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && !isLoading && !isError && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border p-2">
              <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{stats.arrived ?? 0}</p>
              <p className="text-xs text-muted-foreground">Arrived</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">{stats.onSite ?? 0}</p>
              <p className="text-xs text-muted-foreground">On Site</p>
            </div>
            <div className="rounded-lg border p-2">
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{stats.completed ?? 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <CheckInSkeleton />
        ) : isError ? (
          <ErrorState
            title="Unable to load check-ins"
            message={getFriendlyErrorMessage(error)}
            onRetry={onRetry}
          />
        ) : recent.length === 0 ? (
          <EmptyState icon={UserCheck} title="No recent check-ins" description="Guest check-ins will show up here as they happen." />
        ) : (
          <div className="space-y-3">
            {recent.map((ci) => {
              const ciId = ci.id ?? ci.PK?.replace('CHECKIN#', '') ?? Math.random().toString(36);
              const method = (ci.method ?? ci.checkInMethod ?? 'manual').toString().toLowerCase();
              const Icon = METHOD_ICON[method] ?? UserCheck;
              const ts = ci.timestamp ?? ci.checkInTime;
              return (
                <div key={ciId} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-none">{ci.guestName || ci.guestId || 'Guest'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="capitalize">{method.replace(/_/g, ' ')}</span>
                      {ci.venue && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {ci.venue}
                        </span>
                      )}
                      {ci.event && (
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {ci.event}
                        </span>
                      )}
                      <span>{ts ? getRelativeTime(ts) : '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
