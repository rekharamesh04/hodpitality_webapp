import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { popup } from '@/lib/popup';
import { documentService } from '@/services/document.service';
import type { PersonEntity, UploadDocumentInput } from '@/services/document.service';
import { getFriendlyErrorMessage } from '@/lib/utils';
import { QUERY_KEYS } from '@/constants';

export const documentKeys = {
  person: (entity: PersonEntity, personId: string) => ['person-documents', entity, personId] as const,
};

export function usePersonDocuments(entity: PersonEntity, personId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: documentKeys.person(entity, personId),
    queryFn: () => documentService.list(entity, personId),
    enabled: !!personId && (options?.enabled ?? true),
    // Each row carries a signed link that expires after a few minutes.
    staleTime: 60_000,
  });
}

export function useUploadPersonDocument(entity: PersonEntity, personId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadDocumentInput) => documentService.upload(entity, personId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.person(entity, personId) });
      popup.success('Document added');
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to upload document')),
  });
}

export function useDeletePersonDocument(entity: PersonEntity, personId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentService.remove(entity, personId, documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.person(entity, personId) });
      // The document may be a photo attached to one of their prescriptions.
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTIONS });
      popup.success('Document deleted');
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Failed to delete document')),
  });
}
