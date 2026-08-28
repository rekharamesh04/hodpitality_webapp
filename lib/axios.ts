import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/constants';
import { mockAdapter } from './mock-adapter';
import { getJwtExpiryMs } from './jwt';
import { useAuthStore } from '@/store/auth-store';

// Endpoints that run without a session — a 401 here means "request rejected",
// not "your session expired", so it must not trigger the global logout redirect
// or an access-token refresh attempt.
const UNAUTHENTICATED_PATHS: string[] = Object.values(API_ENDPOINTS.AUTH).filter(
  (path) => path !== API_ENDPOINTS.AUTH.ME && path !== API_ENDPOINTS.AUTH.LOGOUT && path !== API_ENDPOINTS.AUTH.REFRESH
);

// Allow callers to signal that the Access Token should be used instead of the ID Token,
// and let the response interceptor track retry/refresh bookkeeping per-request.
declare module 'axios' {
  interface AxiosRequestConfig {
    useAccessToken?: boolean;
    /** Set once a request has already been retried after a token refresh, so it's never retried twice. */
    _retry?: boolean;
    /** Marks the refresh call itself, so its own 401 doesn't recursively try to refresh again. */
    _isAuthRefreshCall?: boolean;
  }
}

export const BASE_URL = 'https://x8nrv9hcrf.execute-api.ap-south-1.amazonaws.com/dev';
const API_KEY = 'entryflow-secret-key-2026!@';

/** Normalise any Lambda response into a plain array regardless of wrapping shape. */
export function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data))    return r.data as T[];
    if (Array.isArray(r.entries)) return r.entries as T[];
    if (Array.isArray(r.items))   return r.items as T[];
  }
  return [];
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

function isLocalSession(): boolean {
  return typeof window !== 'undefined'
    && (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ?? '').startsWith('local-');
}

// ─── Session lifecycle: proactive refresh scheduling + centralized logout ──────────────

let proactiveTimer: ReturnType<typeof setTimeout> | null = null;
/** Refresh this long before the token's real `exp`, so a request in flight around expiry time never races a truly-expired token. */
const REFRESH_BUFFER_MS = 60_000;

function cancelScheduledRefresh() {
  if (proactiveTimer) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
}

/** Schedules (or immediately triggers, if already due) a silent refresh ahead of the given token's expiry. No-ops for tokens without a decodable `exp` claim (e.g. the local-only dev/Google session tokens) — nothing to schedule against. */
function scheduleProactiveRefresh(token: string) {
  if (typeof window === 'undefined') return;
  cancelScheduledRefresh();
  const expiryMs = getJwtExpiryMs(token);
  if (expiryMs == null) return;
  const delay = expiryMs - Date.now() - REFRESH_BUFFER_MS;
  if (delay <= 0) {
    getRefreshedAccessToken().catch(() => {});
    return;
  }
  proactiveTimer = setTimeout(() => {
    getRefreshedAccessToken().catch(() => {});
  }, delay);
}

/** Clears the session everywhere (store + storage + cookie) and sends the user to /login. Idempotent — safe to call even if already logged out or already on /login. */
function performLogout() {
  if (typeof window === 'undefined') return;
  cancelScheduledRefresh();
  useAuthStore.getState().logout();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// Single-flight refresh: concurrent 401s all await the same in-flight promise instead of
// each firing its own refresh call.
let refreshPromise: Promise<string> | null = null;

function getRefreshedAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function performTokenRefresh(): Promise<string> {
  // Read straight from localStorage rather than the zustand store: requests (and their 401s)
  // can fire before the store's persist middleware finishes its async rehydration on a fresh
  // page load, and the store would look logged-out at that instant even though a perfectly
  // valid refresh token is already sitting in storage. localStorage has no such race.
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) : null;
  if (!refreshToken) {
    // No refresh session to fall back on — this IS a genuine "you're logged out" state.
    performLogout();
    throw new Error('No refresh token available');
  }

  try {
    const { data } = await api.post<{ token: string; refreshToken?: string; accessToken?: string }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { _isAuthRefreshCall: true }
    );
    if (!data?.token) throw new Error('Refresh response did not include a new token');

    useAuthStore.getState().setTokens({
      token: data.token,
      refreshToken: data.refreshToken,
      accessToken: data.accessToken,
    });
    scheduleProactiveRefresh(data.token);
    return data.token;
  } catch (err) {
    const axErr = err as AxiosError;
    const status = axErr.response?.status;
    // Only tear down the session for an unambiguous auth rejection. A network blip or a
    // flaky 5xx from the refresh call shouldn't log the user out — the next request (or the
    // next proactive tick) will simply try again with the still-current refresh token.
    if (status === 401 || status === 403) {
      performLogout();
    }
    throw err;
  }
}

/**
 * Called once on app bootstrap (see components/auth/AuthProvider.tsx) so a page reload
 * silently refreshes an already-expired-but-refreshable session instead of leaving the user
 * to discover it on the first failed request. Also keeps the proactive-refresh timer in sync
 * with every future token change (login, refresh, logout) for the lifetime of the tab.
 */
export function initSessionRefresh(): () => void {
  if (typeof window === 'undefined') return () => {};
  const apply = (token: string | null) => {
    if (token) scheduleProactiveRefresh(token);
    else cancelScheduledRefresh();
  };
  // Read from localStorage rather than the (possibly not-yet-rehydrated) store — same reasoning
  // as performTokenRefresh() above.
  apply(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  return useAuthStore.subscribe((state, prevState) => {
    if (state.token !== prevState.token) apply(state.token);
  });
}

// ─── Request interceptor ────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // PUT /settings/password requires the Cognito Access Token, not the ID Token
      const key = (config as any).useAccessToken ? STORAGE_KEYS.ACCESS_TOKEN : STORAGE_KEYS.AUTH_TOKEN;
      const token = localStorage.getItem(key);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // TEMP: local-only sessions have no real backend to talk to, so every
      // request is served from the in-memory mock backend instead of the
      // network — this is what keeps the app free of 401s while there's no
      // real login. Remove once real backend auth is wired up.
      if (isLocalSession()) {
        config.adapter = mockAdapter;
      }
    }
    // Log all POST/PUT requests so invite payloads are visible in the browser console
    if (config.method === 'post' || config.method === 'put') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── Response interceptor ───────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    // Log POST/PUT responses so we can see what the backend confirms
    if (response.config.method === 'post' || response.config.method === 'put') {
      console.log(`[API] ← ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const originalConfig = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalConfig?.url ?? '';
    const isPublicAuthRoute = UNAUTHENTICATED_PATHS.some((path) => requestUrl.includes(path));
    const isRefreshCall = originalConfig?._isAuthRefreshCall === true;
    const isLogoutCall = requestUrl.includes(API_ENDPOINTS.AUTH.LOGOUT);

    // Preserve the backend error message for callers, always.
    const backendMsg = error.response?.data?.error ?? error.response?.data?.message;
    if (backendMsg && error.message !== backendMsg) {
      (error as any).backendMessage = backendMsg;
    }

    // TEMP: local-only sessions (see lib/axios.ts request interceptor) have no real backend
    // session to refresh or expire — a 401 here just means "this fake token isn't a real
    // Cognito token," not "your session expired."
    if (status !== 401 || isPublicAuthRoute || isLocalSession()) {
      return Promise.reject(error);
    }

    if (isRefreshCall || isLogoutCall) {
      // The refresh call itself failed, or we 401'd while logging out — either way there's
      // no session left to salvage. performTokenRefresh() already handles the refresh-call
      // case's own logout decision; this just closes out the logout-call case.
      if (isLogoutCall) performLogout();
      return Promise.reject(error);
    }

    if (originalConfig?._retry) {
      // Already retried once with a fresh token and still 401'd — don't loop forever.
      performLogout();
      return Promise.reject(error);
    }

    try {
      const newToken = await getRefreshedAccessToken();
      if (originalConfig) {
        originalConfig._retry = true;
        if (originalConfig.headers) originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return api(originalConfig);
      }
      return Promise.reject(error);
    } catch {
      // performTokenRefresh() already decided whether this warranted a logout.
      return Promise.reject(error);
    }
  }
);

export default api;
