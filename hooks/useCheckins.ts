import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkInService } from "@/services/checkin.service";
import type { TableFilters, CheckIn } from "@/types";
type FilterOptions = TableFilters;

export const checkInKeys = {
  all: ["check-ins"] as const,
  list: (filters: FilterOptions) => ["check-ins", "list", filters] as const,
  stats: ["check-ins", "stats"] as const,
};

export function useCheckIns(filters: FilterOptions = {}) {
  return useQuery({
    queryKey: checkInKeys.list(filters),
    queryFn: () => checkInService.getCheckIns(filters),
    refetchInterval: 15000, // refresh every 15s for live feel
  });
}

export function useCheckInStats() {
  return useQuery({
    queryKey: checkInKeys.stats,
    queryFn: checkInService.getStats,
    refetchInterval: 15000,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ guestId, method }: { guestId: string; method: string }) =>
      checkInService.checkIn(guestId, method),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      if (data?.status === "success")    toast.success(`${data.guestName} checked in!`);
      if (data?.status === "duplicate")  toast.warning("Already checked in!");
      if (data?.status === "failed")     toast.error("Check-in failed");
    },
    onError: () => toast.error("Check-in error"),
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
