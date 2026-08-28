'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuthProvider, AuthContext } from '@/lib/hooks/useAuth';
import { useInitializeData } from '@/lib/hooks/useData';
import { initSessionRefresh } from '@/lib/axios';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authValue = useAuthProvider();
  const initializeData = useInitializeData();

  useEffect(() => {
    // Skip IndexedDB init if we already seeded on a previous visit
    const DB_INIT_FLAG = 'hospitality-admin-db-initialized';
    if (!localStorage.getItem(DB_INIT_FLAG)) {
      initializeData.mutate(undefined, {
        onSuccess: () => localStorage.setItem(DB_INIT_FLAG, '1'),
      });
    }
  }, []);

  useEffect(() => {
    // Validates/silently refreshes the real (useAuthStore) session on every fresh page load —
    // and re-arms itself on every subsequent login/refresh/logout for the life of the tab.
    // Unrelated to the legacy `authValue` context above.
    return initSessionRefresh();
  }, []);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}