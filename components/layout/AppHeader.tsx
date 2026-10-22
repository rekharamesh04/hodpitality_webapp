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
import { DevIndustrySwitcher } from '@/components/common/DevIndustrySwitcher';
import { PlatformScopeSwitcher } from '@/components/layout/PlatformScopeSwitcher';
import { useAuthStore, useUIStore } from '@/store';
import { useNotifications, useMarkNotificationRead } from '@/hooks/use-notifications';
import { getVisibleNavSections, isNavItemActive, type NavItem, type NavSection } from '@/constants/navigation';
import { useIndustry } from '@/hooks';
import { cn, getInitials, getRelativeTime } from '@/lib/utils';
import { authService } from '@/services/auth.service';

/** Circular icon button for the navigation bar. */
const navIconButton =
  'relative h-9 w-9 rounded-full text-nav-muted hover:bg-nav-accent hover:text-nav-foreground focus-visible:ring-offset-background';

export function BrandMark({ className, alwaysShowName }: { className?: string; alwaysShowName?: boolean }) {
  return (
    <Link href="/dashboard" className={cn('flex shrink-0 items-center gap-3', className)} aria-label="EntryFlow Admin — Dashboard">
      <span className="font-serif text-[28px] font-bold leading-none tracking-tight text-nav-foreground">
        EF
      </span>
      <span
        className={cn('h-6 w-px bg-nav-border', alwaysShowName ? 'block' : 'hidden sm:block')}
        aria-hidden="true"
      />
      <span className={cn('flex-col leading-tight', alwaysShowName ? 'flex' : 'hidden sm:flex')}>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-nav-foreground">EntryFlow</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary">Admin</span>
      </span>
    </Link>
  );
}

function NavGroup({ section, pathname, unreadCount }: { section: NavSection; pathname: string; unreadCount: number }) {
  const active = section.items.some((item) => isNavItemActive(pathname, item.href));
  const triggerClass = cn(
    'relative flex h-9 items-center gap-1 rounded-sm px-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors outline-none xl:px-3 xl:tracking-[0.25em]',
    'focus-visible:ring-1 focus-visible:ring-primary',
    active ? 'text-nav-foreground' : 'text-nav-muted hover:text-nav-foreground'
  );
  // Active-section marker: a 1px gold rule sitting on the bar's bottom edge.
  const indicator = active && (
    <span className="absolute inset-x-2.5 -bottom-[22px] h-px bg-primary xl:inset-x-3" aria-hidden="true" />
  );

  if (section.items.length === 1) {
    const item = section.items[0];
    return (
      <Link href={item.href} className={triggerClass} aria-current={active ? 'page' : undefined}>
        {/* A lone item is named for itself — "Events" over a link to Counters would mislead. */}
        {item.label}
        {indicator}
      </Link>
    );
  }

  const steps = section.items.filter((item) => item.step);
  const others = section.items.filter((item) => !item.step);
  // A workflow reads top to bottom in one column; a two-column grid would read
  // across and scramble the order.
  const wide = steps.length === 0 && section.items.length > 3;
  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const itemActive = isNavItemActive(pathname, item.href);
    const badge = item.href === '/notifications' ? unreadCount : 0;
    return (
      <DropdownMenuItem key={item.href} asChild className="cursor-pointer rounded-xs p-2.5 focus:bg-accent">
        <Link href={item.href} className="flex items-start gap-3" aria-current={itemActive ? 'page' : undefined}>
          <span
            className={cn(
              'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors',
              itemActive ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-primary'
            )}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {item.step && (
              <span
                className="absolute -left-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-popover bg-foreground px-1 text-[10px] font-bold text-background"
                aria-hidden="true"
              >
                {item.step}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-sm font-medium">
              {item.step && <span className="sr-only">Step {item.step}:</span>}
              {item.label}
              {item.optional && (
                <span className="rounded-xs border px-1 font-mono text-[9px] font-normal uppercase tracking-widest text-muted-foreground">Optional</span>
              )}
              {badge > 0 && <Badge className="h-4 px-1.5 text-[10px]">{badge > 99 ? '99+' : badge}</Badge>}
            </span>
            {item.description && (
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{item.description}</span>
            )}
          </span>
        </Link>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={cn(triggerClass, 'data-[state=open]:text-nav-foreground')}>
        {section.menuLabel}
        <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform [[data-state=open]>&]:rotate-180" aria-hidden="true" />
        {indicator}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={22} className={cn('p-2', wide ? 'w-[560px]' : steps.length ? 'w-[400px]' : 'w-[320px]')}>
        <DropdownMenuLabel className="px-2 pb-2 text-primary">
          {section.label}
        </DropdownMenuLabel>
        {steps.length > 0 ? (
          <>
            <ol className="grid gap-1">{steps.map((item) => <li key={item.href}>{renderItem(item)}</li>)}</ol>
            {others.length > 0 && (
              <>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuLabel className="px-2 pb-1">
                  Other tools
                </DropdownMenuLabel>
                <div className="grid gap-1">{others.map(renderItem)}</div>
              </>
            )}
          </>
        ) : (
          <div className={cn('grid gap-1', wide && 'grid-cols-2')}>{section.items.map(renderItem)}</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const industry = useIndustry();
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
  const sections = getVisibleNavSections(user?.role, industry);

  // .theme-switching (globals.css) lets every surface crossfade for one 0.4s transition.
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    window.setTimeout(() => root.classList.remove('theme-switching'), 450);
  };

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
    <header className="sticky top-0 z-40 border-b border-nav-border bg-nav text-nav-foreground backdrop-blur-xl supports-[backdrop-filter]:bg-nav">
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center gap-2 px-4 sm:px-6 lg:px-8">
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
          {/* Renders nothing unless the local demo bypass is on. */}
          <DevIndustrySwitcher />
          {/* Search — opens the ⌘K command palette */}
          <button
            type="button"
            onClick={openCommandPalette}
            className="hidden h-9 items-center gap-2 rounded-sm border border-nav-border bg-transparent pl-3 pr-2 text-sm text-nav-muted transition-colors hover:border-nav-muted hover:text-nav-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary md:flex xl:w-56"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="flex h-5 items-center gap-0.5 rounded-xs border border-nav-border bg-transparent px-1.5 font-mono text-[10px]">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
          <Button variant="ghost" size="icon" className={cn(navIconButton, 'md:hidden')} onClick={openCommandPalette} aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(navIconButton, 'border border-nav-border hover:border-primary hover:text-primary')}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 opacity-100 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] dark:-rotate-90 dark:scale-0 dark:opacity-0" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 opacity-0 transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] dark:rotate-0 dark:scale-100 dark:opacity-100" />
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
                    className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-semibold text-primary-foreground ring-2 ring-background"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={22} className="w-[min(22rem,calc(100vw-2rem))]">
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
                          'cursor-pointer flex-col items-start gap-0.5 rounded-xs p-3',
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
                        {n.createdAt && <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{getRelativeTime(n.createdAt)}</p>}
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-[11px] font-semibold uppercase tracking-[0.16em] text-primary" onClick={() => router.push('/notifications')}>
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-1 flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-nav-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary xl:rounded-sm xl:py-1 xl:pl-1 xl:pr-2.5"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8 ring-1 ring-nav-border">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-ink font-serif text-sm font-semibold text-ink-foreground">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden flex-col items-start text-left leading-tight xl:flex">
                  <span className="text-sm font-medium text-nav-foreground">{user?.name || 'User'}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-nav-muted">{user?.role?.replace(/_/g, ' ') || 'Admin'}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={22} className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-serif text-base font-semibold normal-case tracking-normal text-foreground">{user?.name || 'User'}</p>
                  <p className="truncate font-sans text-xs font-normal normal-case tracking-normal text-muted-foreground">{user?.email || ''}</p>
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
      {/* Super admin and reseller only: which organisations every page shows. */}
      <PlatformScopeSwitcher />
    </header>
  );
}
