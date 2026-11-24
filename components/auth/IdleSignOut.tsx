'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import { SIGN_OUT_REASON_KEY } from '@/lib/axios';
import { IDLE_SIGN_OUT_REASON, KIOSK_ACTIVE_KEY, LAST_ACTIVITY_KEY, idleSignOutApplies, isIdle } from '@/lib/idle';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;
const WRITE_EVERY_MS = 15_000; // how often activity is written to storage, at most
const CHECK_EVERY_MS = 30_000;

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

/** Signs out after 15 minutes without activity in any EntryFlow tab (see lib/idle.ts). */
export function IdleSignOut() {
  const pathname = usePathname() || '/';
  const signedIn = useAuthStore((s) => !!s.token);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!signedIn) return;
    let lastWrite = 0;
    const touch = () => {
      const now = Date.now();
      if (now - lastWrite < WRITE_EVERY_MS) return;
      lastWrite = now;
      try { localStorage.setItem(LAST_ACTIVITY_KEY, String(now)); } catch { /* storage unavailable */ }
    };
    const check = () => {
      if (!idleSignOutApplies(pathname, read(KIOSK_ACTIVE_KEY))) return;
      const raw = read(LAST_ACTIVITY_KEY);
      if (!isIdle(raw == null ? null : Number(raw), Date.now())) return;
      try {
        sessionStorage.setItem(SIGN_OUT_REASON_KEY, IDLE_SIGN_OUT_REASON);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      } catch { /* storage unavailable */ }
      logout();
      window.location.href = '/login';
    };
    // A tab opened after a long gap (laptop closed overnight) is checked before anything else.
    check();
    if (read(LAST_ACTIVITY_KEY) == null) touch();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [signedIn, pathname, logout]);

  return null;
}
