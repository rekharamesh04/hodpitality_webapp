import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Hospitality as HospitalityBooking, CursorPaginatedResponse, TableFilters } from '@/types';

export const hospitalityService = {
  async getBookings(filters: TableFilters = {}): Promise<CursorPaginatedResponse<HospitalityBooking>> {
    const p = new URLSearchParams();
    p.set('limit', String(filters.limit ?? 50));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    if (filters.status) p.set('status', filters.status);
    const { data } = await api.get<CursorPaginatedResponse<HospitalityBooking>>(
      `${API_ENDPOINTS.HOSPITALITY}?${p}`
    );
    return data;
  },

  async createBooking(input: Partial<HospitalityBooking>): Promise<HospitalityBooking> {
    const { data } = await api.post<HospitalityBooking>(API_ENDPOINTS.HOSPITALITY, input);
    return data;
  },

  async updateBookingStatus(id: string, status: HospitalityBooking['status']): Promise<HospitalityBooking> {
    const { data } = await api.put<HospitalityBooking>(`${API_ENDPOINTS.HOSPITALITY}/${id}`, { status });
    return data;
  },

  async getVipGuests(): Promise<HospitalityBooking[]> {
    const p = new URLSearchParams({ isVip: 'true', limit: '100' });
    const { data } = await api.get<CursorPaginatedResponse<HospitalityBooking>>(
      `${API_ENDPOINTS.HOSPITALITY}?${p}`
    );
    return data.data;
  },
};
