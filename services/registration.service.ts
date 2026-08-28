import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Registration, TableFilters } from '@/types';

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

  async updatePaymentStatus(id: string, status: Registration['paymentStatus']): Promise<{ success: boolean }> {
    const { data } = await api.post<{ success: boolean }>(`${API_ENDPOINTS.REGISTRATIONS}/${id}/payment`, { status });
    return data;
  },
};
