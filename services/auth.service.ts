import api from '@/lib/axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import type { LoginCredentials, AuthResponse as LoginResponse, User } from '@/types';
import { emailFromIdToken, rememberedBrowserFor } from '@/lib/remembered-browser';

/** A browser the person asked to remember, as Settings → Security lists it. */
export interface RememberedBrowserInfo {
  key: string;
  name: string;
  rememberedAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

/**
 * How someone proves it is them again for a sensitive step: their password, or a
 * fresh Google / Microsoft sign-in (for people who sign in that way and have no
 * password of their own).
 */
export type Reauth =
  | { currentPassword: string }
  | { ssoProvider: 'google' | 'microsoft'; ssoToken: string };

// NOTE: token persistence (localStorage + the `auth_token` cookie the Next.js middleware
// reads) lives entirely in store/auth-store.ts now — these methods only talk to the API and
// hand back the raw response. Callers persist a session via useAuthStore().login()/setTokens().

export const authService = {
  /** Exchange a Google ID token (from Google Identity Services) for this app's session. */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    try {
      // A browser this person asked to remember skips the code here too.
      const device = rememberedBrowserFor(emailFromIdToken(idToken));
      const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.GOOGLE, device ? { idToken, device } : { idToken });
      return data;
    } catch (err: any) {
      console.error('[GOOGLE] HTTP error ←', err?.response?.status, JSON.stringify(err?.response?.data));
      throw err;
    }
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // A browser this person asked to remember signs in without the authenticator code.
      const device = rememberedBrowserFor(credentials.email);
      const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, device ? { ...credentials, device } : credentials);
      return data;
    } catch (err: any) {
      const resp = err?.response;
      console.error('[LOGIN] HTTP error ←', resp?.status, JSON.stringify(resp?.data ?? err?.message));
      throw err;
    }
  },

  /** Complete a NEW_PASSWORD_REQUIRED Cognito challenge and receive the real token. */
  async respondChallenge(payload: { email: string; session: string; newPassword: string }): Promise<LoginResponse> {
    try {
      // Backend detects session+newPassword in the body and runs RespondToAuthChallenge internally
      const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload);
      return data;
    } catch (err: any) {
      console.error('[CHALLENGE] HTTP error ←', err?.response?.status, JSON.stringify(err?.response?.data));
      throw err;
    }
  },

  /** Finish a login that asked for an authenticator-app code (ChallengeName SOFTWARE_TOKEN_MFA). */
  async respondMfa(payload: { email: string; session: string; code: string; challengeName?: string; rememberDevice?: boolean }): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.MFA_RESPOND, payload);
    return data;
  },

  /** Whether the signed-in user has an authenticator app enrolled. */
  async getMfaStatus(): Promise<{ mfaEnabled: boolean }> {
    const { data } = await api.get<{ mfaEnabled: boolean }>(API_ENDPOINTS.MFA.STATUS);
    return data;
  },

  /** Start enrolling an authenticator app. Who you are is checked again server-side. */
  async setupMfa(proof: Reauth): Promise<{ secretCode: string; otpauthUrl: string }> {
    const { data } = await api.post<{ secretCode: string; otpauthUrl: string }>(API_ENDPOINTS.MFA.SETUP, { ...proof });
    return data;
  },

  /** Confirm the first code from the app, which switches two-factor on. */
  async verifyMfa(proof: Reauth, code: string): Promise<{ mfaEnabled: boolean }> {
    const { data } = await api.post<{ mfaEnabled: boolean }>(API_ENDPOINTS.MFA.VERIFY, { ...proof, code });
    return data;
  },

  /** The browsers the signed-in person asked to remember. */
  async listRememberedBrowsers(): Promise<{ devices: RememberedBrowserInfo[]; days: number }> {
    const { data } = await api.get<{ devices: RememberedBrowserInfo[]; days: number }>(API_ENDPOINTS.MFA.DEVICES);
    return data;
  },

  /** Forget one remembered browser (`key`), or all of them: the code is asked for there again. */
  async forgetRememberedBrowsers(key?: string): Promise<void> {
    await api.delete(API_ENDPOINTS.MFA.DEVICES, { params: key ? { key } : undefined });
  },

  /** Turn two-factor off. Needs proof of who you are and a current code. */
  async disableMfa(proof: Reauth, code: string): Promise<{ mfaEnabled: boolean }> {
    const { data } = await api.delete<{ mfaEnabled: boolean }>(API_ENDPOINTS.MFA.STATUS, { data: { ...proof, code } });
    return data;
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

  /**
   * Ends the session server-side. The refresh token is what the backend revokes; this used to send
   * nothing, so a refresh token copied out of the browser kept minting sessions after sign-out.
   * Call it before the store's logout(), which clears the token from storage.
   */
  async logout(): Promise<void> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) : null;
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT, refreshToken ? { refreshToken } : {});
    } catch { /* ignore — we're logging out either way */ }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
    return data.user;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },


  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, newPassword });
    return data;
  },
};
