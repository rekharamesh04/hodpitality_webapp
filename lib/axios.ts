import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/constants';
import { getJwtExpiryMs } from './jwt';
import { useAuthStore } from '@/store/auth-store';
import { SCOPE_PARAM_NAMES, scopeQueryParams, usePlatformScopeStore } from '@/store/platform-scope-store';
import { debugLog } from '@/utils/debugLog';
import { DEV_BYPASS_ENABLED } from '@/lib/dev-session';
import {
  LOCATION_CHECK_PATH, LOCATION_PASS_HEADER, clearLocationPass, isDefiniteRefusal, msUntilRenewal,
  readLocationPass, readPosition, saveLocationPass, type LocationCheckResult,
} from '@/lib/location-pass';

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
    /** Set once a request has been retried after its stale platform scope was dropped. */
    _scopeRetry?: boolean;
    /** Set once a request has been retried after a location check, so it's never retried twice. */
    _locationRetry?: boolean;
  }
}

// Configure per environment via .env.local. The fallback is the production API, which has run in
// AWS US East (Ohio) since 2026-11-24. The old Mumbai (ap-south-1) copy only answers "moved".
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://9zid3fs6h0.execute-api.us-east-2.amazonaws.com/dev';
// No hard-coded fallback: anything NEXT_PUBLIC_* ships inside the browser bundle, so it is not a
// secret. Users are identified by their Cognito token. The header is only sent when this env var
// is set (e.g. if API Gateway is configured to require an API key).
const API_KEY = process.env.NEXT_PUBLIC_LAMBDA_API_KEY || '';

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

/** Reads the `{ data, total, page, limit }` list envelope, falling back to the row count when `total` is absent. */
export function unwrapPage<T>(raw: unknown): { data: T[]; total: number } {
  const data = unwrapList<T>(raw);
  const total = raw && typeof raw === 'object' && typeof (raw as { total?: unknown }).total === 'number'
    ? (raw as { total: number }).total
    : data.length;
  return { data, total };
}

/**
 * Lists are paginated server-side and default to a small page. Pages that filter or sort the
 * whole set in the browser must ask for everything explicitly or they would silently show only
 * the first page. Server-side filtering removes the need for this — see each service's notes.
 */
export const FULL_LIST_LIMIT = 1000;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
  },
});

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

/** Where the login page finds why the last session ended, when the app ended it. */
export const SIGN_OUT_REASON_KEY = 'entryflow_sign_out_reason';

/** Clears the session everywhere (store + storage + cookie) and sends the user to /login. Idempotent — safe to call even if already logged out or already on /login. */
function performLogout() {
  if (typeof window === 'undefined') return;
  // The dev bypass holds a session no backend will ever accept, so every
  // authenticated call 401s. Tearing the session down on that would bounce the
  // user to /login on the first request any page happens to make, which is
  // exactly what the bypass exists to avoid.
  if (DEV_BYPASS_ENABLED) return;
  cancelScheduledRefresh();
  cancelLocationRenewal();
  clearLocationPass();
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

// ─── Location passes (organisations that limit desk staff to their clinics) ──────────────
// See lib/location-pass.ts. One check at a time: every request refused at once waits for it.

let locationCheck: Promise<LocationCheckResult> | null = null;
let locationTimer: ReturnType<typeof setTimeout> | null = null;

function cancelLocationRenewal() {
  if (locationTimer) {
    clearTimeout(locationTimer);
    locationTimer = null;
  }
}

/** Reads the device's position and asks the server whether it is at one of the person's clinics. */
function runLocationCheck(): Promise<LocationCheckResult> {
  if (!locationCheck) {
    locationCheck = (async (): Promise<LocationCheckResult> => {
      const reading = await readPosition();
      const { data } = await api.post<LocationCheckResult>(LOCATION_CHECK_PATH, reading);
      if (data?.allowed && data.pass) {
        saveLocationPass(data.pass, data.expiresIn ?? 20 * 60, data.site?.name);
        scheduleLocationRenewal();
      } else if (data && isDefiniteRefusal(data)) {
        // Found outside: the server has already ended the pass.
        clearLocationPass();
      }
      return data ?? { allowed: false };
    })()
      .catch((err: AxiosError<{ error?: string }>) => ({
        allowed: false,
        error: err?.response?.data?.error || 'Could not check your location. Try again, or connect to the clinic\u2019s Wi-Fi.',
      }))
      .finally(() => {
        locationCheck = null;
      });
  }
  return locationCheck;
}

/** Renews the pass while it is in use, a while before it runs out. */
function scheduleLocationRenewal() {
  if (typeof window === 'undefined') return;
  cancelLocationRenewal();
  const wait = msUntilRenewal();
  if (wait == null) return;
  locationTimer = setTimeout(async () => {
    locationTimer = null;
    if (!readLocationPass() || !localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) return;
    const result = await runLocationCheck();
    if (isDefiniteRefusal(result)) {
      // They have left the clinic. Say so now rather than leave a page where nothing loads.
      try { sessionStorage.setItem(SIGN_OUT_REASON_KEY, result.error || 'You are no longer at one of your clinics.'); } catch { /* storage unavailable */ }
      performLogout();
    } else if (!result.allowed) {
      // The device could not say this time; the pass lasts a while longer. Try again shortly.
      locationTimer = setTimeout(() => scheduleLocationRenewal(), 60_000);
    }
  }, wait);
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
  // A page reload (or a new tab) keeps renewing a location pass that is still in use.
  if (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) scheduleLocationRenewal();
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
      // Proof that this device was found at one of its clinics (only ever set when the
      // organisation limits desk staff to its clinics and this device is off their networks).
      const locationPass = token ? readLocationPass() : null;
      if (locationPass && config.headers) {
        config.headers[LOCATION_PASS_HEADER] = locationPass;
      }
      // A super admin or reseller looking at one organisation or industry. The API honours
      // these for platform roles only; /auth never takes them, so a stale scope cannot sign
      // anyone out.
      if (!(config.url ?? '').startsWith('/auth')) {
        const scope = scopeQueryParams(useAuthStore.getState().user?.role, usePlatformScopeStore.getState().scope);
        if (Object.keys(scope).length > 0) config.params = { ...scope, ...(config.params ?? {}) };
      }
    }
    // Never log request bodies — they carry passwords, OTPs and personal data.
    debugLog(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── Response interceptor ───────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    debugLog(`[API] ← ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
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

    // The organisation or reseller account behind this login was suspended or removed. Every
    // request will now be refused, so end the session and say why rather than leave a portal
    // where nothing loads.
    if (status === 403 && (error.response?.data as { code?: string } | undefined)?.code === 'ACCOUNT_INACTIVE') {
      try { sessionStorage.setItem(SIGN_OUT_REASON_KEY, backendMsg || 'This account is no longer active.'); } catch { /* storage unavailable */ }
      performLogout();
      return Promise.reject(error);
    }

    // The organisation only allows desk logins from its approved clinic networks, and this
    // device is somewhere else. Every request will be refused, so sign out and say why — with
    // the address the server saw, which is what an administrator would need to add.
    const refusal = error.response?.data as { code?: string; yourAddress?: string; location?: boolean } | undefined;

    // An administrator without two-factor, while it is required: take them to where they turn
    // it on (Settings → Security stays reachable), once, instead of a page full of errors.
    if (status === 403 && refusal?.code === 'MFA_SETUP_REQUIRED' && typeof window !== 'undefined') {
      if (!window.location.pathname.startsWith('/settings')) {
        window.location.href = '/settings?tab=security&mfa=required';
      }
      return Promise.reject(error);
    }
    if (status === 403 && refusal?.code === 'NETWORK_NOT_ALLOWED') {
      // Not on a clinic network, but a clinic this person works at has a place on the map: ask
      // the device where it is, once, and repeat the request with the pass that comes back.
      if (refusal.location && originalConfig && !originalConfig._locationRetry && !isLogoutCall && !DEV_BYPASS_ENABLED) {
        // Sent before a check that has since finished: repeat it with the new pass, no second check.
        const sentPass = originalConfig.headers?.[LOCATION_PASS_HEADER];
        const currentPass = readLocationPass();
        if (currentPass && currentPass !== sentPass) {
          originalConfig._locationRetry = true;
          return api(originalConfig);
        }
        const result = await runLocationCheck();
        if (result.allowed) {
          originalConfig._locationRetry = true;
          return api(originalConfig);
        }
        try { sessionStorage.setItem(SIGN_OUT_REASON_KEY, result.error || backendMsg || 'Sign-in is only allowed at your organisation’s clinics.'); } catch { /* storage unavailable */ }
        performLogout();
        return Promise.reject(error);
      }
      const where = refusal.yourAddress && !refusal.location ? ` (this device is connecting from ${refusal.yourAddress})` : '';
      const reason = (backendMsg || 'Sign-in is only allowed from your organisation’s approved networks.') + where;
      try { sessionStorage.setItem(SIGN_OUT_REASON_KEY, reason); } catch { /* storage unavailable */ }
      performLogout();
      return Promise.reject(error);
    }

    // The organisation a super admin was looking at is gone (deleted, or no longer theirs).
    // Drop the scope and repeat the request across everything they may see, once.
    if ((error.response?.data as { scopeInvalid?: boolean } | undefined)?.scopeInvalid && originalConfig && !originalConfig._scopeRetry) {
      usePlatformScopeStore.getState().clear();
      originalConfig._scopeRetry = true;
      if (originalConfig.params) {
        const params = { ...originalConfig.params };
        for (const name of SCOPE_PARAM_NAMES) delete params[name];
        originalConfig.params = params;
      }
      return api(originalConfig);
    }

    // TEMP: local-only sessions (see lib/axios.ts request interceptor) have no real backend
    // session to refresh or expire — a 401 here just means "this fake token isn't a real
    // Cognito token," not "your session expired."
    if (status !== 401 || isPublicAuthRoute) {
      return Promise.reject(error);
    }

    // Nothing to refresh towards while bypassing — fail the request and let the
    // calling page show its own error state.
    if (DEV_BYPASS_ENABLED) {
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
