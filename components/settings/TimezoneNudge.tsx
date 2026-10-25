'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { useAuthStore } from '@/store';
import { canManageStaff } from '@/constants/roles';
import { useOrgTimezone } from '@/hooks/useSettings';
import { deviceTimezone, sameClock } from './TimezoneSettingsCard';

/**
 * Tells an administrator when their organisation's timezone looks wrong — never set (so India
 * time is used) or different from where this device is. A clinic in Texas left on India time
 * would see afternoon check-ins land on tomorrow's calendar.
 */
export function TimezoneNudge() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = canManageStaff(role) && role !== 'super_admin' && role !== 'reseller';
  const { data } = useOrgTimezone({ enabled: isAdmin });
  const device = deviceTimezone();
  if (!isAdmin || !data || !device || sameClock(data.timezone, device)) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <span>
          Your organisation runs on <span className="font-medium">{data.timezone.replace(/_/g, ' ')}</span> time
          {data.isDefault ? ' (never set)' : ''}, but this device is on <span className="font-medium">{device.replace(/_/g, ' ')}</span>.
          Appointments and check-ins are filed by the organisation&apos;s day.
        </span>
      </p>
      <Link href="/settings?tab=organization" className="shrink-0 font-medium text-primary hover:underline">
        Set timezone
      </Link>
    </div>
  );
}
