import api from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { LoginCredentials, RegisterCredentials, AuthResponse as LoginResponse, User } from '@/types';

// NOTE: token persistence (localStorage + the `auth_token` cookie the Next.js middleware
// reads) lives entirely in store/auth-store.ts now — these methods only talk to the API and
// hand back the raw response. Callers persist a session via useAuthStore().login()/setTokens().

export const authService = {
  async register(payload: RegisterCredentials): Promise<{ message?: string }> {
    try {
      const { data } = await api.post<{ message?: string }>(API_ENDPOINTS.AUTH.REGISTER, payload);
      console.log('[REGISTER] raw response ←', JSON.stringify(data));
      return data;
    } catch (err: any) {
      console.error('[REGISTER] HTTP error ←', err?.response?.status, JSON.stringify(err?.response?.data));
      throw err;
    }
  },

  /** Exchange a Google ID token (from Google Identity Services) for this app's session. */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    try {
      const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.GOOGLE, { idToken });
      console.log('[GOOGLE] raw response ←', JSON.stringify(data));
      return data;
    } catch (err: any) {
      console.error('[GOOGLE] HTTP error ←', err?.response?.status, JSON.stringify(err?.response?.data));
      throw err;
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      console.log('[LOGIN] raw response ←', JSON.stringify(data));
      return data;
    } catch (err: any) {
      const resp = err?.response;
      console.error('[LOGIN] HTTP error ←', resp?.status, JSON.stringify(resp?.data ?? err?.message));
      throw err;
    }
  },

  /** Complete a NEW_PASSWORD_REQUIRED Cognito challenge and receive the real token. */
  async respondChallenge(payload: { email: string; session: string; newPassword: string }): Promise<LoginResponse> {
    console.log('[CHALLENGE] calling POST /auth/login (challenge mode)...');
    try {
      // Backend detects session+newPassword in the body and runs RespondToAuthChallenge internally
      const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
      console.log('[CHALLENGE] raw response ←', JSON.stringify(data));
      return data;
    } catch (err: any) {
      console.error('[CHALLENGE] HTTP error ←', err?.response?.status, JSON.stringify(err?.response?.data));
      throw err;
    }
  },

  /**
   * Exchange a refresh token for a new access (ID) token — and, if the backend rotates
   * refresh tokens, a new refresh token too. Used by lib/axios.ts's response interceptor;
   * exposed here as well for any direct/manual callers.
   */
  async refresh(refreshToken: string): Promise<{ token: string; refreshToken?: string; accessToken?: string }> {
    const { data } = await api.post<{ token: string; refreshToken?: string; accessToken?: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return data;
  },

  async logout(): Promise<void> {
    try { await api.post(API_ENDPOINTS.AUTH.LOGOUT); } catch { /* ignore — we're logging out either way */ }
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
