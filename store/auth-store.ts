import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// Clear legacy keys written by the old mock-login code, including the
// unauthenticated "local-session-*" bypass tokens the email/password login
// form used to mint for ANY credentials — those must never be treated as a
// valid session now that /auth/login actually checks the password. (Google
// sign-in's separate "local-google-session-*" token is left alone: that flow
// is still intentionally mocked and unaffected by this fix.)
if (typeof window !== 'undefined') {
  const legacyToken = localStorage.getItem('auth_token');
  if (legacyToken && (legacyToken.startsWith('mock-jwt-') || legacyToken.startsWith('local-session-'))) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    document.cookie = 'auth_token=; path=/; max-age=0';
  }
}

/** Tokens returned alongside a login/refresh response. `token` is required; the rest are optional because not every auth path (e.g. the mocked Google sign-in) produces them. */
interface TokenSet {
  token: string;
  refreshToken?: string;
  accessToken?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  /** Long-lived Cognito refresh token — used by lib/axios.ts to silently obtain a new access token when the current one expires. */
  refreshToken: string | null;
  /** Cognito Access Token — distinct from `token` (the ID Token used as the API Authorization bearer); only needed for the password-change endpoint. */
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  /** Called by the axios refresh flow after obtaining a new token set — does NOT touch `user`. */
  setTokens: (tokens: TokenSet) => void;
  login: (user: User, tokens: TokenSet) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

function persistTokens({ token, refreshToken, accessToken }: TokenSet) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  if (accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
}

function clearPersistedTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setTokens: (tokens) => {
        persistTokens(tokens);
        set({
          token: tokens.token,
          ...(tokens.refreshToken !== undefined ? { refreshToken: tokens.refreshToken } : {}),
          ...(tokens.accessToken !== undefined ? { accessToken: tokens.accessToken } : {}),
        });
      },

      login: (user, tokens) => {
        persistTokens(tokens);
        return set({
          user,
          token: tokens.token,
          refreshToken: tokens.refreshToken ?? null,
          accessToken: tokens.accessToken ?? null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        clearPersistedTokens();
        set({
          user: null,
          token: null,
          refreshToken: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading) =>
        set({ isLoading: loading }),
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-sync token to localStorage after zustand rehydrates from persist storage
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
        if (!state) return;
        // If a stale mock/password-bypass token survived in the persist store, force a clean logout
        if (state.token && (state.token.startsWith('mock-jwt-') || state.token.startsWith('local-session-'))) {
          state.logout();
          return;
        }
        if (state.token && typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, state.token);
        }
      },
    }
  )
);
