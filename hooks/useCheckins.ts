import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkInService } from "@/services/checkin.service";
import { QUERY_KEYS } from "@/constants";
import type { TableFilters } from "@/types";
type FilterOptions = TableFilters;

export const checkInKeys = {
  all:   QUERY_KEYS.CHECKINS,
  list:  (filters: FilterOptions) => [...QUERY_KEYS.CHECKINS, "list", filters] as const,
  stats: QUERY_KEYS.CHECKIN_STATS,
};

export function useCheckIns(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: checkInKeys.list(filters),
    queryFn:  () => checkInService.getCheckIns(filters),
    refetchInterval: 15000,
  });
}

export function useCheckInStats() {
  return useQuery({
    queryKey: checkInKeys.stats,
    queryFn:  checkInService.getStats,
    refetchInterval: 15000,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { guestId: string; method?: string; venue?: string }) =>
      checkInService.quickCheckIn(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      toast.success("Guest checked in successfully!");
    },
    onError: () => toast.error("Check-in failed"),
  });
}

export function useQrCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ qrCode, venue }: { qrCode: string; venue?: string }) =>
      checkInService.checkInByQr(qrCode, venue),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      toast.success("QR check-in successful!");
    },
    onError: () => toast.error("QR check-in failed"),
  });
}

export function useFacialCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageData: string) => checkInService.checkInByFacial(imageData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      toast.success("Facial recognition check-in successful!");
    },
    onError: () => toast.error("Facial check-in failed"),
  });
}

export function usePrintBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checkInId: string) => checkInService.printBadge(checkInId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      toast.success("Badge printed!");
    },
    onError: () => toast.error("Failed to print badge"),
  });
}
