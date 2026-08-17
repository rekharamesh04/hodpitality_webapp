import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { CheckIn, CheckInStats, TableFilters } from '@/types';

export const checkInService = {
  async getCheckIns(filters: TableFilters = {}): Promise<CheckIn[]> {
    const p = new URLSearchParams();
    if (filters.status) p.set('status', filters.status);
    const { data } = await api.get(`${API_ENDPOINTS.CHECK_INS}?${p}`);
    return unwrapList<CheckIn>(data);
  },

  async getStats(): Promise<CheckInStats> {
    const { data } = await api.get<CheckInStats>(
      `${API_ENDPOINTS.CHECK_INS}/stats`
    );
    return data;
  },

  async checkIn(payload: { guestId?: string; method?: string; venue?: string; event?: string }): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(API_ENDPOINTS.CHECK_INS, {
      ...payload,
      checkInMethod: payload.method ?? 'Manual',
    });
    return data;
  },

  async quickCheckIn(payload: { guestId: string; method?: string; venue?: string }): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(`${API_ENDPOINTS.CHECK_INS}/quick`, {
      guestId: payload.guestId,
      method: payload.method ?? 'Manual',
      venue: payload.venue ?? 'Lobby',
    });
    return data;
  },

  async checkInByQr(qrCode: string, venue?: string): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(`${API_ENDPOINTS.CHECK_INS}/qr`, { qrCode, venue });
    return data;
  },

  async checkInByFacial(image: string, eventId?: string): Promise<CheckIn> {
    const { data } = await api.post<CheckIn>(`${API_ENDPOINTS.CHECK_INS}/facial-recognition`, { image, eventId });
    return data;
  },

  async printBadge(checkInId: string): Promise<{ printed: boolean }> {
    const { data } = await api.post<{ printed: boolean }>(
      `${API_ENDPOINTS.CHECK_INS}/${checkInId}/badge`
    );
    return data;
  },
};
