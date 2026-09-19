import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hospitalityService } from "@/services/hospitality.service";
import { getFriendlyErrorMessage } from "@/lib/utils";
import type { TableFilters, Hospitality } from "@/types";
type FilterOptions = TableFilters & { guestId?: string; type?: string };
type HospitalityBooking = Hospitality;

export const hospitalityKeys = {
  all: ["hospitality"] as const,
  list: (filters: FilterOptions) => ["hospitality", "list", filters] as const,
  detail: (id: string) => ["hospitality", id] as const,
  vip: ["hospitality", "vip"] as const,
  guest: (guestId: string) => ["hospitality", "guest", guestId] as const,
};

export function useHospitalityBookings(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: hospitalityKeys.list(filters),
    queryFn: () => hospitalityService.getBookings(filters),
  });
}

export function useHospitalityBooking(id: string) {
  return useQuery({
    queryKey: hospitalityKeys.detail(id),
    queryFn: () => hospitalityService.getBooking(id),
    enabled: !!id,
  });
}

export function useVipGuests() {
  return useQuery({
    queryKey: hospitalityKeys.vip,
    queryFn: hospitalityService.getVipGuests,
  });
}

/** GET /hospitality/guest/{guestId} — every hospitality request linked to one guest. */
export function useGuestHospitality(guestId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: hospitalityKeys.guest(guestId),
    queryFn: () => hospitalityService.getGuestBookings(guestId),
    enabled: !!guestId && (options?.enabled ?? true),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<HospitalityBooking>) =>
      hospitalityService.createBooking(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalityKeys.all });
      toast.success("Hospitality request created");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create request")),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: HospitalityBooking["status"] }) =>
      hospitalityService.updateBookingStatus(id, status),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: hospitalityKeys.all });
      qc.invalidateQueries({ queryKey: hospitalityKeys.detail(vars.id) });
      toast.success("Request status updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update request")),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hospitalityService.deleteBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalityKeys.all });
      toast.success("Hospitality request deleted");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete request")),
  });
}
