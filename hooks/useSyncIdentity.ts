'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { QUERY_KEYS } from '@/constants';
import { normalizeIndustry } from '@/constants/industry';

/**
 * Keeps the stored user in step with what the server says about them.
 *
 * The login response carries the industry, so labels are right from the first
 * paint and this is not what makes the feature work. What it fixes is the
 * stale case: when an account manager reclassifies a company, everyone signed
 * in at the time would otherwise keep seeing the old vocabulary until they
 * next logged out — which could be days.
 *
 * Only fields the server owns are merged, and only when they actually differ,
 * so this never causes a render on its own.
 */
export function useSyncIdentity(): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data } = useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    // The industry changes rarely, so this is about catching up eventually
    // rather than polling. A refetch on focus is enough.
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!data || !user) return;
    const industry = normalizeIndustry(data.industry);
    const changed =
      industry !== user.industry ||
      (data.role && data.role !== user.role) ||
      (data.tenant_id && data.tenant_id !== user.tenant_id);
    if (!changed) return;
    setUser({ ...user, ...data, industry });
  }, [data, user, setUser]);
}
