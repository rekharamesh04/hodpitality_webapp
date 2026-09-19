'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell, Moon, Sun, Search, Settings, LogOut, User, Command, Menu, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, useUIStore } from '@/store';
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-notifications';
import { getVisibleNavSections, isNavItemActive, type NavSection } from '@/constants/navigation';
import { cn, getInitials, getRelativeTime } from '@/lib/utils';
import { authService } from '@/services/auth.service';

/** Icon button styled for the dark navigation bar. */
const navIconButton =
  'relative h-9 w-9 text-nav-muted hover:bg-nav-accent hover:text-nav-foreground focus-visible:ring-offset-nav';

export function BrandMark({ className, alwaysShowName }: { className?: string; alwaysShowName?: boolean }) {
  return (
    <Link href="/dashboard" className={cn('flex shrink-0 items-center gap-2.5', className)} aria-label="EntryFlow Admin — Dashboard">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white shadow-[0_4px_12px_-2px_rgb(99_102_241_/_0.6)]">
        E
      </span>
      <span className={cn('text-[15px] font-semibold tracking-tight text-nav-foreground', alwaysShowName ? 'inline' : 'hidden sm:inline')}>
        EntryFlow <span className="font-normal text-nav-muted">Admin</span>
      </span>
    </Link>
  );
}

function NavGroup({ section, pathname, unreadCount }: { section: NavSection; pathname: string; unreadCount: number }) {
  const active = section.items.some((item) => isNavItemActive(pathname, item.href));
  const triggerClass = cn(
    'relative flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors outline-none',
    'focus-visible:ring-2 focus-visible:ring-indigo-400',
    active ? 'bg-nav-active text-nav-foreground' : 'text-nav-muted hover:bg-nav-accent hover:text-nav-foreground'
  );
  // Active-section marker sitting on the bar's bottom edge.
  const indicator = active && (
    <span className="absolute inset-x-3 -bottom-[14px] h-0.5 rounded-full bg-indigo-400" aria-hidden="true" />
  );

  if (section.items.length === 1) {
    const item = section.items[0];
    return (
      <Link href={item.href} className={triggerClass} aria-current={active ? 'page' : undefined}>
        {section.menuLabel}
        {indicator}
      </Link>
    );
  }

  const wide = section.items.length > 3;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={cn(triggerClass, 'data-[state=open]:bg-nav-active data-[state=open]:text-nav-foreground')}>
        {section.menuLabel}
        <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform [[data-state=open]>&]:rotate-180" aria-hidden="true" />
        {indicator}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={14} className={cn('p-2', wide ? 'w-[560px]' : 'w-[320px]')}>
        <DropdownMenuLabel className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {section.label}
        </DropdownMenuLabel>
        <div className={cn('grid gap-1', wide && 'grid-cols-2')}>
          {section.items.map((item) => {
            const Icon = item.icon;
            const itemActive = isNavItemActive(pathname, item.href);
            const badge = item.href === '/notifications' ? unreadCount : 0;
            return (
              <DropdownMenuItem key={item.href} asChild className="cursor-pointer rounded-lg p-2.5 focus:bg-accent">
                <Link href={item.href} className="flex items-start gap-3" aria-current={itemActive ? 'page' : undefined}>
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                      itemActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {item.label}
                      {badge > 0 && <Badge className="h-4 px-1.5 text-[10px]">{badge > 99 ? '99+' : badge}</Badge>}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{item.description}</span>
                    )}
                  </span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  // The "mobile sidebar" store flag now drives the mobile navigation drawer.
  const { openCommandPalette, toggleMobileSidebar } = useUIStore();
  const { data: notifications, isLoading: notificationsLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const allNotifications = notifications ?? [];
  const unreadCount = allNotifications.filter((n) => !n.read).length;
  const recentNotifications = [...allNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const [loggingOut, setLoggingOut] = useState(false);
  const sections = getVisibleNavSections(user?.role);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    // Best-effort — invalidate the session server-side too, but a failure here (e.g. the
    // access token already expired) must never block clearing the local session.
    await authService.logout().catch(() => {});
    logout();
    qc.clear();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-nav-border bg-nav bg-gradient-to-r from-nav via-nav to-nav-to text-nav-foreground shadow-[0_1px_0_0_rgb(255_255_255_/_0.04),0_8px_24px_-12px_rgb(2_6_23_/_0.5)]">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className={cn(navIconButton, 'lg:hidden')}
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <BrandMark className="mr-2 lg:mr-4" />

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {sections.map((section) => (
            <NavGroup key={section.label} section={section} pathname={pathname} unreadCount={unreadCount} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          {/* Search — opens the ⌘K command palette */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="hidden h-9 items-center gap-2 rounded-lg border border-nav-border bg-white/5 pl-3 pr-2 text-sm text-nav-muted transition-colors hover:bg-white/10 hover:text-nav-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 md:flex xl:w-56"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="flex h-5 items-center gap-0.5 rounded border border-nav-border bg-white/5 px-1.5 font-mono text-[10px]">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" className={cn(navIconButton, 'md:hidden')} onClick={openCommandPalette} aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={navIconButton}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={navIconButton}
                aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-nav"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={14} className="w-[min(22rem,calc(100vw-2rem))]">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[320px] overflow-y-auto">
                {notificationsLoading ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>
                ) : recentNotifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                    <Bell className="h-6 w-6 text-muted-foreground/60" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-1.5">
                    {recentNotifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={cn(
                          'cursor-pointer flex-col items-start gap-0.5 rounded-lg p-3',
                          !n.read && 'bg-primary/5'
                        )}
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

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-1 flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-nav-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 xl:rounded-lg xl:py-1 xl:pl-1 xl:pr-2.5"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8 ring-2 ring-white/15">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-semibold text-white">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden flex-col items-start text-left leading-tight xl:flex">
                  <span className="text-sm font-medium text-nav-foreground">{user?.name || 'User'}</span>
                  <span className="text-[11px] capitalize text-nav-muted">{user?.role?.replace(/_/g, ' ') || 'Admin'}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={14} className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{user?.email || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />{loggingOut ? 'Signing out…' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
