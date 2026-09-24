import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { popup } from '@/lib/popup';
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
      popup.success('Guest created');
    },
    onError: (err: any) => {
      const conflict = getDuplicatePersonConflict(err);
      if (conflict) {
        popup.error(conflict.message, { description: 'Opening the existing record instead.' });
        options?.onDuplicate?.(conflict);
        return;
      }
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to create guest'));
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
      popup.success('Guest updated');
    },
    onError: (err: any) => {
      const conflict = getDuplicatePersonConflict(err);
      if (conflict) {
        popup.error(conflict.message);
        return;
      }
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to update guest'));
    },
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestService.deleteGuest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      popup.success('Guest removed');
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to remove guest')),
  });
}

function resolveGuestId(g: Partial<Guest> | undefined | null): string {
  return g?.id ?? (g?.PK ? g.PK.replace('GUEST#', '') : '') ?? '';
}

/**
 * The backend only ever returns a bare S3 key/private URL for `face_photo_url`, so
 * refetching after enroll can replace a working photo with one the browser can't load.
 * We already have the exact bytes that were just uploaded (the captured data URL), so
 * patch the cache with that directly instead of invalidating and trusting the refetch.
 */
export function useEnrollFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ guestId, image }: { guestId: string; image: string }) =>
      guestService.enrollFace(guestId, image),
    onSuccess: (result, { guestId, image }) => {
      if (result?.success === false) {
        popup.error(result.message ?? 'Face enrollment failed');
        return;
      }
      const patch = { face_photo_url: image, avatar: image, face_enrolled: true };
      qc.setQueryData(guestKeys.detail(guestId), (old: Guest | undefined) =>
        old ? { ...old, ...patch } : old
      );
      qc.setQueriesData<PaginatedResponse<Guest>>({ queryKey: guestKeys.all }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((g) => (resolveGuestId(g) === guestId ? { ...g, ...patch } : g)),
        };
      });
      popup.success('Face enrolled successfully');
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? err?.response?.data?.error ?? 'Face enrollment failed'),
  });
}

export function useUnenrollFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guestId: string) => guestService.unenrollFace(guestId),
    onSuccess: (_result, guestId) => {
      const patch = { face_photo_url: undefined, avatar: undefined, face_enrolled: false };
      qc.setQueryData(guestKeys.detail(guestId), (old: Guest | undefined) =>
        old ? { ...old, ...patch } : old
      );
      qc.setQueriesData<PaginatedResponse<Guest>>({ queryKey: guestKeys.all }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((g) => (resolveGuestId(g) === guestId ? { ...g, ...patch } : g)),
        };
      });
      popup.success('Face removed');
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to remove face')),
  });
}


export function useBulkDeleteGuests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => guestService.bulkDeleteGuests(ids),
    onSuccess: (data, ids) => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      // The backend silently skips IDs that no longer exist or belong to another tenant, so
      // trust `deleted` rather than assuming every requested ID went.
      const deleted = Array.isArray(data?.deleted) ? data.deleted.length : ids.length;
      const skipped = ids.length - deleted;
      if (deleted === 0) {
        popup.error('No guests were deleted — they may already be gone or you may not have access to them.');
      } else if (skipped > 0) {
        popup.warning(`${deleted} of ${ids.length} guests deleted. ${skipped} could not be deleted (already removed or not accessible).`);
      } else {
        popup.success(`${deleted} guest${deleted === 1 ? '' : 's'} deleted`);
      }
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to remove guests')),
  });
}

export function useBulkImportGuests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guests: Array<Partial<Guest>>) => guestService.bulkImportGuests(guests),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: guestKeys.all });
      const failed = result?.errors?.length ?? 0;
      const imported = result?.imported ?? 0;
      if (failed > 0) popup.warning(`Imported ${imported} guest${imported === 1 ? '' : 's'} — ${failed} row${failed === 1 ? '' : 's'} failed`);
      else popup.success(`Imported ${imported} guest${imported === 1 ? '' : 's'}`);
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to import guests')),
  });
}
