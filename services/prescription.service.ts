import api from '@/lib/axios';
import { unwrapList, FULL_LIST_LIMIT } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import { uploadService } from './upload.service';
import type {
  Prescription, PrescriptionAttachment, PrescriptionFilters, CreatePrescriptionPayload,
  ControlledDispense, ControlledIdCheck,
} from '@/types/prescription';

/**
 * The prescriptions API.
 *
 * Shapes follow what the backend actually stores (see create_prescription in
 * hospitality_lambda.py), not what a dispensing pharmacy would ideally hold.
 * The record is a *clinical* prescription — a practitioner writing medicines
 * for a patient, usually against an appointment — so there is no fill, claim,
 * will-call bin or pickup on it. Those would be a separate entity referencing
 * this one; see docs/PHARMACY_MODULE.md.
 *
 * The list endpoint enriches rows with patient and practitioner names server
 * side, so no second fetch is needed to render a table.
 */
export const prescriptionService = {
  /** The worklist filters in the browser over one fetched set, so it asks for everything. */
  async getPrescriptions(filters: PrescriptionFilters = {}): Promise<Prescription[]> {
    const p = new URLSearchParams();
    if (filters.status) p.set('status', filters.status);
    if (filters.search) p.set('search', filters.search);
    p.set('limit', String(filters.limit ?? FULL_LIST_LIMIT));
    const { data } = await api.get(`${API_ENDPOINTS.PRESCRIPTIONS}?${p}`);
    return unwrapList<Prescription>(data);
  },

  async getPrescription(id: string): Promise<Prescription> {
    const { data } = await api.get<Prescription>(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}`);
    return data;
  },

  async createPrescription(payload: CreatePrescriptionPayload): Promise<Prescription> {
    const { data } = await api.post<Prescription>(API_ENDPOINTS.PRESCRIPTIONS, payload);
    return data;
  },

  async updatePrescription(
    id: string,
    payload: Partial<CreatePrescriptionPayload> & { status?: string; dispenseCheck?: { signoffId: string } },
  ): Promise<Prescription> {
    const { data } = await api.put<Prescription>(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}`, payload);
    return data;
  },

  /**
   * The two-factor sign-off for handing over controlled medicines: the counter's own password and
   * authenticator code, plus the collector's ID. Returns a sign-off id that each controlled
   * prescription in this collection is completed with; it lapses after five minutes.
   */
  async createControlledSignoff(
    check: ControlledIdCheck & { password: string; mfaCode: string },
  ): Promise<{ signoffId: string; expiresAt: string }> {
    const { data } = await api.post<{ signoffId: string; expiresAt: string }>(
      `${API_ENDPOINTS.PRESCRIPTIONS}/controlled-signoff`, check,
    );
    return data;
  },

  /** The controlled-substance register (administrators only). */
  async getControlledLog(): Promise<ControlledDispense[]> {
    const { data } = await api.get(`${API_ENDPOINTS.PRESCRIPTIONS}/controlled-log`);
    return unwrapList<ControlledDispense>(data);
  },

  async deletePrescription(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}`);
  },

  /** A photo or PDF of the paper prescription: the file to S3 first, then the record of it. */
  async addAttachment(id: string, file: File): Promise<PrescriptionAttachment> {
    const s3Key = await uploadService.uploadDocument(file);
    const { data } = await api.post<PrescriptionAttachment>(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}/attachments`, {
      s3_key: s3Key,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });
    return data;
  },

  async removeAttachment(id: string, attachmentId: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}/attachments/${attachmentId}`);
  },
};
