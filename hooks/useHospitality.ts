import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { hospitalityService } from "@/services/hospitality.service";
import type { TableFilters, Hospitality } from "@/types";
type FilterOptions = TableFilters & { guestId?: string; type?: string };
type HospitalityBooking = Hospitality;

export const hospitalityKeys = {
  all: ["hospitality"] as const,
  list: (filters: FilterOptions) => ["hospitality", "list", filters] as const,
  detail: (id: string) => ["hospitality", id] as const,
  vip: ["hospitality", "vip"] as const,
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

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<HospitalityBooking>) =>
      hospitalityService.createBooking(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalityKeys.all });
      toast.success("Booking created");
    },
    onError: () => toast.error("Failed to create booking"),
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
      toast.success("Booking updated");
    },
    onError: () => toast.error("Update failed"),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hospitalityService.deleteBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalityKeys.all });
      toast.success("Booking deleted");
    },
    onError: () => toast.error("Failed to delete booking"),
  });
}
