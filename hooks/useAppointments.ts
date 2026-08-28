import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { appointmentService } from "@/services/appointment.service";
import type { AppointmentFilters, CreateAppointmentPayload, AppointmentStatusValue } from "@/services/appointment.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage } from "@/lib/utils";

export const appointmentKeys = {
  all:  QUERY_KEYS.APPOINTMENTS,
  list: (filters: AppointmentFilters) => [...QUERY_KEYS.APPOINTMENTS, "list", filters] as const,
};

export function useAppointments(filters: AppointmentFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn:  () => appointmentService.getAppointments(filters),
    enabled:  options?.enabled ?? true,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAppointmentPayload) => appointmentService.createAppointment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
      toast.success("Appointment created");
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast.error(
          err?.backendMessage ??
          "This staff member is already booked at that time. Please choose another time or staff member."
        );
        return;
      }
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create appointment"));
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatusValue }) =>
      appointmentService.updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
      toast.success("Appointment updated");
    },
    onError: (err: any) => {
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update appointment"));
    },
  });
}
