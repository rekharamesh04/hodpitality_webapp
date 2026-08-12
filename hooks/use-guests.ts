import { guestService } from '@/services/guest.service';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import type { TableFilters } from '@/types';

export function useGuests(filters?: TableFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.GUESTS, 'list', filters],
    queryFn:  () => guestService.getGuests(filters),
  });
}
