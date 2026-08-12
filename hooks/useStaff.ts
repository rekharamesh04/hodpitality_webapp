import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { staffService } from "@/services/staff.service";
import { QUERY_KEYS } from "@/constants";
import type { TableFilters, Staff } from "@/types";

export function useStaff(filters: TableFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.STAFF, "list", filters],
    queryFn:  () => staffService.getStaff(filters),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.STAFF_DETAIL(id),
    queryFn:  () => staffService.getStaffMember(id),
    enabled:  !!id,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Staff>) => staffService.createStaff(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      toast.success("Staff member added");
    },
    onError: () => toast.error("Failed to add staff member"),
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Staff> }) =>
      staffService.updateStaff(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      toast.success("Staff member updated");
    },
    onError: () => toast.error("Failed to update staff member"),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.deleteStaff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      toast.success("Staff member removed");
    },
    onError: () => toast.error("Failed to remove staff member"),
  });
}

export function useUpdateStaffSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: Record<string, unknown> }) =>
      staffService.updateSchedule(id, schedule),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.STAFF });
      toast.success("Schedule updated");
    },
    onError: () => toast.error("Failed to update schedule"),
  });
}
