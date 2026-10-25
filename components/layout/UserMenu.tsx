'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronsUpDown, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store';
import { cn, getInitials } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { clearKioskPin } from '@/lib/kiosk-lock';

/**
 * The signed-in person: profile, settings, light/dark, sign out.
 *
 * `sidebar` is the full-width row at the foot of the desktop sidebar; `compact`
 * is the avatar alone, for the phone top bar where the sidebar is hidden.
 */
export function UserMenu({ variant }: { variant: 'sidebar' | 'compact' }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const role = user?.role?.replace(/_/g, ' ') || 'Admin';

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    // Best-effort — invalidate the session server-side too, but a failure here (e.g. the
    // access token already expired) must never block clearing the local session.
    await authService.logout().catch(() => {});
    clearKioskPin();
    logout();
    qc.clear();
    router.push('/login');
  };

  const avatar = (
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarImage src={user?.avatar} alt={user?.name} />
      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
        {user?.name ? getInitials(user.name) : 'U'}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'sidebar' ? (
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Account menu"
          >
            {avatar}
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium text-sidebar-foreground">{user?.name || 'User'}</span>
              <span className="block truncate text-xs capitalize text-sidebar-muted">{role}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-muted" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="rounded-full p-0.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Account menu"
          >
            {avatar}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        side={variant === 'sidebar' ? 'top' : 'bottom'}
        sideOffset={8}
        className={cn(variant === 'sidebar' ? 'w-[var(--radix-dropdown-menu-trigger-width)] min-w-56' : 'w-56')}
      >
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
        <DropdownMenuItem onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="cursor-pointer">
          {resolvedTheme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />{loggingOut ? 'Signing out…' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
