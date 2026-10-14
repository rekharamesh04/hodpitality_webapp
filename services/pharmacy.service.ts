import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Pharmacy } from '@/types/prescription';

/**
 * Sending a prescription to the patient's own pharmacy.
 *
 * In the US the doctor's office and the pharmacy are different providers (a CVS downstairs is not
 * the hospital's), so a prescription is transmitted to the pharmacy the patient chose. The pharmacy
 * receives its own copy and fills it in its own worklist; the sender sees how far it got.
 */
export const pharmacyService = {
  /** GET /pharmacies — active pharmacies on the platform: name and contact details only. */
  async list(): Promise<Pharmacy[]> {
    const { data } = await api.get(API_ENDPOINTS.PHARMACIES);
    return unwrapList<Pharmacy>(data);
  },

  /** POST /prescriptions/{id}/ready — filled; emails the patient and tells the sender. Idempotent. */
  async markReady(prescriptionId: string): Promise<{ readyAt: string; alreadyReady?: boolean }> {
    const { data } = await api.post(`${API_ENDPOINTS.PRESCRIPTIONS}/${prescriptionId}/ready`);
    return data;
  },

  /** POST /prescriptions/{id}/send — only a typed, active, unsent prescription can go. */
  async send(prescriptionId: string, pharmacyTenantId: string): Promise<{ pharmacyName: string; pharmacyStatus: string }> {
    const { data } = await api.post(`${API_ENDPOINTS.PRESCRIPTIONS}/${prescriptionId}/send`, { pharmacyTenantId });
    return data;
  },
};
