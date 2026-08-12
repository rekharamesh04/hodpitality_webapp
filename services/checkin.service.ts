import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { CheckIn, CheckInStats, CursorPaginatedResponse, TableFilters } from '@/types';

export const checkInService = {
  async getCheckIns(filters: TableFilters = {}): Promise<CursorPaginatedResponse<CheckIn>> {
    const p = new URLSearchParams();
    p.set('limit', String(filters.limit ?? 50));
    if (filters.cursor) p.set('cursor', filters.cursor);
    if (filters.search) p.set('search', filters.search);
    if (filters.status) p.set('status', filters.status);
    const { data } = await api.get<CursorPaginatedResponse<CheckIn>>(
      `${API_ENDPOINTS.CHECK_INS}?${p}`
    );
    return data;
  },

  async getStats(): Promise<CheckInStats> {
    const { data } = await api.get<CheckInStats>(
      `${API_ENDPOINTS.CHECK_INS}/stats`
    );
    return data;
  },

  async checkIn(payload: { guestId?: string; method?: string; venue?: string }): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(API_ENDPOINTS.CHECK_INS, payload);
    return data;
  },

  async quickCheckIn(payload: { guestId: string; method?: string }): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(`${API_ENDPOINTS.CHECK_INS}/quick`, payload);
    return data;
  },

  async checkInByQr(qrCode: string, venue?: string): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(`${API_ENDPOINTS.CHECK_INS}/qr`, { qrCode, venue });
    return data;
  },

  async checkInByFacial(imageData: string): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(`${API_ENDPOINTS.CHECK_INS}/facial-recognition`, { imageData });
    return data;
  },

  async printBadge(checkInId: string): Promise<{ printed: boolean }> {
    const { data } = await api.post<{ printed: boolean }>(
      `${API_ENDPOINTS.CHECK_INS}/${checkInId}/badge`
    );
    return data;
  },
};
