'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrgTimezone, useUpdateOrgTimezone } from '@/hooks/useSettings';

/** The zones our organisations work in. Any other IANA name already saved is listed too. */
export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: 'America/New_York', label: 'US Eastern (New York)' },
  { value: 'America/Chicago', label: 'US Central (Texas, Chicago)' },
  { value: 'America/Denver', label: 'US Mountain (Denver)' },
  { value: 'America/Phoenix', label: 'US Arizona (Phoenix)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (Los Angeles)' },
  { value: 'America/Anchorage', label: 'US Alaska' },
  { value: 'Pacific/Honolulu', label: 'US Hawaii' },
  { value: 'America/Toronto', label: 'Canada Eastern (Toronto)' },
  { value: 'Europe/London', label: 'UK (London)' },
  { value: 'Asia/Dubai', label: 'UAE (Dubai)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Australia/Sydney', label: 'Australia Eastern (Sydney)' },
];

/** Old names browsers still report, mapped to the ones the zone database now uses. */
const LEGACY_ZONES: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Asia/Rangoon': 'Asia/Yangon',
  'US/Eastern': 'America/New_York',
  'US/Central': 'America/Chicago',
  'US/Mountain': 'America/Denver',
  'US/Arizona': 'America/Phoenix',
  'US/Pacific': 'America/Los_Angeles',
  'US/Alaska': 'America/Anchorage',
  'US/Hawaii': 'Pacific/Honolulu',
};

/** The timezone this browser runs in, e.g. "America/Chicago" — never a legacy alias. */
export function deviceTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return LEGACY_ZONES[tz] ?? tz;
  } catch {
    return '';
  }
}

function offsetOn(tz: string, date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
    .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ?? '';
}

/**
 * Whether two zone names keep the same clock — in January and in July, so daylight saving counts.
 * "Asia/Calcutta" and "Asia/Kolkata" are the same place; Phoenix and Denver are not.
 */
export function sameClock(a: string, b: string): boolean {
  if (a === b) return true;
  try {
    const year = new Date().getFullYear();
    return [new Date(Date.UTC(year, 0, 15)), new Date(Date.UTC(year, 6, 15))]
      .every((d) => offsetOn(a, d) === offsetOn(b, d));
  } catch {
    return false;
  }
}

function nowIn(tz: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeZone: tz, weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date());
  } catch {
    return '';
  }
}

/**
 * The organisation's timezone. It decides which calendar day a check-in belongs to, which
 * appointments are "today", when the nightly clean-up marks a booking a no-show, and the hours on
 * the reports. Never set means India time — so a clinic elsewhere must set it.
 */
export function TimezoneSettingsCard() {
  const { data } = useOrgTimezone();
  const save = useUpdateOrgTimezone();
  const device = useMemo(deviceTimezone, []);
  const [tz, setTz] = useState('');

  useEffect(() => {
    if (data) setTz(data.isDefault && device ? device : data.timezone);
  }, [data, device]);

  const options = useMemo(() => {
    const extra = [data?.timezone, device].filter((z): z is string => !!z && !COMMON_TIMEZONES.some((c) => c.value === z));
    return [...COMMON_TIMEZONES, ...[...new Set(extra)].map((z) => ({ value: z, label: z.replace(/_/g, ' ') }))];
  }, [data?.timezone, device]);

  const mismatch = !!data && !!device && !sameClock(data.timezone, device);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timezone</CardTitle>
        <CardDescription>
          Decides which day a visit belongs to, which appointments count as today, and when an
          unattended booking is marked a no-show.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mismatch && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <p>
              {data.isDefault ? 'Not set yet, so India time is used.' : `Saved as ${data.timezone}.`} This device is on{' '}
              <span className="font-medium">{device}</span>. If that is where you work, save it below.
            </p>
          </div>
        )}
        <div className="space-y-1.5 sm:max-w-sm">
          <Label htmlFor="org-timezone">Organisation timezone</Label>
          <Select value={tz} onValueChange={setTz}>
            <SelectTrigger id="org-timezone"><SelectValue placeholder="Choose a timezone" /></SelectTrigger>
            <SelectContent>
              {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {tz && <p className="text-xs text-muted-foreground">It is {nowIn(tz)} there now.</p>}
        </div>
        <Button onClick={() => save.mutate(tz)} loading={save.isPending} disabled={!tz || (tz === data?.timezone && !data?.isDefault)}>
          Save timezone
        </Button>
      </CardContent>
    </Card>
  );
}
