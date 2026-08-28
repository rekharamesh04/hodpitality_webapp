import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: resellerKeys.all });
      const invitationWarning = extractInvitationWarning(data);
      if (invitationWarning) {
        toast.warning("Reseller created — invitation issue", { description: invitationWarning });
      } else {
        toast.success("Reseller created");
      }
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "A reseller with this email already exists.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create reseller"));
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
      toast.success("Reseller updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update reseller")),
  });
}

export function useDeleteReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resellerService.deleteReseller(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resellerKeys.all });
      toast.success("Reseller deleted");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "This reseller can't be deleted — it still has companies attached.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete reseller"));
    },
  });
}
