'use client';

import { useEffect } from 'react';
import { initSessionRefresh } from '@/lib/axios';

/**
 * Keeps the real (useAuthStore) Cognito session alive: validates / silently refreshes it on
 * every fresh page load and re-arms itself on each login, refresh and logout.
 *
 * It used to also seed an IndexedDB "database" with demo data and expose a legacy mock auth
 * context. Nothing read either, so both were removed along with the mock layer they came from.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove the demo IndexedDB database and its flag left behind by the old mock layer.
    try {
      if (localStorage.getItem('hospitality-admin-db-initialized')) {
        localStorage.removeItem('hospitality-admin-db-initialized');
        indexedDB.deleteDatabase('hospitality-admin-db');
      }
    } catch {
      // Storage can be unavailable (private mode); nothing to clean up then.
    }
    return initSessionRefresh();
  }, []);

  return <>{children}</>;
}
