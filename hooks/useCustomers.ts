import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerService } from "@/services/customer.service";
import type { CustomerFilters, CreateCustomerPayload, UpdateCustomerPayload } from "@/services/customer.service";
import { QUERY_KEYS } from "@/constants";
import { setLocalAvatar } from "@/lib/local-avatars";
import { getFriendlyErrorMessage } from "@/lib/utils";

export const customerKeys = {
  all:    QUERY_KEYS.CUSTOMERS,
  list:   (filters: CustomerFilters) => [...QUERY_KEYS.CUSTOMERS, "list", filters] as const,
  detail: (id: string) => QUERY_KEYS.CUSTOMER_DETAIL(id),
};

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn:  () => customerService.getCustomers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn:  () => customerService.getCustomer(id),
    enabled:  !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerPayload) => customerService.createCustomer(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Customer created");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create customer")),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerPayload }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.detail(vars.id) });
      toast.success("Customer updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update customer")),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Customer deleted");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to delete customer")),
  });
}

export function useEnrollCustomerFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, image }: { customerId: string; image: string }) =>
      customerService.enrollFace(customerId, { image }),
    onSuccess: (result, { customerId, image }) => {
      if (result?.success === false) {
        toast.error(result.message ?? "Face enrollment failed");
        return;
      }
      // The enroll response doesn't echo back a viewable photo, so cache the
      // captured image locally — same pattern as guest face enrollment.
      setLocalAvatar(`customer:${customerId}`, image);
      qc.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      toast.success("Face enrolled successfully");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? err?.response?.data?.error ?? "Face enrollment failed"),
  });
}

export function useLinkCustomerAccount() {
  return useMutation({
    mutationFn: ({ customerId, userId }: { customerId: string; userId?: string }) =>
      customerService.linkAccount(customerId, userId),
    onSuccess: () => toast.success("Account linked successfully"),
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error("This customer is already linked to an account.");
      if (status === 403) return toast.error("You don't have permission to link accounts.");
      if (status === 404) return toast.error("Customer or account not found.");
      if (status === 400) return toast.error(err?.backendMessage ?? "Invalid account link request.");
      toast.error(err?.backendMessage ?? "Failed to link account");
    },
  });
}
