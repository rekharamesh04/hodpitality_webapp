'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/common/Loading';
import { useAuthStore } from '@/store';
import { useSyncIdentity } from '@/hooks';

/**
 * Full-screen pages for a device the public uses — the reception kiosk.
 *
 * A member of staff signs in on the iPad and opens kiosk mode; the session is theirs, so every
 * request is tenant-scoped exactly as at the desk. What this layout leaves out is the portal: no
 * header, no menus, nothing a patient could wander into.
 */
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  useSyncIdentity();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null;
  return <div className="min-h-screen bg-background">{children}</div>;
}
