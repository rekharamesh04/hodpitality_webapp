import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { popup } from '@/lib/popup';
import { prescriptionService } from '@/services/prescription.service';
import { QUERY_KEYS } from '@/constants';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { CreatePrescriptionPayload, Prescription, PrescriptionFilters } from '@/types/prescription';

/** Prescription photos are person documents too, so their Documents lists go stale with them. */
const PERSON_DOCUMENTS_KEY = ['person-documents'] as const;

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

/**
 * Uploads photos of the paper prescription one at a time, in page order.
 *
 * Resolves with the files that failed rather than throwing, because by now the
 * prescription itself is saved: the caller says which pages to add again
 * instead of reporting the whole save as failed.
 */
export function useAddPrescriptionAttachments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, files }: { id: string; files: File[] }) => {
      const failed: { file: File; error: string }[] = [];
      for (const file of files) {
        try {
          await prescriptionService.addAttachment(id, file);
        } catch (err: any) {
          failed.push({ file, error: err?.backendMessage ?? getFriendlyErrorMessage(err, 'Upload failed') });
        }
      }
      return { added: files.length - failed.length, failed };
    },
    onSettled: (_res, _err, vars) => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      qc.invalidateQueries({ queryKey: prescriptionKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: PERSON_DOCUMENTS_KEY });
    },
  });
}

export function useRemovePrescriptionAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, attachmentId }: { id: string; attachmentId: string }) =>
      prescriptionService.removeAttachment(id, attachmentId),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      qc.invalidateQueries({ queryKey: prescriptionKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: PERSON_DOCUMENTS_KEY });
      popup.success('Photo removed');
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not remove the photo')),
  });
}

export function useDeletePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionService.deletePrescription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionKeys.all });
      qc.invalidateQueries({ queryKey: PERSON_DOCUMENTS_KEY });
      popup.success('Prescription deleted');
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not delete the prescription')),
  });
}
