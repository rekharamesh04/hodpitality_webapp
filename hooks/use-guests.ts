import { guestService } from '@/services/guest.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/constants';
import type { TableFilters, Guest } from '@/types';

export function useGuests(filters?: TableFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.GUESTS, 'list', filters],
    queryFn:  () => guestService.getGuests(filters),
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Guest>) => guestService.createGuest(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS }); toast.success('Guest created'); },
    onError: () => toast.error('Failed to create guest'),
  });
}

export function useUpdateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Guest> }) => guestService.updateGuest(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS }); toast.success('Guest updated'); },
    onError: () => toast.error('Failed to update guest'),
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestService.deleteGuest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS }); toast.success('Guest removed'); },
    onError: () => toast.error('Failed to remove guest'),
  });
}

export function useBulkDeleteGuests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => guestService.bulkDeleteGuests(ids),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS }); toast.success('Guests removed'); },
    onError: () => toast.error('Failed to remove guests'),
  });
}
