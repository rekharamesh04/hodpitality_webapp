import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { popup } from '@/lib/popup';
import { pharmacyService } from '@/services/pharmacy.service';
import { billingService } from '@/services/billing.service';
import { prescriptionKeys } from '@/hooks/usePrescriptions';
import { getFriendlyErrorMessage } from '@/lib/utils';

export const pharmacyKeys = {
  list: ['pharmacies'] as const,
  billing: ['settings', 'billing'] as const,
};

/** The pharmacy directory. Rarely changes, so it is kept for a few minutes. */
export function usePharmacies(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: pharmacyKeys.list,
    queryFn: pharmacyService.list,
    enabled: options.enabled ?? true,
    staleTime: 5 * 60_000,
  });
}

export function useSendToPharmacy({ announce = true }: { announce?: boolean } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ prescriptionId, pharmacyTenantId }: { prescriptionId: string; pharmacyTenantId: string }) =>
      pharmacyService.send(prescriptionId, pharmacyTenantId),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      if (announce) popup.success(`Sent to ${result.pharmacyName}`, { description: 'It is in their worklist to fill.' });
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not send to the pharmacy')),
  });
}

/** Mark a prescription filled and waiting at the counter. */
export function useMarkPrescriptionReady() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionId: string) => pharmacyService.markReady(prescriptionId),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      popup.success(result.alreadyReady ? 'Already marked ready' : 'Ready for pickup', {
        description: result.alreadyReady ? undefined : 'The patient has been told by email, when they have one.',
      });
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not mark it ready')),
  });
}

/** The standard visit fee checkout charges. Every staff role may read it. */
export function useBillingSettings(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: pharmacyKeys.billing,
    queryFn: billingService.get,
    enabled: options.enabled ?? true,
  });
}

export function useUpdateBillingSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingService.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pharmacyKeys.billing });
      popup.success('Standard visit fee saved');
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not save the fee')),
  });
}
