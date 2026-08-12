import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { User, Settings } from '@/types';

export const settingsService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.SETTINGS.PROFILE);
    return data;
  },

  async updateProfile(input: Partial<User>): Promise<User> {
    const { data } = await api.put<User>(API_ENDPOINTS.SETTINGS.PROFILE, input);
    return data;
  },

  async updateOrganisation(input: Partial<Settings['organization']>): Promise<Settings['organization']> {
    const { data } = await api.put<Settings['organization']>(API_ENDPOINTS.SETTINGS.ORGANISATION, input);
    return data;
  },

  async updateNotificationPreferences(prefs: Partial<Settings['notifications']>): Promise<Settings['notifications']> {
    const { data } = await api.put<Settings['notifications']>(API_ENDPOINTS.SETTINGS.NOTIFICATIONS, prefs);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const { data } = await api.put<{ message: string }>(API_ENDPOINTS.SETTINGS.PASSWORD, payload);
    return data;
  },
};
