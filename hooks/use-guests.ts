import { mockGuests } from '@/constants/mock-data';
import type { Guest, TableFilters } from '@/types';

export function useGuests(_filters?: TableFilters) {
  return { data: mockGuests as Guest[], isLoading: false, error: null };
}
