'use client';

import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const currentDate = new Date();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back, {user?.name?.split(' ')[0] || 'Admin'} — here's what's happening today, {formatDate(currentDate, 'MMMM dd, yyyy')}.
      </p>
    </div>
  );
}
