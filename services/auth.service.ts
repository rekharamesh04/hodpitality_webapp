import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import { STORAGE_KEYS } from '@/constants';
import type { LoginCredentials, AuthResponse as LoginResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (data.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        // Cookie must match middleware cookie name
        document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    }
    return data;
  },

  async logout(): Promise<void> {
    try { await api.post(API_ENDPOINTS.AUTH.LOGOUT); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
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
