import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { LoginCredentials, AuthResponse as LoginResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (data.token && typeof window !== 'undefined') {
      document.cookie = `ef-auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
    return data;
  },

  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    if (typeof window !== 'undefined') {
      document.cookie = 'ef-auth-token=; path=/; max-age=0';
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const { data } = await api.post<{ resetToken: string }>(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    return data;
  },

  async resetPassword(resetToken: string, password: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { resetToken, password });
    return data;
  },
};
