'use client';

import { useQuery } from '@tanstack/react-query';
import { industryService, type IndustryOption } from '@/services/industry.service';
import { INDUSTRY_OPTIONS } from '@/constants/industry';
import { QUERY_KEYS } from '@/constants';

/**
 * The industries the company form may offer.
 *
 * Starts from the bundled list so the picker is never empty and never waits on
 * the network, then replaces it with whatever the API actually accepts. If the
 * request fails the bundled list simply stands.
 */
export function useIndustries(): { options: IndustryOption[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.INDUSTRIES,
    queryFn: () => industryService.getIndustries(),
    // The catalogue changes on deploys, not during a session.
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
  return { options: data ?? [...INDUSTRY_OPTIONS], isLoading };
}
