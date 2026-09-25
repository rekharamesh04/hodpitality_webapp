import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { popup } from '@/lib/popup';
import { prescriptionService } from '@/services/prescription.service';
import { QUERY_KEYS } from '@/constants';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { CreatePrescriptionPayload, Prescription, PrescriptionFilters } from '@/types/prescription';

export const prescriptionKeys = {
  all: QUERY_KEYS.PRESCRIPTIONS,
  list: (filters: PrescriptionFilters) => [...QUERY_KEYS.PRESCRIPTIONS, 'list', filters] as const,
  detail: (id: string) => QUERY_KEYS.PRESCRIPTION_DETAIL(id),
};

export function usePrescriptions(filters: PrescriptionFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: prescriptionKeys.list(filters),
    queryFn: () => prescriptionService.getPrescriptions(filters),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function usePrescription(id: string) {
  return useQuery<Prescription>({
    queryKey: prescriptionKeys.detail(id),
    queryFn: () => prescriptionService.getPrescription(id),
    enabled: !!id,
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => prescriptionService.createPrescription(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      popup.success('Prescription created');
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not create the prescription')),
  });
}

export function useUpdatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePrescriptionPayload> & { status?: string } }) =>
      prescriptionService.updatePrescription(id, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      qc.invalidateQueries({ queryKey: prescriptionKeys.detail(vars.id) });
      popup.success('Prescription updated');
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not update the prescription')),
  });
}

export function useDeletePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionService.deletePrescription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      popup.success('Prescription deleted');
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not delete the prescription')),
  });
}
