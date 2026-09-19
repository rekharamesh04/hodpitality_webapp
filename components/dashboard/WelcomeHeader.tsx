'use client';

import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const currentDate = new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome back, {user?.name?.split(' ')[0] || 'Admin'} — here&apos;s what&apos;s happening today, {formatDate(currentDate, 'MMMM dd, yyyy')}.
      </p>
    </div>
  );
}
