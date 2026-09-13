import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerService } from "@/services/customer.service";
import type { CustomerFilters, CreateCustomerPayload, UpdateCustomerPayload, Customer } from "@/services/customer.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage, getDuplicatePersonConflict } from "@/lib/utils";
import type { PaginatedResponse } from "@/types";

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

/** Customers have no login, so no invite is sent on create. A duplicate email returns 409 with the existing person's id. */
export function useCreateCustomer(options?: { onDuplicate?: (conflict: NonNullable<ReturnType<typeof getDuplicatePersonConflict>>) => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerPayload) => customerService.createCustomer(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Customer created");
    },
    onError: (err: any) => {
      const conflict = getDuplicatePersonConflict(err);
      if (conflict) {
        toast.error(conflict.message, { description: "Opening the existing record instead." });
        options?.onDuplicate?.(conflict);
        return;
      }
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to create customer"));
    },
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

function resolveCustomerId(c: Partial<Customer> | undefined | null): string {
  return c?.id ?? (c?.PK ? c.PK.replace("CUSTOMER#", "") : "") ?? "";
}

/**
 * The backend only ever returns a bare S3 key/private URL for `face_photo_url`, so
 * refetching after enroll can replace a working photo with one the browser can't load.
 * We already have the exact bytes that were just uploaded (the captured data URL), so
 * patch the cache with that directly instead of invalidating and trusting the refetch.
 */
export function useEnrollCustomerFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, image }: { customerId: string; image: string }) =>
      customerService.enrollFace(customerId, image),
    onSuccess: (result, { customerId, image }) => {
      if (result?.success === false) {
        toast.error(result.message ?? "Face enrollment failed");
        return;
      }
      const patch = { face_photo_url: image, face_enrolled: true };
      qc.setQueryData(customerKeys.detail(customerId), (old: Customer | undefined) =>
        old ? { ...old, ...patch } : old
      );
      qc.setQueriesData<PaginatedResponse<Customer>>({ queryKey: customerKeys.all }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((c) => (resolveCustomerId(c) === customerId ? { ...c, ...patch } : c)),
        };
      });
      toast.success("Face enrolled successfully");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? err?.response?.data?.error ?? "Face enrollment failed"),
  });
}

export function useUnenrollCustomerFace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) => customerService.unenrollFace(customerId),
    onSuccess: (_result, customerId) => {
      const patch = { face_photo_url: undefined, face_enrolled: false };
      qc.setQueryData(customerKeys.detail(customerId), (old: Customer | undefined) =>
        old ? { ...old, ...patch } : old
      );
      qc.setQueriesData<PaginatedResponse<Customer>>({ queryKey: customerKeys.all }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((c) => (resolveCustomerId(c) === customerId ? { ...c, ...patch } : c)),
        };
      });
      toast.success("Face removed");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to remove face")),
  });
}

