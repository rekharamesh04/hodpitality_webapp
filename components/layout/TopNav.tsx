'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, Moon, Sun, Search, Settings, LogOut, User, Command, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore, useUIStore, useNotificationStore } from '@/store';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { authService } from '@/services/auth.service';

export function TopNav() {
  const router = useRouter();
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { openCommandPalette, toggleMobileSidebar } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 sm:px-6">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Search — hidden on xs, shown on sm+ */}
      <div className="hidden sm:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search... (⌘K)"
            className="w-full pl-9 pr-10"
            onFocus={() => { setSearchFocused(true); openCommandPalette(); }}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Mobile search icon (opens palette) */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 sm:hidden"
        onClick={openCommandPalette}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Right actions — ml-auto pins this group to the right edge */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <div className="space-y-1 p-2">
                <div className="rounded-lg p-3 hover:bg-accent">
                  <p className="text-sm font-medium">New guest registration</p>
                  <p className="text-xs text-muted-foreground">Sarah Anderson registered for Tech Summit</p>
                  <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                </div>
                <div className="rounded-lg p-3 hover:bg-accent">
                  <p className="text-sm font-medium">Check-in complete</p>
                  <p className="text-xs text-muted-foreground">Michael Chen checked in successfully</p>
                  <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center" onClick={() => router.push('/notifications')}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu — rightmost */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 pl-2 pr-2 sm:pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-left text-sm">
                <span className="font-medium leading-none">{user?.name || 'User'}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ') || 'Admin'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
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
            <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />{loggingOut ? 'Signing out…' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

