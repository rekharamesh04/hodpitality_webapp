import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { CheckIn, CheckInStats, TableFilters } from '@/types';

export interface CheckInFilters extends TableFilters {}

function buildParams(filters: CheckInFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.status) p.set('status', filters.status);
  if (filters.search) p.set('search', filters.search);
  return p;
}

export const checkInService = {
  /** GET /check-ins returns a flat, unpaginated list (no page/limit/total in the response) — the page windows it client-side. */
  async getCheckIns(filters: CheckInFilters = {}): Promise<CheckIn[]> {
    const p = buildParams(filters);
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

  async checkInByFacial(payload: { image: string; venue?: string; eventId?: string }): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    guestId?: string;
    guestName?: string;
    matchConfidence?: number;
    checkin?: CheckIn;
  }> {
    const { data } = await api.post(`${API_ENDPOINTS.CHECK_INS}/facial-recognition`, payload);
    return data;
  },

  async printBadge(checkInId: string): Promise<{ printed: boolean }> {
    const { data } = await api.post<{ printed: boolean }>(
      `${API_ENDPOINTS.CHECK_INS}/${checkInId}/badge`
    );
    return data;
  },
};
