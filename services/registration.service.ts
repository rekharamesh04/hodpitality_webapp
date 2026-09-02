import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Registration, TableFilters } from '@/types';

export interface UpdateRegistrationPaymentPayload {
  paymentStatus: Registration['paymentStatus'];
  status?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export const registrationService = {
  async getRegistrations(filters: TableFilters & { paymentStatus?: string; eventId?: string } = {}): Promise<Registration[]> {
    const p = new URLSearchParams();
    if (filters.status)        p.set('status', filters.status);
    if (filters.paymentStatus) p.set('paymentStatus', filters.paymentStatus);
    if (filters.eventId)       p.set('eventId', filters.eventId);
    if (filters.limit)         p.set('limit', String(filters.limit));
    const { data } = await api.get(`${API_ENDPOINTS.REGISTRATIONS}?${p}`);
    return unwrapList<Registration>(data);
  },

  async createRegistration(input: Partial<Registration>): Promise<Registration> {
    const { data } = await api.post<Registration>(API_ENDPOINTS.REGISTRATIONS, input);
    return data;
  },

  async updateRegistration(id: string, input: Partial<Registration>): Promise<Registration> {
    const { data } = await api.put<Registration>(`${API_ENDPOINTS.REGISTRATIONS}/${id}`, input);
    return data;
  },

  async deleteRegistration(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.REGISTRATIONS}/${id}`);
  },

  async confirmRegistration(id: string): Promise<{ success: boolean }> {
    const { data } = await api.post<{ success: boolean }>(`${API_ENDPOINTS.REGISTRATIONS}/${id}/confirm`);
    return data;
  },

  /**
   * POST /registrations/{id}/payment
   * Notifies the backend ledger that a payment has been received for an event registration.
   * Accepts { paymentStatus, amount?, currency?, paymentMethod?, transactionId? }.
   * The backend syncs a linked Payment record on every call to this endpoint.
   */
  async updatePaymentStatus(
    id: string,
    payloadOrStatus: Registration['paymentStatus'] | UpdateRegistrationPaymentPayload,
    amount?: number,
  ): Promise<{ success: boolean; paymentStatus?: string }> {
    const payload: Record<string, unknown> = {};
    if (typeof payloadOrStatus === 'string') {
      payload.paymentStatus = payloadOrStatus;
      payload.status = payloadOrStatus;
      if (amount !== undefined) payload.amount = amount;
    } else {
      payload.paymentStatus = payloadOrStatus.paymentStatus ?? payloadOrStatus.status ?? 'paid';
      payload.status = payload.paymentStatus;
      if (payloadOrStatus.amount !== undefined) payload.amount = payloadOrStatus.amount;
      if (payloadOrStatus.currency) payload.currency = payloadOrStatus.currency;
      if (payloadOrStatus.paymentMethod) payload.paymentMethod = payloadOrStatus.paymentMethod;
      if (payloadOrStatus.transactionId) payload.transactionId = payloadOrStatus.transactionId;
    }
    const { data } = await api.post<{ success: boolean; paymentStatus?: string }>(
      `${API_ENDPOINTS.REGISTRATIONS}/${id}/payment`,
      payload,
    );
    return data;
  },
};
