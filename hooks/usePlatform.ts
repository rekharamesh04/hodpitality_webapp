import { useQuery } from '@tanstack/react-query';
import { platformService } from '@/services/platform.service';

export const platformKeys = {
  overview: ['platform', 'overview'] as const,
};

/** The platform-wide counts. Super admin and reseller only — the API refuses everyone else. */
export function usePlatformOverview(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: platformKeys.overview,
    queryFn: platformService.getOverview,
    enabled: options.enabled ?? true,
  });
}
