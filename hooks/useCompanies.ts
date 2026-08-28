import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companyService } from "@/services/company.service";
import type { CreateCompanyPayload, UpdateCompanyPayload } from "@/services/company.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage, extractInvitationWarning } from "@/lib/utils";

export const companyKeys = {
  all: QUERY_KEYS.COMPANIES,
};

export function useCompanies(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: companyKeys.all,
    queryFn:  () => companyService.getCompanies(),
    enabled:  options.enabled ?? true,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCompanyPayload) => companyService.createCompany(input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: companyKeys.all });
      const invitationWarning = extractInvitationWarning(data);
      if (invitationWarning) {
        toast.warning("Company created — admin invitation issue", { description: invitationWarning });
      } else {
        toast.success("Company created");
      }
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "A company with this email already exists.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create company"));
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyPayload }) =>
      companyService.updateCompany(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.all });
      toast.success("Company updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update company")),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyService.deleteCompany(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.all });
      toast.success("Company deleted");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "This company can't be deleted — it still has active data attached.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete company"));
    },
  });
}
