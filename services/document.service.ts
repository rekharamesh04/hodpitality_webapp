import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import { uploadService } from './upload.service';

/** Which directory the person lives in — the document routes hang off either. */
export type PersonEntity = 'guest' | 'customer';

export const DOCUMENT_CATEGORIES = [
  { value: 'lab_report', label: 'Lab report' },
  { value: 'scan', label: 'Scan / X-ray' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'referral', label: 'Referral letter' },
  { value: 'invoice', label: 'Invoice / receipt' },
  { value: 'other', label: 'Other' },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]['value'];

/** What the file picker accepts — the backend allows exactly these types for documents. */
export const DOCUMENT_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif';

export interface PersonDocument {
  id: string;
  personId: string;
  title: string;
  category: DocumentCategory;
  fileName?: string;
  contentType?: string;
  size?: number;
  notes?: string;
  /** Freshly signed on every read; expires, so never store it. */
  url?: string;
  uploadedBy?: string;
  uploadedById?: string;
  created_at?: string;
  createdAt?: string;
}

export interface UploadDocumentInput {
  file: File;
  title?: string;
  category: DocumentCategory;
  notes?: string;
}

function base(entity: PersonEntity, personId: string): string {
  return `${entity === 'customer' ? API_ENDPOINTS.CUSTOMERS : API_ENDPOINTS.GUESTS}/${personId}/documents`;
}

export const documentService = {
  async list(entity: PersonEntity, personId: string): Promise<PersonDocument[]> {
    const { data } = await api.get(base(entity, personId));
    return unwrapList<PersonDocument>(data);
  },

  /** File to S3 first, then the record of it. */
  async upload(entity: PersonEntity, personId: string, input: UploadDocumentInput): Promise<PersonDocument> {
    const s3Key = await uploadService.uploadDocument(input.file);
    const { data } = await api.post<PersonDocument>(base(entity, personId), {
      s3_key: s3Key,
      fileName: input.file.name,
      contentType: input.file.type,
      size: input.file.size,
      title: input.title?.trim() || undefined,
      category: input.category,
      notes: input.notes?.trim() || undefined,
    });
    return data;
  },

  async remove(entity: PersonEntity, personId: string, documentId: string): Promise<void> {
    await api.delete(`${base(entity, personId)}/${documentId}`);
  },
};
