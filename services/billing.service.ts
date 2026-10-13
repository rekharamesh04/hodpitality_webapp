import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';

/** What checkout charges for a visit with no fee of its own. */
export interface BillingSettings {
  standardVisitFee: number;
  currency: string;
  /** True while the organisation has not set its own fee (the API's default applies). */
  isDefault?: boolean;
}

export const billingService = {
  async get(): Promise<BillingSettings> {
    const { data } = await api.get<BillingSettings>(API_ENDPOINTS.SETTINGS.BILLING);
    return data;
  },

  /** Administrators only — the API answers 403 to anyone else. */
  async update(input: { standardVisitFee: number; currency: string }): Promise<BillingSettings> {
    const { data } = await api.put<BillingSettings>(API_ENDPOINTS.SETTINGS.BILLING, input);
    return data;
  },
};
