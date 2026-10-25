'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHECKIN_METHOD_LABELS } from '@/constants';
import { buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, UserCheck, QrCode, ScanFace, MapPin, Calendar } from 'lucide-react';
import { cn, getInitials, getRelativeTime, getFriendlyErrorMessage } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import type { CheckIn, CheckInStats } from '@/types';
import Link from 'next/link';
import { useTerminology } from '@/hooks';

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

/**
 * Who has arrived, newest first — the front desk's live queue, and the first
 * thing on the dashboard. Each name opens the person's record.
 */
export function CheckInOverview({ checkIns, stats, isLoading, isError, error, onRetry }: CheckInOverviewProps) {
  const t = useTerminology();
  const safeCheckIns = Array.isArray(checkIns) ? checkIns : [];
  const recent = [...safeCheckIns]
    .sort((a, b) => {
      const at = new Date(a.timestamp ?? a.checkInTime ?? 0).getTime();
      const bt = new Date(b.timestamp ?? b.checkInTime ?? 0).getTime();
      return bt - at;
    })
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b px-5 py-4">
        <div className="min-w-0">
          <CardTitle>Recent check-ins</CardTitle>
          {stats && !isLoading && !isError && (
            <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
              {stats.arrived ?? 0} arrived · {stats.onSite ?? 0} on site · {stats.completed ?? 0} completed
            </p>
          )}
        </div>
        <Link href="/check-ins" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'shrink-0')}>
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5"><CheckInSkeleton /></div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState
              title="Unable to load check-ins"
              message={getFriendlyErrorMessage(error)}
              onRetry={onRetry}
            />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState icon={UserCheck} title="No check-ins yet today" description={`${t.person.one} check-ins will show up here as they happen.`} />
        ) : (
          <ul className="divide-y">
            {recent.map((ci) => {
              const ciId = ci.id ?? ci.PK?.replace('CHECKIN#', '') ?? Math.random().toString(36);
              const method = (ci.method ?? ci.checkInMethod ?? 'manual').toString().toLowerCase();
              const Icon = METHOD_ICON[method] ?? UserCheck;
              const ts = ci.timestamp ?? ci.checkInTime;
              const name = ci.guestName || ci.guestId || t.person.one;
              return (
                <li key={ciId} className="flex items-center gap-3 px-5 py-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    {ci.guestId ? (
                      <Link href={`/guests/${ci.guestId}`} className="block truncate text-sm font-medium hover:text-primary hover:underline">
                        {name}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-medium">{name}</p>
                    )}
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 capitalize">
                        <Icon className="h-3 w-3" aria-hidden="true" />
                        {CHECKIN_METHOD_LABELS[method] ?? method.replace(/_/g, ' ')}
                      </span>
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
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{ts ? getRelativeTime(ts) : '—'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
