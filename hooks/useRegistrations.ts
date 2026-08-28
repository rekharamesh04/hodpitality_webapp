import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { registrationService } from '@/services/registration.service';
import { QUERY_KEYS } from '@/constants';
import { paymentKeys } from '@/hooks/usePayments';
import type { TableFilters, Registration } from '@/types';

export function useRegistrations(filters: TableFilters & { paymentStatus?: string; eventId?: string } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.REGISTRATIONS, filters],
    queryFn: () => registrationService.getRegistrations(filters),
  });
}

export function useCreateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Registration>) => registrationService.createRegistration(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS });
      toast.success('Registration created');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? 'Failed to create registration'),
  });
}

export function useUpdateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Registration> }) =>
      registrationService.updateRegistration(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS });
      toast.success('Registration updated');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? 'Failed to update registration'),
  });
}

export function useDeleteRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => registrationService.deleteRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS });
      toast.success('Registration removed');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? 'Failed to remove registration'),
  });
}

export function useConfirmRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => registrationService.confirmRegistration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS });
      toast.success('Registration confirmed');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? 'Failed to confirm registration'),
  });
}

export function useUpdateRegistrationPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Registration['paymentStatus'] }) =>
      registrationService.updatePaymentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.REGISTRATIONS });
      // The backend patch syncs a Payment record on every call to this endpoint too.
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      qc.invalidateQueries({ queryKey: paymentKeys.stats });
      toast.success('Payment status updated');
    },
    onError: (err: any) => toast.error(err?.backendMessage ?? 'Failed to update payment status'),
  });
}
