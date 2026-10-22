'use client';

import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const currentDate = new Date();

  return (
    <div>
      <p className="editorial-label flex items-center gap-3 text-primary">
        <span className="h-px w-8 bg-primary" aria-hidden="true" />
        {formatDate(currentDate, 'MMMM dd, yyyy')}
      </p>
      <h1 className="mt-4 font-serif text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl">Dashboard</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Welcome back,{' '}
        <em className="font-serif text-base italic text-foreground">{user?.name?.split(' ')[0] || 'Admin'}</em>
        {' '}— here&apos;s what&apos;s happening today.
      </p>
    </div>
  );
}
