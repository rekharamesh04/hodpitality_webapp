import api from '@/lib/axios';
import { unwrapList, FULL_LIST_LIMIT } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Prescription, PrescriptionFilters, CreatePrescriptionPayload } from '@/types/prescription';

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

  async updatePrescription(id: string, payload: Partial<CreatePrescriptionPayload> & { status?: string }): Promise<Prescription> {
    const { data } = await api.put<Prescription>(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}`, payload);
    return data;
  },

  async deletePrescription(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}`);
  },
};
