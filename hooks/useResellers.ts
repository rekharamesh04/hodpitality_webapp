import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popup } from '@/lib/popup';
import { resellerService } from "@/services/reseller.service";
import type { CreateResellerPayload, UpdateResellerPayload } from "@/services/reseller.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage, extractInvitationWarning } from "@/lib/utils";

export const resellerKeys = {
  all: QUERY_KEYS.RESELLERS,
};

export function useResellers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: resellerKeys.all,
    queryFn:  () => resellerService.getResellers(),
    enabled:  options.enabled ?? true,
  });
}

export function useCreateReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResellerPayload) => resellerService.createReseller(input),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: resellerKeys.all });
      const invitationWarning = extractInvitationWarning(data);
      if (invitationWarning) {
        popup.warning("Reseller created — invitation issue", { description: invitationWarning });
      } else {
        popup.success("Reseller created", variables.email ? { description: `Invite sent to ${variables.email}` } : undefined);
      }
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return popup.error(err?.backendMessage ?? "A reseller with this email already exists.");
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create reseller"));
    },
  });
}

export function useUpdateReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResellerPayload }) =>
      resellerService.updateReseller(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resellerKeys.all });
      popup.success("Reseller updated");
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update reseller")),
  });
}

export function useDeleteReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resellerService.deleteReseller(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resellerKeys.all });
      popup.success("Reseller deleted");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return popup.error(err?.backendMessage ?? "This reseller can't be deleted — it still has companies attached.");
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete reseller"));
    },
  });
}
