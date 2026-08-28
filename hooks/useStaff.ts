import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffService } from "@/services/staff.service";
import type { StaffFilters, CreateStaffPayload, UpdateStaffPayload } from "@/services/staff.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage } from "@/lib/utils";
import { reportKeys } from "@/hooks/useReports";

export const staffKeys = {
  all:    QUERY_KEYS.STAFF,
  list:   (filters: StaffFilters) => [...QUERY_KEYS.STAFF, "list", filters] as const,
  detail: (id: string) => QUERY_KEYS.STAFF_DETAIL(id),
};

export function useStaff(filters: StaffFilters = {}) {
  return useQuery({
    queryKey: staffKeys.list(filters),
    queryFn:  () => staffService.getStaff(filters),
    placeholderData: keepPreviousData,
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn:  () => staffService.getStaffMember(id),
    enabled:  !!id,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffPayload) => staffService.createStaff(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.dashboard });
      toast.success("Staff member added");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "A staff member with this email already exists.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to add staff member"));
    },
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffPayload }) =>
      staffService.updateStaff(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: staffKeys.all });
      qc.invalidateQueries({ queryKey: staffKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: reportKeys.dashboard });
      toast.success("Staff member updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update staff member")),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.deleteStaff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.dashboard });
      toast.success("Staff member removed");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "This staff member can't be removed — they may have upcoming appointments.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to remove staff member"));
    },
  });
}

export function useUpdateStaffSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: Record<string, unknown> }) =>
      staffService.updateSchedule(id, schedule),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: staffKeys.all });
      qc.invalidateQueries({ queryKey: staffKeys.detail(vars.id) });
      toast.success("Schedule updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update schedule")),
  });
}
