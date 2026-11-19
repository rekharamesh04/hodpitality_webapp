import { describe, expect, it } from 'vitest';
import { clinicReadiness, doctorReadiness, isDoctor, isUsTimezone, stepsLeft } from './zocdoc-readiness';
import type { Guest, Staff } from '@/types';

const doc = (over: Partial<Staff> = {}): Staff =>
  ({ id: 'd', name: 'Dr A', role: 'practitioner', status: 'active', ...over }) as Staff;
const verifiedDoc = doc({
  npi: '1437152048', npiRegistry: { name: 'ANN ABRAHAM' }, schedule: { mon: '08:00-17:00' },
});
const patient = (over: Partial<Guest> = {}): Guest => ({ id: 'p', name: 'P', ...over }) as Guest;

const state = (items: ReturnType<typeof clinicReadiness>, id: string) => items.find((i) => i.id === id)!.state;

describe('isDoctor / isUsTimezone', () => {
  it('counts active doctor roles only', () => {
    expect(isDoctor(doc())).toBe(true);
    expect(isDoctor(doc({ role: 'doctor' }))).toBe(true);
    expect(isDoctor(doc({ role: 'receptionist' }))).toBe(false);
    expect(isDoctor(doc({ status: 'inactive' }))).toBe(false);
  });
  it('knows US timezones', () => {
    expect(isUsTimezone('America/Chicago')).toBe(true);
    expect(isUsTimezone('Pacific/Honolulu')).toBe(true);
    expect(isUsTimezone('Asia/Kolkata')).toBe(false);
    expect(isUsTimezone(undefined)).toBe(false);
  });
});

describe('clinicReadiness', () => {
  it('is done where the records are complete, and Zocdoc steps stay pending', () => {
    const items = clinicReadiness({
      staff: [verifiedDoc, doc({ role: 'receptionist' })],
      patients: [patient({ insurance: { carrier: 'Aetna' } }), patient({ insurance: { selfPay: true } })],
      timezone: { timezone: 'America/Chicago', isDefault: false },
    });
    expect(['npi', 'hours', 'timezone', 'insurance'].map((id) => state(items, id))).toEqual(['done', 'done', 'done', 'done']);
    expect(state(items, 'account')).toBe('pending');
    expect(state(items, 'sync')).toBe('pending');
    expect(stepsLeft(items)).toBe(0);
  });

  it('counts what is missing, with real numbers', () => {
    const items = clinicReadiness({
      staff: [verifiedDoc, doc({ npi: '1234567893' }), doc()],
      patients: [patient({ insurance: { carrier: 'Aetna' } }), patient()],
      timezone: { timezone: 'Asia/Kolkata', isDefault: true },
    });
    expect(items.find((i) => i.id === 'npi')!.detail).toContain('1 of 3 doctors');
    expect(items.find((i) => i.id === 'hours')!.detail).toContain('1 of 3 doctors');
    expect(items.find((i) => i.id === 'insurance')!.detail).toContain('1 of 2 patients');
    expect(items.find((i) => i.id === 'timezone')!.detail).toContain('Asia/Kolkata (the default)');
    expect(stepsLeft(items)).toBe(4);
  });

  it('a non-default but non-US timezone is not ready', () => {
    const items = clinicReadiness({ staff: [], patients: [], timezone: { timezone: 'Europe/London', isDefault: false } });
    expect(state(items, 'timezone')).toBe('todo');
  });
});

describe('doctorReadiness', () => {
  it('shows verified NPI and hours, and the listing as pending', () => {
    const items = doctorReadiness(verifiedDoc);
    expect(items.map((i) => i.state)).toEqual(['done', 'done', 'pending']);
  });
  it('an NPI saved without a registry check is not counted as verified', () => {
    const items = doctorReadiness(doc({ npi: '1234567893' }));
    expect(items[0].state).toBe('todo');
    expect(items[0].detail).toContain('has not been checked');
  });
});
