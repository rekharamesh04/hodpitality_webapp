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

/**
 * A repeat check-in for the same guest/event/day is rejected with 409 and the existing record.
 * That is a "already done" outcome, not a failure, so it must never create a second row.
 */
function isAlreadyCheckedIn(err: any): boolean {
  return err?.response?.status === 409;
}

function checkInErrorMessage(err: any, fallback: string): string {
  if (isAlreadyCheckedIn(err)) return err?.backendMessage ?? "This guest has already checked in.";
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
    onError: (err: any) => {
      if (isAlreadyCheckedIn(err)) {
        // Refresh so the row the backend already holds is what the user sees.
        qc.invalidateQueries({ queryKey: checkInKeys.all });
        toast.info(checkInErrorMessage(err, "Already checked in"));
        return;
      }
      toast.error(checkInErrorMessage(err, "Check-in failed"));
    },
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
    onError: (err: any) => {
      if (isAlreadyCheckedIn(err)) {
        qc.invalidateQueries({ queryKey: checkInKeys.all });
        toast.info(checkInErrorMessage(err, "Already checked in"));
        return;
      }
      toast.error(checkInErrorMessage(err, "QR check-in failed"));
    },
  });
}

/** Maps the facial endpoint's failure codes onto what the front-desk operator should do next. */
function facialErrorMessage(err: any): string {
  switch (err?.response?.status) {
    case 400: return "No face detected — reposition the guest in frame and retake the photo.";
    case 404: return err?.backendMessage ?? "Face not recognised. Enrol this guest first, or check them in manually.";
    case 409: return err?.backendMessage ?? "This guest has already checked in.";
    case 413: return "That photo is too large. Retake it and try again.";
    default:  return err?.backendMessage ?? getFriendlyErrorMessage(err, "Facial check-in failed");
  }
}

export function useFacialCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { image: string; venue?: string; eventId?: string }) =>
      checkInService.checkInByFacial(payload),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      const confidence = typeof result.matchConfidence === "number"
        ? ` (${result.matchConfidence.toFixed(1)}% match)`
        : "";
      toast.success(`Checked in ${result.guestName ?? "guest"}${confidence}`);
    },
    onError: (err: any) => {
      if (isAlreadyCheckedIn(err)) {
        qc.invalidateQueries({ queryKey: checkInKeys.all });
        toast.info(facialErrorMessage(err));
        return;
      }
      toast.error(facialErrorMessage(err));
    },
  });
}

export function usePrintBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (checkInId: string) => checkInService.printBadge(checkInId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checkInKeys.all });
      toast.success("Badge marked as printed");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to print badge")),
  });
}
