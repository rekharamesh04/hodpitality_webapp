import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentService } from "@/services/payment.service";
import type {
  PaymentFilters, CreatePaymentPayload, UpdatePaymentPayload, RefundPaymentPayload,
} from "@/services/payment.service";
import { QUERY_KEYS } from "@/constants";
import { getFriendlyErrorMessage } from "@/lib/utils";
import type { PaymentStatus } from "@/types";

export const paymentKeys = {
  all:    QUERY_KEYS.PAYMENTS,
  list:   (filters: PaymentFilters) => [...QUERY_KEYS.PAYMENTS, "list", filters] as const,
  detail: (id: string) => QUERY_KEYS.PAYMENT_DETAIL(id),
  stats:  QUERY_KEYS.PAYMENT_STATS,
};

export function usePayments(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn:  () => paymentService.getPayments(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn:  () => paymentService.getPayment(id),
    enabled:  !!id,
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats,
    queryFn:  paymentService.getPaymentStats,
  });
}

/** Mutations affect the Payment record, its detail, the stats aggregate, and the linked
 * Registration's paymentStatus (the backend syncs Payment -> Registration on every write). */
function invalidatePaymentSurfaces(qc: ReturnType<typeof useQueryClient>, paymentId?: string) {
  qc.invalidateQueries({ queryKey: paymentKeys.all });
  qc.invalidateQueries({ queryKey: paymentKeys.stats });
  qc.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS });
  if (paymentId) qc.invalidateQueries({ queryKey: paymentKeys.detail(paymentId) });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentPayload) => paymentService.createPayment(input),
    onSuccess: () => {
      invalidatePaymentSurfaces(qc);
      toast.success("Payment recorded");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to record payment")),
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentPayload }) =>
      paymentService.updatePayment(id, data),
    onSuccess: (_data, vars) => {
      invalidatePaymentSurfaces(qc, vars.id);
      toast.success("Payment updated");
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update payment")),
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      paymentService.updatePaymentStatus(id, status),
    onSuccess: (_data, vars) => {
      invalidatePaymentSurfaces(qc, vars.id);
      toast.success("Payment status updated");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 409) return toast.error(err?.backendMessage ?? "That status change isn't allowed from the payment's current status.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to update payment status"));
    },
  });
}

export function useRefundPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundPaymentPayload }) =>
      paymentService.refundPayment(id, data),
    onSuccess: (_data, vars) => {
      invalidatePaymentSurfaces(qc, vars.id);
      toast.success("Refund recorded");
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 400) return toast.error(err?.backendMessage ?? "Refund amount exceeds what's left to refund.");
      if (status === 409) return toast.error(err?.backendMessage ?? "This payment can't be refunded from its current status.");
      toast.error(err?.backendMessage ?? getFriendlyErrorMessage(err, "Failed to record refund"));
    },
  });
}
