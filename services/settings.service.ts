import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { User, Settings } from '@/types';

/** True `isDefault` means never set: the backend then uses Asia/Kolkata. */
export interface OrgTimezone {
  timezone: string;
  isDefault: boolean;
}

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

  async getTimezone(): Promise<OrgTimezone> {
    const { data } = await api.get<OrgTimezone>(API_ENDPOINTS.SETTINGS.TIMEZONE);
    return data;
  },

  async updateTimezone(timezone: string): Promise<OrgTimezone> {
    const { data } = await api.put<OrgTimezone>(API_ENDPOINTS.SETTINGS.TIMEZONE, { timezone });
    return data;
  },

  /** `mfaCode` is needed once two-factor is on: the backend signs in again to change the password. */
  async changePassword(payload: { currentPassword: string; newPassword: string; mfaCode?: string }): Promise<{ message: string }> {
    // Sent like every other request. The backend checks the current password for the signed-in
    // email and gets the access token Cognito's change_password needs itself — login never hands
    // one out, so asking for it here always failed.
    const { data } = await api.put<{ message: string }>(API_ENDPOINTS.SETTINGS.PASSWORD, payload);
    return data;
  },
};
