'use client';

import { useState, useCallback, useRef } from 'react';
import api from '@/lib/axios';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Zap,
  Activity,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type TestStatus = 'idle' | 'loading' | 'success' | 'error' | 'skipped';

interface EndpointDef {
  id: string;
  method: Method;
  path: string;
  note?: string;
  body?: Record<string, unknown>;
  /** If true, endpoint is skipped in bulk run (e.g. destructive DELETE) */
  skipInBulk?: boolean;
}

interface EndpointGroup {
  title: string;
  color: string;
  endpoints: EndpointDef[];
}

interface TestResult {
  status: TestStatus;
  httpCode?: number;
  ms?: number;
  preview?: string;
  error?: string;
}

// ─── Endpoint Registry ───────────────────────────────────────────────────────

const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    title: '1. Authentication & Profile',
    color: 'blue',
    endpoints: [
      { id: 'auth-me',       method: 'GET',  path: '/auth/me' },
      { id: 'auth-login',    method: 'POST', path: '/auth/login',
        body: { email: 'admin@entryflow.com', password: 'admin123' } },
      { id: 'settings-profile-get', method: 'GET', path: '/settings/profile' },
      { id: 'auth-forgot',   method: 'POST', path: '/auth/forgot-password',
        body: { email: 'admin@entryflow.com' } },
      { id: 'auth-verify',   method: 'POST', path: '/auth/verify-otp',
        body: { email: 'admin@entryflow.com', otp: '123456' } },
      { id: 'auth-logout',   method: 'POST', path: '/auth/logout', skipInBulk: true },
    ],
  },
  {
    title: '2. Settings',
    color: 'gray',
    endpoints: [
      { id: 'settings-profile-put', method: 'PUT', path: '/settings/profile',
        body: { name: 'Admin User' } },
      { id: 'settings-org',  method: 'PUT', path: '/settings/organisation',
        body: { name: 'EntryFlow Corp' } },
      { id: 'settings-notif',method: 'PUT', path: '/settings/notifications',
        body: { email: true, push: true, sms: false } },
      { id: 'settings-pass', method: 'PUT', path: '/settings/password',
        body: { currentPassword: 'admin123', newPassword: 'admin123' }, skipInBulk: true },
    ],
  },
  {
    title: '3. Multi-Tenant (Resellers)',
    color: 'purple',
    endpoints: [
      { id: 'resellers-list',   method: 'GET',  path: '/resellers?limit=10' },
      { id: 'resellers-create', method: 'POST', path: '/resellers',
        body: { name: 'Test Reseller', email: 'reseller@test.com' } },
      { id: 'resellers-get',    method: 'GET',  path: '/resellers/1' },
      { id: 'resellers-update', method: 'PUT',  path: '/resellers/1',
        body: { name: 'Updated Reseller' } },
      { id: 'resellers-delete', method: 'DELETE', path: '/resellers/1', skipInBulk: true },
    ],
  },
  {
    title: '4. Multi-Tenant (Companies)',
    color: 'indigo',
    endpoints: [
      { id: 'companies-list',   method: 'GET',  path: '/companies?limit=10' },
      { id: 'companies-create', method: 'POST', path: '/companies',
        body: { name: 'Test Company', email: 'company@test.com' } },
      { id: 'companies-get',    method: 'GET',  path: '/companies/1' },
      { id: 'companies-update', method: 'PUT',  path: '/companies/1',
        body: { name: 'Updated Company' } },
      { id: 'companies-delete', method: 'DELETE', path: '/companies/1', skipInBulk: true },
    ],
  },
  {
    title: '5. Guests (CRM)',
    color: 'green',
    endpoints: [
      { id: 'guests-list',   method: 'GET',  path: '/guests?limit=10' },
      { id: 'guests-create', method: 'POST', path: '/guests',
        body: { name: 'Test Guest', email: 'test@guest.com', phone: '+1234567890' } },
      { id: 'guests-get',    method: 'GET',  path: '/guests/1' },
      { id: 'guests-update', method: 'PUT',  path: '/guests/1',
        body: { name: 'Updated Guest' } },
      { id: 'guests-export', method: 'GET',  path: '/guests/export' },
      { id: 'guests-delete', method: 'DELETE', path: '/guests/1', skipInBulk: true },
      { id: 'guests-bulk-delete', method: 'DELETE', path: '/guests/bulk',
        body: { ids: [] }, skipInBulk: true },
    ],
  },
  {
    title: '6. Check-Ins',
    color: 'cyan',
    endpoints: [
      { id: 'checkins-list',    method: 'GET',  path: '/check-ins?limit=10' },
      { id: 'checkins-stats',   method: 'GET',  path: '/check-ins/stats' },
      { id: 'checkins-create',  method: 'POST', path: '/check-ins',
        body: { guestId: '1', method: 'manual' } },
      { id: 'checkins-quick',   method: 'POST', path: '/check-ins/quick',
        body: { guestId: '1' } },
      { id: 'checkins-qr',      method: 'POST', path: '/check-ins/qr',
        body: { qrCode: 'QRDEMO123' } },
      { id: 'checkins-facial',  method: 'POST', path: '/check-ins/facial-recognition',
        body: { imageData: 'base64encodeddata' } },
      { id: 'checkins-badge',   method: 'POST', path: '/check-ins/1/badge' },
    ],
  },
  {
    title: '7. Events',
    color: 'yellow',
    endpoints: [
      { id: 'events-list',      method: 'GET',  path: '/events?limit=10' },
      { id: 'events-upcoming',  method: 'GET',  path: '/events/upcoming' },
      { id: 'events-create',    method: 'POST', path: '/events',
        body: { title: 'Test Event', startDate: new Date().toISOString() } },
      { id: 'events-get',       method: 'GET',  path: '/events/1' },
      { id: 'events-attendees', method: 'GET',  path: '/events/1/attendees' },
      { id: 'events-update',    method: 'PUT',  path: '/events/1',
        body: { title: 'Updated Event' } },
      { id: 'events-delete',    method: 'DELETE', path: '/events/1', skipInBulk: true },
    ],
  },
  {
    title: '8. Venues',
    color: 'orange',
    endpoints: [
      { id: 'venues-list',      method: 'GET',  path: '/venues?limit=10' },
      { id: 'venues-create',    method: 'POST', path: '/venues',
        body: { name: 'Test Hall', capacity: 100 } },
      { id: 'venues-get',       method: 'GET',  path: '/venues/1' },
      { id: 'venues-update',    method: 'PUT',  path: '/venues/1',
        body: { name: 'Updated Hall' } },
      { id: 'venues-occupancy', method: 'PUT',  path: '/venues/1/occupancy',
        body: { currentOccupancy: 42 } },
      { id: 'venues-delete',    method: 'DELETE', path: '/venues/1', skipInBulk: true },
    ],
  },
  {
    title: '9. Staff & Appointments',
    color: 'pink',
    endpoints: [
      { id: 'staff-list',       method: 'GET',  path: '/staff?limit=10' },
      { id: 'staff-create',     method: 'POST', path: '/staff',
        body: { name: 'Test Staff', email: 'staff@test.com' } },
      { id: 'staff-get',        method: 'GET',  path: '/staff/1' },
      { id: 'staff-update',     method: 'PUT',  path: '/staff/1',
        body: { name: 'Updated Staff' } },
      { id: 'staff-schedule',   method: 'PUT',  path: '/staff/1/schedule',
        body: { mon: '09:00-17:00' } },
      { id: 'staff-delete',     method: 'DELETE', path: '/staff/1', skipInBulk: true },
      { id: 'appts-list',       method: 'GET',  path: '/appointments?limit=10' },
      { id: 'appts-create',     method: 'POST', path: '/appointments',
        body: { guestId: '1', staffId: '1', title: 'Consultation' } },
      { id: 'appts-status',     method: 'PUT',  path: '/appointments/1/status',
        body: { status: 'completed' } },
    ],
  },
  {
    title: '10. Calendar',
    color: 'teal',
    endpoints: [
      { id: 'calendar-events', method: 'GET', path: '/calendar/events' },
      { id: 'calendar-grid',   method: 'GET', path: '/calendar' },
    ],
  },
  {
    title: '11. Reports & Analytics',
    color: 'violet',
    endpoints: [
      { id: 'reports-stats',          method: 'GET',  path: '/reports/dashboard-stats' },
      { id: 'reports-daily',          method: 'GET',  path: '/reports/daily?days=7' },
      { id: 'reports-guest-arrivals', method: 'GET',  path: '/reports/guest-arrivals' },
      { id: 'reports-monthly-events', method: 'GET',  path: '/reports/monthly-events' },
      { id: 'reports-revenue',        method: 'GET',  path: '/reports/revenue-trend' },
      { id: 'reports-export',         method: 'POST', path: '/reports/export',
        body: { type: 'daily', format: 'pdf' } },
      { id: 'dashboard-activity',     method: 'GET',  path: '/dashboard/activity' },
      { id: 'dashboard-charts',       method: 'GET',  path: '/dashboard/charts/checkins' },
    ],
  },
  {
    title: '12. Notifications',
    color: 'red',
    endpoints: [
      { id: 'notif-list',      method: 'GET',    path: '/notifications?limit=10' },
      { id: 'notif-read',      method: 'PUT',    path: '/notifications/1/read' },
      { id: 'notif-read-all',  method: 'PUT',    path: '/notifications/read-all' },
      { id: 'notif-delete-all',method: 'DELETE', path: '/notifications/all', skipInBulk: true },
    ],
  },
  {
    title: '13. Uploads',
    color: 'slate',
    endpoints: [
      { id: 'upload-presign', method: 'POST', path: '/uploads/presigned-url',
        body: { fileName: 'test.jpg', contentType: 'image/jpeg' } },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  blue:   'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
  gray:   'bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-700',
  purple: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
  indigo: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800',
  green:  'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
  cyan:   'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800',
  yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
  orange: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
  pink:   'bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800',
  teal:   'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800',
  violet: 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800',
  red:    'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
  slate:  'bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700',
};

const BADGE_MAP: Record<string, string> = {
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  gray:   'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  green:  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cyan:   'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  pink:   'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  teal:   'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  red:    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  slate:  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const METHOD_COLOR: Record<Method, string> = {
  GET:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  POST:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PUT:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function truncateJson(obj: unknown, maxLen = 120): string {
  try {
    const s = JSON.stringify(obj);
    return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
  } catch {
    return String(obj);
  }
}

async function runEndpoint(ep: EndpointDef): Promise<TestResult> {
  const t0 = performance.now();
  try {
    let resp;
    switch (ep.method) {
      case 'GET':    resp = await api.get(ep.path);                 break;
      case 'POST':   resp = await api.post(ep.path, ep.body ?? {}); break;
      case 'PUT':    resp = await api.put(ep.path, ep.body ?? {});  break;
      case 'DELETE': resp = await api.delete(ep.path, ep.body ? { data: ep.body } : undefined); break;
    }
    return {
      status:   'success',
      httpCode: resp.status,
      ms:       Math.round(performance.now() - t0),
      preview:  truncateJson(resp.data),
    };
  } catch (err: any) {
    const httpCode = err?.response?.status;
    const preview  = err?.response?.data
      ? truncateJson(err.response.data)
      : err?.message;
    return {
      status:   'error',
      httpCode,
      ms:       Math.round(performance.now() - t0),
      error:    preview ?? 'Network error',
    };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusChip({ result }: { result: TestResult | undefined }) {
  if (!result || result.status === 'idle') {
    return <span className="text-xs text-muted-foreground font-medium">Idle</span>;
  }
  if (result.status === 'loading') {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…
      </span>
    );
  }
  if (result.status === 'skipped') {
    return <span className="text-xs text-muted-foreground font-medium italic">Skipped</span>;
  }
  if (result.status === 'success') {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {result.httpCode ?? '2xx'} · {result.ms}ms
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
      <XCircle className="w-3.5 h-3.5" />
      {result.httpCode ?? 'ERR'} · {result.ms}ms
    </span>
  );
}

function ResponsePreview({ result }: { result: TestResult | undefined }) {
  if (!result || result.status === 'idle' || result.status === 'loading' || result.status === 'skipped') return null;
  const text  = result.status === 'success' ? result.preview : result.error;
  const color = result.status === 'success'
    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
    : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300';
  return (
    <td colSpan={5} className="px-4 pb-3 pt-0">
      <pre className={`text-[11px] rounded-md px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed ${color}`}>
        {text}
      </pre>
    </td>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApiResponsePage() {
  const allIds = ENDPOINT_GROUPS.flatMap(g => g.endpoints.map(e => e.id));
  const [results, setResults] = useState<Record<string, TestResult>>(
    () => Object.fromEntries(allIds.map(id => [id, { status: 'idle' }]))
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ENDPOINT_GROUPS.map(g => [g.title, true]))
  );
  const [runningAll, setRunningAll] = useState(false);
  const abortRef = useRef(false);

  const setResult = useCallback((id: string, r: TestResult) => {
    setResults(prev => ({ ...prev, [id]: r }));
  }, []);

  const testOne = useCallback(async (ep: EndpointDef) => {
    setResult(ep.id, { status: 'loading' });
    const r = await runEndpoint(ep);
    setResult(ep.id, r);
  }, [setResult]);

  const testAll = useCallback(async () => {
    abortRef.current = false;
    setRunningAll(true);

    // Reset all
    setResults(Object.fromEntries(allIds.map(id => [id, { status: 'idle' }])));

    for (const group of ENDPOINT_GROUPS) {
      for (const ep of group.endpoints) {
        if (abortRef.current) break;
        if (ep.skipInBulk) {
          setResult(ep.id, { status: 'skipped' });
          continue;
        }
        setResult(ep.id, { status: 'loading' });
        const r = await runEndpoint(ep);
        setResult(ep.id, r);
        // small gap between calls to avoid rate-limiting
        await new Promise(res => setTimeout(res, 120));
      }
    }
    setRunningAll(false);
  }, [allIds, setResult]);

  const stop = useCallback(() => { abortRef.current = true; setRunningAll(false); }, []);

  const reset = useCallback(() => {
    setResults(Object.fromEntries(allIds.map(id => [id, { status: 'idle' }])));
  }, [allIds]);

  // Summary counters
  const total   = allIds.length;
  const success = Object.values(results).filter(r => r.status === 'success').length;
  const failed  = Object.values(results).filter(r => r.status === 'error').length;
  const skipped = Object.values(results).filter(r => r.status === 'skipped').length;
  const tested  = success + failed + skipped;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">API Health Monitor</h1>
              <p className="text-xs text-muted-foreground">
                {process.env.NEXT_PUBLIC_API_URL ?? 'base URL not set'}
              </p>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
              {total} endpoints
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
              ✓ {success}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold">
              ✗ {failed}
            </span>
            {skipped > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                — {skipped} skipped
              </span>
            )}

            {/* Progress bar */}
            {tested > 0 && (
              <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(success / Math.max(tested - skipped, 1)) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              disabled={runningAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            {runningAll ? (
              <button
                onClick={stop}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Stop
              </button>
            ) : (
              <button
                onClick={testAll}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> Test All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {ENDPOINT_GROUPS.map(group => {
          const isOpen = expanded[group.title] ?? true;
          const groupIds = group.endpoints.map(e => e.id);
          const gSuccess = groupIds.filter(id => results[id]?.status === 'success').length;
          const gError   = groupIds.filter(id => results[id]?.status === 'error').length;

          return (
            <div
              key={group.title}
              className={`rounded-xl border shadow-sm overflow-hidden ${COLOR_MAP[group.color]}`}
            >
              {/* Group Header */}
              <button
                onClick={() => setExpanded(p => ({ ...p, [group.title]: !isOpen }))}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:brightness-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  }
                  <span className="font-semibold text-sm text-foreground">{group.title}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${BADGE_MAP[group.color]}`}>
                    {group.endpoints.length} endpoints
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {gSuccess > 0 && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ {gSuccess}</span>
                  )}
                  {gError > 0 && (
                    <span className="text-xs font-semibold text-red-500">✗ {gError}</span>
                  )}
                </div>
              </button>

              {/* Table */}
              {isOpen && (
                <div className="overflow-x-auto border-t border-inherit">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-black/5 dark:bg-white/5 text-xs text-muted-foreground uppercase tracking-wide">
                        <th className="text-left px-4 py-2.5 font-semibold w-16">Method</th>
                        <th className="text-left px-4 py-2.5 font-semibold">Endpoint</th>
                        <th className="text-left px-4 py-2.5 font-semibold w-44">Status</th>
                        <th className="text-left px-4 py-2.5 font-semibold w-16">Skip</th>
                        <th className="text-right px-4 py-2.5 font-semibold w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {group.endpoints.map(ep => {
                        const res = results[ep.id];
                        const isLoading = res?.status === 'loading';

                        return (
                          <>
                            <tr
                              key={ep.id}
                              className={`group transition-colors ${
                                res?.status === 'success'
                                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                                  : res?.status === 'error'
                                  ? 'bg-red-50/60 dark:bg-red-950/20'
                                  : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                              }`}
                            >
                              <td className="px-4 py-3">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${METHOD_COLOR[ep.method]}`}>
                                  {ep.method}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="font-mono text-xs text-foreground font-medium">{ep.path}</span>
                                  {ep.note && <span className="text-[10px] text-muted-foreground mt-0.5">{ep.note}</span>}
                                  {ep.body && (
                                    <span className="text-[10px] text-muted-foreground mt-0.5 font-mono opacity-60">
                                      body: {truncateJson(ep.body, 60)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <StatusChip result={res} />
                              </td>
                              <td className="px-4 py-3">
                                {ep.skipInBulk && (
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    bulk skip
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => testOne(ep)}
                                  disabled={isLoading || runningAll}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-40 transition-colors"
                                >
                                  {isLoading
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <Play className="w-3 h-3" />
                                  }
                                  Test
                                </button>
                              </td>
                            </tr>
                            {/* Inline response preview row */}
                            {(res?.status === 'success' || res?.status === 'error') && (
                              <tr key={`${ep.id}-preview`} className={
                                res.status === 'success'
                                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                                  : 'bg-red-50/60 dark:bg-red-950/20'
                              }>
                                <ResponsePreview result={res} />
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground pb-8">
          Destructive endpoints (DELETE, password change, logout) are marked <span className="font-semibold">bulk skip</span> and won&apos;t run during &quot;Test All&quot;. Use individual Test buttons to run them manually.
        </p>
      </div>
    </div>
  );
}
