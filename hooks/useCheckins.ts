import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkInService } from "@/services/checkin.service";
import type { CheckInFilters } from "@/services/checkin.service";
import { QUERY_KEYS } from "@/constants";
import type { CheckInStats } from "@/types";
import { getFriendlyErrorMessage } from "@/lib/utils";

export const checkInKeys = {
  all:   QUERY_KEYS.CHECKINS,
  list:  (filters: CheckInFilters) => [...QUERY_KEYS.CHECKINS, "list", filters] as const,
  stats: QUERY_KEYS.CHECKIN_STATS,
};

export function useCheckIns(filters: CheckInFilters = {}) {
  return useQuery({
    queryKey: checkInKeys.list(filters),
    queryFn:  () => checkInService.getCheckIns(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCheckInStats() {
  return useQuery<CheckInStats>({
    queryKey: checkInKeys.stats,
    queryFn:  checkInService.getStats,
    refetchInterval: 15000,
  });
}

/** A guest already checked in returns 409 from the backend — surfaced as a distinct message rather than a generic failure. */
function checkInErrorMessage(err: any, fallback: string): string {
  if (err?.response?.status === 409) return err?.backendMessage ?? "This guest has already checked in.";
  return err?.backendMessage ?? getFriendlyErrorMessage(err, fallback);
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { guestId: string; method?: string; venue?: string }) =>
      checkInService.quickCheckIn(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      toast.success("Guest checked in successfully!");
    },
    onError: (err: any) => toast.error(checkInErrorMessage(err, "Check-in failed")),
  });
}

export function useQrCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ qrCode, venue }: { qrCode: string; venue?: string }) =>
      checkInService.checkInByQr(qrCode, venue),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      toast.success("QR check-in successful!");
    },
    onError: (err: any) => toast.error(checkInErrorMessage(err, "QR check-in failed")),
  });
}

export function useFacialCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { image: string; venue?: string; eventId?: string }) =>
      checkInService.checkInByFacial(payload),
    onSuccess: (result) => {
      if (result.success) {
        qc.invalidateQueries({ queryKey: checkInKeys.all });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
        toast.success(`Checked in ${result.guestName ?? 'guest'}${result.matchConfidence ? ` (${result.matchConfidence.toFixed(1)}% match)` : ''}`);
      } else {
        // A non-2xx-shaped failure the backend still returns as 200 { success: false, ... } —
        // never expose raw Rekognition error text, only its own user-facing message.
        toast.error(result.error ?? result.message ?? "Face not recognized");
      }
    },
    onError: (err: any) => toast.error(checkInErrorMessage(err, "Facial check-in failed")),
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
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to print badge")),
  });
}
