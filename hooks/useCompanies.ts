import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companyService } from "@/services/company.service";
import { QUERY_KEYS } from "@/constants";
import type { TableFilters, Company } from "@/types";

export function useCompanies(filters: TableFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.COMPANIES, "list", filters],
    queryFn:  () => companyService.getCompanies(filters),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.COMPANY_DETAIL(id),
    queryFn:  () => companyService.getCompany(id),
    enabled:  !!id,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Company>) => companyService.createCompany(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
      toast.success("Company created");
    },
    onError: () => toast.error("Failed to create company"),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      companyService.updateCompany(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
      toast.success("Company updated");
    },
    onError: () => toast.error("Failed to update company"),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyService.deleteCompany(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COMPANIES });
      toast.success("Company removed");
    },
    onError: () => toast.error("Failed to remove company"),
  });
}
