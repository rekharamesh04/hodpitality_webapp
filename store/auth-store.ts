import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// Clear legacy keys written by the old mock-login code
if (typeof window !== 'undefined') {
  const legacyToken = localStorage.getItem('auth_token');
  if (legacyToken && legacyToken.startsWith('mock-jwt-')) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    document.cookie = 'auth_token=; path=/; max-age=0';
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({ token }),

      login: (user, token) => {
        // Always keep localStorage in sync so the axios interceptor can read it
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
        return set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear localStorage and cookies
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          // Clear auth cookie
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        set({
          user: null,
          token: null,
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
        isAuthenticated: state.isAuthenticated,
      }),
      // Re-sync token to localStorage after zustand rehydrates from persist storage
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
        if (!state) return;
        // If a stale mock token survived in the persist store, force a clean logout
        if (state.token && state.token.startsWith('mock-jwt-')) {
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
