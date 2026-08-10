'use client';

import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const currentDate = new Date();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋
      </h1>
      <p className="mt-2 text-muted-foreground">
        {formatDate(currentDate, 'MMMM dd, yyyy')} • Here's what's happening today
      </p>
    </div>
  );
}
