'use client';

import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const currentDate = new Date();

  return (
    <div className="relative">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Dashboard</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Welcome back, <span className="gradient-text font-semibold">{user?.name?.split(' ')[0] || 'Admin'}</span> — here&apos;s what&apos;s happening today, {formatDate(currentDate, 'MMMM dd, yyyy')}.
      </p>
    </div>
  );
}
