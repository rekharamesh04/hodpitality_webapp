import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Notification, CursorPaginatedResponse } from '@/types';

export const notificationService = {
  async getNotifications(params?: { limit?: number; cursor?: string }): Promise<CursorPaginatedResponse<Notification>> {
    const p = new URLSearchParams();
    p.set('limit', String(params?.limit ?? 50));
    if (params?.cursor) p.set('cursor', params.cursor);
    const { data } = await api.get<CursorPaginatedResponse<Notification>>(
      `${API_ENDPOINTS.NOTIFICATIONS}?${p}`
    );
    return data;
  },

  async markRead(id: string): Promise<void> {
    await api.put(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.put(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
  },

  async deleteAll(): Promise<void> {
    await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/all`);
  },
};
