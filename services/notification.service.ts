import api from '@/lib/axios';
import { unwrapList } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { Notification } from '@/types';

export const notificationService = {
  async getNotifications(params?: { read?: boolean; type?: string }): Promise<Notification[]> {
    const p = new URLSearchParams();
    if (params?.read !== undefined) p.set('read', String(params.read));
    if (params?.type) p.set('type', params.type);
    const { data } = await api.get(`${API_ENDPOINTS.NOTIFICATIONS}?${p}`);
    return unwrapList<Notification>(data);
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
