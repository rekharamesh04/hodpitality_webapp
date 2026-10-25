'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DevIndustrySwitcher } from '@/components/common/DevIndustrySwitcher';
import { PlatformScopeSwitcher } from '@/components/layout/PlatformScopeSwitcher';
import { BrandMark } from '@/components/layout/AppSidebar';
import { UserMenu } from '@/components/layout/UserMenu';
import { WorkflowContext } from '@/components/workflow/WorkflowTrail';
import { useUIStore } from '@/store';
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-notifications';
import { cn, getRelativeTime } from '@/lib/utils';

const iconButton = 'relative h-9 w-9 text-muted-foreground hover:text-foreground';

function NotificationsMenu() {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const all = notifications ?? [];
  const unreadCount = all.filter((n) => !n.read).length;
  const recent = [...all]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={iconButton}
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-background"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(22rem,calc(100vw-2rem))]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[320px] overflow-y-auto">
          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
              <Bell className="h-6 w-6 text-muted-foreground/60" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
            </div>
          ) : (
            <div className="space-y-1 p-1.5">
              {recent.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className={cn('cursor-pointer flex-col items-start gap-0.5 rounded-md p-3', !n.read && 'bg-primary/5')}
                  onClick={() => {
                    if (!n.read) markRead.mutate(n.id);
                    if (n.actionUrl?.startsWith('/')) router.push(n.actionUrl);
                  }}
                >
                  <div className="flex w-full items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    <p className="flex-1 text-sm font-medium leading-snug">{n.title}</p>
                  </div>
                  {n.message && <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>}
                  {n.createdAt && <p className="text-xs text-muted-foreground">{getRelativeTime(n.createdAt)}</p>}
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center font-medium text-primary" onClick={() => router.push('/notifications')}>
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The bar above the page. Navigation lives in the sidebar; this carries where
 * the page sits in the workflow (with the next step one click away), the
 * notifications and the account menu. On phones, where the sidebar is a
 * drawer, it also holds the menu button, the logo and search.
 */
export function AppHeader() {
  // The "mobile sidebar" store flag drives the phone navigation drawer.
  const { openCommandPalette, toggleMobileSidebar } = useUIStore();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" className={cn(iconButton, '-ml-1.5 lg:hidden')} onClick={toggleMobileSidebar} aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
        <BrandMark className="mr-2 lg:hidden" />

        <WorkflowContext variant="inline" className="hidden md:flex" />

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* Renders nothing unless the local demo bypass is on. */}
          <DevIndustrySwitcher />
          <Button variant="ghost" size="icon" className={cn(iconButton, 'lg:hidden')} onClick={openCommandPalette} aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </Button>
          <NotificationsMenu />
          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </div>
      {/* Phones: the step and the next one, on a row of their own. */}
      <WorkflowContext variant="row" className="md:hidden" />
      {/* Super admin and reseller only: which organisations every page shows. */}
      <PlatformScopeSwitcher />
    </header>
  );
}
