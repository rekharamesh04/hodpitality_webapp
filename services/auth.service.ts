import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import { STORAGE_KEYS } from '@/constants';
import type { LoginCredentials, AuthResponse as LoginResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    let raw: unknown;
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      raw = data;
      console.log('[LOGIN] raw response ←', JSON.stringify(data));
    } catch (err: any) {
      const resp = err?.response;
      console.error('[LOGIN] HTTP error ←', resp?.status, JSON.stringify(resp?.data ?? err?.message));
      throw err;
    }
    const data = raw as LoginResponse;
    if (typeof window !== 'undefined') {
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        // Cookie must match middleware cookie name
        document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
      // Store the Access Token separately — required for PUT /settings/password
      if (data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      }
    }
    return data;
  },

  /** Complete a NEW_PASSWORD_REQUIRED Cognito challenge and receive the real token. */
  async respondChallenge(payload: { email: string; session: string; newPassword: string }): Promise<LoginResponse> {
    console.log('[CHALLENGE] calling POST /auth/login (challenge mode)...');
    let raw: unknown;
    try {
      // Backend detects session+newPassword in the body and runs RespondToAuthChallenge internally
      const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      raw = data;
      console.log('[CHALLENGE] raw response ←', JSON.stringify(data));
    } catch (err: any) {
      console.error('[CHALLENGE] HTTP error ←', err?.response?.status, JSON.stringify(err?.response?.data));
      throw err;
    }
    const data = raw as LoginResponse;
    if (typeof window !== 'undefined') {
      if (data.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        console.log('[CHALLENGE] token stored in localStorage and cookie');
      } else {
        console.warn('[CHALLENGE] No token field in respond-challenge response');
      }
      if (data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      }
    }
    return data;
  },

  async logout(): Promise<void> {
    try { await api.post(API_ENDPOINTS.AUTH.LOGOUT); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      document.cookie = 'auth_token=; path=/; max-age=0';
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
    return data.user;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  async verifyOtp(otp: string): Promise<{ message?: string }> {
    const { data } = await api.post<{ message?: string }>(API_ENDPOINTS.AUTH.VERIFY_OTP, { otp });
    return data;
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, newPassword });
    return data;
  },
};
