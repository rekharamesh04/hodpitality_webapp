import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Hospitality as HospitalityBooking, TableFilters } from '@/types';

export const hospitalityService = {
  async getBookings(filters: TableFilters & { guestId?: string; type?: string } = {}): Promise<HospitalityBooking[]> {
    const p = new URLSearchParams();
    if (filters.status)  p.set('status',  filters.status);
    if (filters.type)    p.set('type',    filters.type);
    if (filters.guestId) p.set('guestId', filters.guestId);
    const { data } = await api.get(`${API_ENDPOINTS.HOSPITALITY}?${p}`);
    return unwrapList<HospitalityBooking>(data);
  },

  async getBooking(id: string): Promise<HospitalityBooking> {
    const { data } = await api.get<HospitalityBooking>(`${API_ENDPOINTS.HOSPITALITY}/${id}`);
    return data;
  },

  async createBooking(input: Partial<HospitalityBooking>): Promise<HospitalityBooking> {
    const { data } = await api.post<HospitalityBooking>(API_ENDPOINTS.HOSPITALITY, input);
    return data;
  },

  async updateBookingStatus(id: string, status: HospitalityBooking['status']): Promise<{ success: boolean }> {
    const { data } = await api.put<{ success: boolean }>(`${API_ENDPOINTS.HOSPITALITY}/${id}/status`, { status });
    return data;
  },

  async deleteBooking(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.HOSPITALITY}/${id}`);
  },

  async getVipGuests(): Promise<HospitalityBooking[]> {
    const { data } = await api.get(`${API_ENDPOINTS.HOSPITALITY}/vip-guests`);
    return unwrapList<HospitalityBooking>(data);
  },

  async getGuestBookings(guestId: string): Promise<HospitalityBooking[]> {
    const { data } = await api.get(`${API_ENDPOINTS.HOSPITALITY}/guest/${guestId}`);
    return unwrapList<HospitalityBooking>(data);
  },
};
