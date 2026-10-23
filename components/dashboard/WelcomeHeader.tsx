'use client';

import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const currentDate = new Date();

  return (
    <div>
      <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {formatDate(currentDate, 'MMMM dd, yyyy')}
      </p>
      <h1 className="mt-1 text-[23px] font-semibold tracking-tight sm:text-[28px]">Dashboard</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Welcome back, {user?.name?.split(' ')[0] || 'Admin'} — here&apos;s what&apos;s happening today.
      </p>
    </div>
  );
}
