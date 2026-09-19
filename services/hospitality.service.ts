import api from '@/lib/axios';
import { unwrapList, FULL_LIST_LIMIT } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Guest, Hospitality as HospitalityBooking, TableFilters } from '@/types';

/** GET /hospitality/vip-guests item: a normal guest record plus the guest's hospitality bookings. */
export type VipGuest = Guest & { hospitalityBookings?: HospitalityBooking[] };

export const hospitalityService = {
  async getBookings(filters: TableFilters & { guestId?: string; type?: string } = {}): Promise<HospitalityBooking[]> {
    const p = new URLSearchParams();
    if (filters.status)  p.set('status',  filters.status);
    if (filters.type)    p.set('type',    filters.type);
    if (filters.guestId) p.set('guestId', filters.guestId);
    p.set('limit', String(FULL_LIST_LIMIT));
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

  /** Guests whose category (or tier) is "VIP", any case. Without `limit` the backend returns all of them. */
  async getVipGuests(): Promise<VipGuest[]> {
    const { data } = await api.get(`${API_ENDPOINTS.HOSPITALITY}/vip-guests`);
    return unwrapList<VipGuest>(data);
  },

  async getGuestBookings(guestId: string): Promise<HospitalityBooking[]> {
    const { data } = await api.get(`${API_ENDPOINTS.HOSPITALITY}/guest/${guestId}`);
    return unwrapList<HospitalityBooking>(data);
  },
};
