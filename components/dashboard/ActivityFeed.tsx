'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { getRelativeTime, getFriendlyErrorMessage } from '@/lib/utils';
import { CheckCircle2, UserPlus, Hotel, Calendar, AlertCircle, Activity as ActivityIcon } from 'lucide-react';
import type { ActivityFeedItem } from '@/types';

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

const iconMap: Record<string, typeof CheckCircle2> = {
  check_in: CheckCircle2,
  registration: UserPlus,
  hospitality: Hotel,
  event: Calendar,
  system: AlertCircle,
};

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed({ activities, isLoading, isError, error, onRetry }: ActivityFeedProps) {
  const safeActivities = Array.isArray(activities) ? activities : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ActivitySkeleton />
        ) : isError ? (
          <ErrorState
            title="Unable to load recent activity"
            message={getFriendlyErrorMessage(error)}
            onRetry={onRetry}
          />
        ) : safeActivities.length === 0 ? (
          <EmptyState icon={ActivityIcon} title="No recent activity" description="Activity will appear here as it happens." />
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {safeActivities.map((activity) => {
                const Icon = iconMap[activity.type] ?? AlertCircle;
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.timestamp ? getRelativeTime(activity.timestamp) : '—'}</span>
                        {activity.user && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>by {activity.user}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
