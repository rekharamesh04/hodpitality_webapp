import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popup } from '@/lib/popup';
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
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: companyKeys.all });
      const invitationWarning = extractInvitationWarning(data);
      if (invitationWarning) {
        popup.warning("Company created — admin invitation issue", { description: invitationWarning });
      } else {
        popup.success("Company created", variables.email ? { description: `Invite sent to ${variables.email}` } : undefined);
      }
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return popup.error(err?.backendMessage ?? "A company with this email already exists.");
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create company"));
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
      popup.success("Company updated");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update company")),
  });
}

/** What the API reports when a company still holds records. */
export interface CompanyHasRecords {
  records: number;
  breakdown: Record<string, number>;
  message: string;
}

/**
 * Delete a company.
 *
 * A 409 here is not a failure — it is the API declining to strand the
 * company's records and reporting how many there are. The caller is expected
 * to ask the user and retry with `cascade`, so this reports it through
 * `onHasRecords` rather than as an error popup the user cannot act on.
 */
export function useDeleteCompany(options?: { onHasRecords?: (info: CompanyHasRecords) => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cascade }: { id: string; cascade?: boolean }) =>
      companyService.deleteCompany(id, cascade),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.all });
      popup.success("Company deleted");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 409 && typeof data?.records === "number") {
        if (options?.onHasRecords) {
          options.onHasRecords({
            records: data.records,
            breakdown: data.breakdown ?? {},
            message: data.error ?? "",
          });
          return;
        }
        return popup.error(data.error ?? "This company still has records attached.");
      }
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete company"));
    },
  });
}
