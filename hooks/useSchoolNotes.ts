import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { popup } from '@/lib/popup';
import { getFriendlyErrorMessage } from '@/lib/utils';
import {
  schoolNoteService,
  type CreateSchoolNotePayload,
  type SchoolNote,
  type SchoolNoteDelivery,
  type SchoolNoteFilters,
  type SchoolNoteRecipient,
} from '@/services/school-note.service';

export const schoolNoteKeys = {
  all: ['school-notes'] as const,
  list: (filters: SchoolNoteFilters) => ['school-notes', 'list', filters] as const,
};

export const RECIPIENT_LABEL: Record<SchoolNoteRecipient, string> = {
  guardian: 'parent or guardian',
  school: 'school',
  patient: 'patient',
};

/** One line per recipient: who got it, or why they did not. */
export function describeDeliveries(sent: SchoolNoteDelivery[] = []): { ok: string[]; failed: string[] } {
  const ok: string[] = [];
  const failed: string[] = [];
  for (const d of sent) {
    if (d.ok) ok.push(`${d.name || RECIPIENT_LABEL[d.to]}${d.email ? ` (${d.email})` : ''}`);
    else failed.push(`${RECIPIENT_LABEL[d.to] ?? d.to}: ${d.error || 'not sent'}`);
  }
  return { ok, failed };
}

export function useSchoolNotes(filters: SchoolNoteFilters, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: schoolNoteKeys.list(filters),
    queryFn: () => schoolNoteService.list(filters),
    enabled: (options.enabled ?? true) && !!(filters.personId || filters.appointmentId || filters.code),
  });
}

export function useCreateSchoolNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchoolNotePayload) => schoolNoteService.create(payload),
    onSuccess: (note: SchoolNote) => {
      qc.invalidateQueries({ queryKey: schoolNoteKeys.all });
      const { ok, failed } = describeDeliveries(note.sent);
      const description = [
        ok.length ? `Emailed to ${ok.join(', ')}.` : '',
        failed.length ? `Not sent — ${failed.join(' ')}` : '',
      ].filter(Boolean).join(' ');
      if (failed.length) popup.warning(`School note ${note.code} issued`, { description });
      else popup.success(`School note ${note.code} issued`, description ? { description } : undefined);
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not issue the school note')),
  });
}

export function useSendSchoolNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: SchoolNoteRecipient }) => schoolNoteService.send(id, to),
    onSuccess: (note: SchoolNote) => {
      qc.invalidateQueries({ queryKey: schoolNoteKeys.all });
      const { ok, failed } = describeDeliveries(note.sent);
      if (failed.length) popup.error('The note was not sent', { description: failed.join(' ') });
      else popup.success('School note sent', ok.length ? { description: `Emailed to ${ok.join(', ')}.` } : undefined);
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not send the school note')),
  });
}

export function useVoidSchoolNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => schoolNoteService.voidNote(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolNoteKeys.all });
      popup.success('School note voided', { description: 'It stays on record and can no longer be sent.' });
    },
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not void the school note')),
  });
}

export function useDownloadSchoolNote() {
  return useMutation({
    mutationFn: (id: string) => schoolNoteService.download(id),
    onError: (err: any) =>
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not download the school note')),
  });
}
