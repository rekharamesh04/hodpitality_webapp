import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { appointmentService } from "@/services/appointment.service";
import { QUERY_KEYS } from "@/constants";
import type { TableFilters, Appointment } from "@/types";

export function useAppointments(filters: TableFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.APPOINTMENTS, "list", filters],
    queryFn:  () => appointmentService.getAppointments(filters),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Appointment>) => appointmentService.createAppointment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      toast.success("Appointment created");
    },
    onError: () => toast.error("Failed to create appointment"),
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Appointment["status"] }) =>
      appointmentService.updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      toast.success("Appointment updated");
    },
    onError: () => toast.error("Failed to update appointment"),
  });
}
