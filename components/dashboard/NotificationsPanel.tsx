'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bell, CheckCheck } from 'lucide-react';
import { getRelativeTime, getFriendlyErrorMessage } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import type { Notification } from '@/types';
import Link from 'next/link';

interface NotificationsPanelProps {
  notifications: Notification[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onMarkAllRead?: () => void;
  isMarkingAllRead?: boolean;
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsPanel({
  notifications,
  isLoading,
  isError,
  error,
  onRetry,
  onMarkAllRead,
  isMarkingAllRead,
}: NotificationsPanelProps) {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const recent = [...safeNotifications]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);
  const unreadCount = safeNotifications.filter((n) => !n.read).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle>Notifications</CardTitle>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && onMarkAllRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllRead} disabled={isMarkingAllRead}>
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Mark all read
            </Button>
          )}
          <Link href="/notifications">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <NotificationsSkeleton />
        ) : isError ? (
          <ErrorState
            title="Unable to load notifications"
            message={getFriendlyErrorMessage(error)}
            onRetry={onRetry}
          />
        ) : recent.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
        ) : (
          <div className="space-y-2">
            {recent.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  !notification.read ? 'border-primary/40 bg-primary/5' : ''
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium leading-none">{notification.title || 'Notification'}</p>
                    {!notification.read && (
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{notification.message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {notification.createdAt ? getRelativeTime(notification.createdAt) : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
