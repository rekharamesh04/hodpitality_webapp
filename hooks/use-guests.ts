import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { guestService } from '@/services/guest.service';
import type { GuestFilters, CreateGuestPayload, UpdateGuestPayload } from '@/services/guest.service';
import { QUERY_KEYS } from '@/constants';
import { getLocalAvatar, setLocalAvatar } from '@/lib/local-avatars';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { PaginatedResponse, Guest } from '@/types';

export const guestKeys = {
  all:    QUERY_KEYS.GUESTS,
  list:   (filters: GuestFilters) => [...QUERY_KEYS.GUESTS, 'list', filters] as const,
  detail: (id: string) => QUERY_KEYS.GUEST_DETAIL(id),
};

export function useGuests(filters: GuestFilters = {}) {
  return useQuery({
    queryKey: guestKeys.list(filters),
    queryFn:  () => guestService.getGuests(filters),
    placeholderData: keepPreviousData,
    select: (res: PaginatedResponse<Guest>) => ({
      ...res,
      data: res.data.map((g) => {
        if (g.avatar) return g;
        const id = g.id ?? g.PK?.replace('GUEST#', '') ?? '';
        const local = getLocalAvatar(id);
        return local ? { ...g, avatar: local } : g;
      }),
    }),
  });
}

export function useGuest(id: string) {
  return useQuery({
    queryKey: guestKeys.detail(id),
    queryFn:  () => guestService.getGuest(id),
    enabled:  !!id,
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGuestPayload) => guestService.createGuest(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      toast.success('Guest created');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to create guest')),
  });
}

export function useUpdateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestPayload }) => guestService.updateGuest(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      qc.invalidateQueries({ queryKey: guestKeys.detail(vars.id) });
      toast.success('Guest updated');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to update guest')),
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestService.deleteGuest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      toast.success('Guest removed');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to remove guest')),
  });
}

export function useEnrollFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ guestId, image }: { guestId: string; image: string }) =>
      guestService.enrollFace(guestId, { image }),
    onSuccess: (result, { guestId, image }) => {
      if (result?.success === false) {
        toast.error(result.message ?? 'Face enrollment failed');
        return;
      }
      // The enroll response doesn't echo back a photo URL, so cache the
      // captured image ourselves — see lib/local-avatars.ts.
      setLocalAvatar(guestId, image);
      qc.invalidateQueries({ queryKey: guestKeys.all });
      qc.invalidateQueries({ queryKey: guestKeys.detail(guestId) });
      toast.success('Face enrolled successfully');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? err?.response?.data?.error ?? 'Face enrollment failed'),
  });
}


export function useBulkDeleteGuests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => guestService.bulkDeleteGuests(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      toast.success('Guests removed');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to remove guests')),
  });
}
