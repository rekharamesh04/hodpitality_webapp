'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { cn, getRelativeTime, getFriendlyErrorMessage } from '@/lib/utils';
import {
  useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteAllNotifications,
} from '@/hooks/use-notifications';
import type { Notification } from '@/types';

const TYPE_STYLES: Record<Notification['type'], { icon: typeof Bell; className: string }> = {
  info:    { icon: Info,          className: 'bg-info/10 text-info' },
  success: { icon: CheckCircle2,  className: 'bg-success/10 text-success' },
  warning: { icon: AlertTriangle, className: 'bg-warning/10 text-warning' },
  error:   { icon: XCircle,       className: 'bg-destructive/10 text-destructive' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useNotifications({ limit: 50 });
  const markRead    = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteAll   = useDeleteAllNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const notifications = useMemo(
    () => [...(data ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [data]
  );
  const unread = notifications.filter((n) => !n.read).length;
  const visible = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  function openNotification(n: Notification) {
    if (!n.read) markRead.mutate(n.id);
    if (n.actionUrl?.startsWith('/')) router.push(n.actionUrl);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with system alerts and activities</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={unread === 0}
            loading={markAllRead.isPending}
          >
            {!markAllRead.isPending && <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />}
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmClear(true)}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Clear all
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{isLoading ? '—' : notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Unread</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{isLoading ? '—' : unread}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Recent system notifications and alerts</CardDescription>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread{unread > 0 ? ` (${unread})` : ''}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load notifications"
              message={getFriendlyErrorMessage(error)}
              onRetry={() => refetch()}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              description={filter === 'unread' ? "You're all caught up." : 'New alerts and activity will appear here.'}
            />
          ) : (
            <ul className="space-y-3">
              {visible.map((n) => {
                const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.info;
                const Icon = style.icon;
                return (
                  <li
                    key={n.id}
                    className={cn(
                      'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                      !n.read ? 'border-primary/40 bg-primary/5' : 'hover:bg-accent',
                      n.actionUrl && 'cursor-pointer'
                    )}
                    onClick={() => n.actionUrl && openNotification(n)}
                  >
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', style.className)}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium leading-snug">{n.title}</p>
                      {n.message && <p className="text-sm text-muted-foreground">{n.message}</p>}
                      <p className="text-xs text-muted-foreground">
                        {n.createdAt ? getRelativeTime(n.createdAt) : '—'}
                      </p>
                    </div>
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={(e) => { e.stopPropagation(); markRead.mutate(n.id); }}
                        disabled={markRead.isPending && markRead.variables === n.id}
                      >
                        <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        Mark read
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Clear all notifications?"
        description="This permanently removes every notification from your inbox. This action cannot be undone."
        confirmLabel="Clear all"
        confirmingLabel="Clearing…"
        destructive
        isConfirming={deleteAll.isPending}
        onConfirm={() => deleteAll.mutate(undefined, { onSuccess: () => setConfirmClear(false) })}
      />
    </div>
  );
}
