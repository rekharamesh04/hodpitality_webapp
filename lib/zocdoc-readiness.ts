/**
 * How ready a clinic, or one doctor, is for Zocdoc — counted from real records.
 *
 * Zocdoc is NOT connected: that needs Zocdoc to approve a partner account and
 * issue keys. These checklists say so plainly, and show what is already in
 * place (verified NPIs, weekly hours, US timezone, insurance on file) so a
 * clinic can get ready while it waits. Nothing here talks to Zocdoc.
 */
import { PRESCRIBER_ROLES } from '@/constants/roles';
import { hasSchedule } from '@/lib/availability';
import { hasInsurance } from '@/lib/clinical';
import type { Guest, Staff } from '@/types';

export type ReadinessState = 'done' | 'todo' | 'pending';

export interface ReadinessItem {
  id: string;
  label: string;
  state: ReadinessState;
  detail: string;
}

/** The step only Zocdoc can complete. Always pending until the integration exists. */
export const ZOCDOC_PENDING_ITEMS: readonly ReadinessItem[] = [
  {
    id: 'account',
    label: 'Zocdoc partner account',
    state: 'pending',
    detail: 'Waiting for Zocdoc to approve the partner account and send the sandbox keys.',
  },
  {
    id: 'sync',
    label: 'Open times sent to Zocdoc, bookings received back',
    state: 'pending',
    detail: 'Built and tested once the Zocdoc keys arrive. Nothing is sent to Zocdoc today.',
  },
];

export function isDoctor(s: Pick<Staff, 'role' | 'status'>): boolean {
  return (PRESCRIBER_ROLES as readonly string[]).includes(String(s.role)) && s.status !== 'inactive';
}

/** US IANA zones: America/* (mainland, Alaska) and Pacific/Honolulu. */
export function isUsTimezone(tz: string | undefined | null): boolean {
  return !!tz && (tz.startsWith('America/') || tz === 'Pacific/Honolulu');
}

function count(n: number, total: number, what: string): string {
  return `${n} of ${total} ${what}`;
}

export function clinicReadiness(input: {
  staff: readonly Staff[];
  patients: readonly Guest[];
  timezone?: { timezone: string; isDefault: boolean } | null;
}): ReadinessItem[] {
  const doctors = input.staff.filter(isDoctor);
  const verified = doctors.filter((d) => !!d.npi && !!d.npiRegistry?.name).length;
  const withHours = doctors.filter((d) => hasSchedule(d.schedule)).length;
  const insured = input.patients.filter((p) => hasInsurance(p.insurance)).length;
  const tz = input.timezone;
  const tzReady = !!tz && !tz.isDefault && isUsTimezone(tz.timezone);

  return [
    {
      id: 'npi',
      label: 'Doctors have a verified NPI',
      state: doctors.length > 0 && verified === doctors.length ? 'done' : 'todo',
      detail: doctors.length
        ? `${count(verified, doctors.length, 'doctors')} — checked with the US NPI Registry.`
        : 'No doctors yet. Add staff with the Doctor role.',
    },
    {
      id: 'hours',
      label: 'Doctors have weekly hours',
      state: doctors.length > 0 && withHours === doctors.length ? 'done' : 'todo',
      detail: doctors.length
        ? `${count(withHours, doctors.length, 'doctors')} — Zocdoc can only offer times inside these hours.`
        : 'Add doctors first, then Set Schedule on each profile.',
    },
    {
      id: 'timezone',
      label: 'Clinic timezone is a US timezone',
      state: tzReady ? 'done' : 'todo',
      detail: tzReady
        ? `Set to ${tz!.timezone}.`
        : `Now ${tz?.timezone ?? 'unknown'}${tz?.isDefault ? ' (the default)' : ''}. Set it under Settings → Timezone, or Zocdoc would show the wrong times.`,
    },
    {
      id: 'insurance',
      label: 'Patients have insurance on file',
      state: input.patients.length > 0 && insured === input.patients.length ? 'done' : 'todo',
      detail: input.patients.length
        ? `${count(insured, input.patients.length, 'patients')} have insurance or self-pay recorded.`
        : 'No patients yet.',
    },
    ...ZOCDOC_PENDING_ITEMS,
  ];
}

export function doctorReadiness(doctor: Staff): ReadinessItem[] {
  const verified = !!doctor.npi && !!doctor.npiRegistry?.name;
  return [
    {
      id: 'npi',
      label: 'Verified NPI',
      state: verified ? 'done' : 'todo',
      detail: verified
        ? `${doctor.npi}, checked with the US NPI Registry.`
        : doctor.npi
          ? `${doctor.npi} has not been checked. Edit the doctor and save the NPI again.`
          : 'No NPI yet. Add it with Edit — Zocdoc finds doctors by NPI.',
    },
    {
      id: 'hours',
      label: 'Weekly hours',
      state: hasSchedule(doctor.schedule) ? 'done' : 'todo',
      detail: hasSchedule(doctor.schedule)
        ? 'Set. Open times are worked out from these hours.'
        : 'Not set. Use Set Schedule — Zocdoc can only offer times inside working hours.',
    },
    {
      id: 'listing',
      label: 'Listed on Zocdoc',
      state: 'pending',
      detail: 'Pending — Zocdoc is not connected yet. The doctor is not visible on Zocdoc.',
    },
  ];
}

/** How many checklist steps the clinic can still do itself (everything not done and not waiting on Zocdoc). */
export function stepsLeft(items: readonly ReadinessItem[]): number {
  return items.filter((i) => i.state === 'todo').length;
}
