import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { guestService } from '@/services/guest.service';
import type { GuestFilters, CreateGuestPayload, UpdateGuestPayload } from '@/services/guest.service';
import { QUERY_KEYS } from '@/constants';
import { getFriendlyErrorMessage, getDuplicatePersonConflict } from '@/lib/utils';
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
      data: res.data.map((g) => (g.avatar ? g : { ...g, avatar: g.face_photo_url })),
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

/**
 * Guests have no login, so creating one sends no invite — never tell the user one went out.
 * A duplicate email comes back as 409 with the existing person's id; the caller opens that
 * record rather than adding a second row for the same human.
 */
export function useCreateGuest(options?: { onDuplicate?: (conflict: NonNullable<ReturnType<typeof getDuplicatePersonConflict>>) => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGuestPayload) => guestService.createGuest(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      toast.success('Guest created');
    },
    onError: (err: any) => {
      const conflict = getDuplicatePersonConflict(err);
      if (conflict) {
        toast.error(conflict.message, { description: 'Opening the existing record instead.' });
        options?.onDuplicate?.(conflict);
        return;
      }
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to create guest'));
    },
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
    onError: (err: any) => {
      const conflict = getDuplicatePersonConflict(err);
      if (conflict) {
        toast.error(conflict.message);
        return;
      }
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to update guest'));
    },
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
      guestService.enrollFace(guestId, image),
    onSuccess: (result, { guestId }) => {
      if (result?.success === false) {
        toast.error(result.message ?? 'Face enrollment failed');
        return;
      }
      qc.invalidateQueries({ queryKey: guestKeys.all });
      qc.invalidateQueries({ queryKey: guestKeys.detail(guestId) });
      toast.success('Face enrolled successfully');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? err?.response?.data?.error ?? 'Face enrollment failed'),
  });
}

export function useUnenrollFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guestId: string) => guestService.unenrollFace(guestId),
    onSuccess: (_result, guestId) => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      qc.invalidateQueries({ queryKey: guestKeys.detail(guestId) });
      toast.success('Face removed');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to remove face')),
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
