import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resellerService } from "@/services/reseller.service";
import { QUERY_KEYS } from "@/constants";
import type { TableFilters, Reseller } from "@/types";

export function useResellers(filters: TableFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.RESELLERS, "list", filters],
    queryFn:  () => resellerService.getResellers(filters),
  });
}

export function useReseller(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.RESELLER_DETAIL(id),
    queryFn:  () => resellerService.getReseller(id),
    enabled:  !!id,
  });
}

export function useCreateReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Reseller>) => resellerService.createReseller(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.RESELLERS });
      toast.success("Reseller created");
    },
    onError: () => toast.error("Failed to create reseller"),
  });
}

export function useUpdateReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reseller> }) =>
      resellerService.updateReseller(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.RESELLERS });
      toast.success("Reseller updated");
    },
    onError: () => toast.error("Failed to update reseller"),
  });
}

export function useDeleteReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resellerService.deleteReseller(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.RESELLERS });
      toast.success("Reseller removed");
    },
    onError: () => toast.error("Failed to remove reseller"),
  });
}
