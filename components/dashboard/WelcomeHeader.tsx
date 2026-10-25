'use client';

import { useAuthStore } from '@/store';
import { format } from 'date-fns';

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const now = new Date();

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{format(now, 'EEEE, MMMM d')}</p>
      <h1 className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">
        {greeting(now.getHours())}, {user?.name?.split(' ')[0] || 'Admin'}
      </h1>
    </div>
  );
}
