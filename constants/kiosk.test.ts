import { describe, expect, it } from 'vitest';
import type { Appointment, CheckIn } from '@/types';
import { kioskDecision, kioskGreetingName, kioskPhoneMatch, visitFee } from './kiosk';

const TODAY = '2026-10-13';
const local = (hhmm: string, day = TODAY) => new Date(`${day}T${hhmm}:00`).toISOString();

function appt(id: string, extra: Partial<Appointment> = {}): Appointment {
  return { id, date: TODAY, startTime: '10:00', status: 'scheduled', staffName: 'Dr Rao', service: 'Consultation', ...extra };
}
function visit(extra: Partial<CheckIn> = {}): CheckIn {
  return {
    id: 'c1', guestId: 'p1', guestName: 'Asha', guestEmail: '', checkInTime: '', checkInMethod: 'Manual',
    badgePrinted: false, status: 'arrived', timestamp: local('09:00'), ...extra,
  };
}
const decide = (appointments: Appointment[], checkIns: CheckIn[], standardFee = 100) =>
  kioskDecision({ appointments, checkIns, today: TODAY, standardFee });

describe('the kiosk decision', () => {
  it('checks in someone who is not here yet, naming their next booking', () => {
    const d = decide([appt('late', { startTime: '15:00' }), appt('soon', { startTime: '11:00' })], []);
    expect(d.kind).toBe('check_in');
    expect(d.kind === 'check_in' && d.nextAppointment?.id).toBe('soon');
  });

  it('checks in again after an earlier visit today was checked out', () => {
    expect(decide([], [visit({ status: 'completed' })]).kind).toBe('check_in');
  });

  it('ignores yesterday’s open visit', () => {
    expect(decide([], [visit({ timestamp: local('09:00', '2026-10-12') })]).kind).toBe('check_in');
  });

  it('tells someone still waiting, or with the doctor, to wait', () => {
    expect(decide([appt('a', { status: 'arrived' })], [visit()]).kind).toBe('waiting');
    const d = decide([appt('a', { status: 'in-progress' }), appt('b', { status: 'arrived' })], [visit()]);
    expect(d.kind === 'waiting' && d.appointment?.id).toBe('a');
  });

  it('checks out a finished visit with its own fee', () => {
    const d = decide([appt('a', { status: 'completed', amount: 40 })], [visit()]);
    expect(d).toMatchObject({ kind: 'check_out', total: 40 });
    expect(d.kind === 'check_out' && d.charges[0]).toMatchObject({ amount: 40, usesStandardFee: false, label: 'Consultation with Dr Rao' });
  });

  it('charges the standard fee for a visit with none', () => {
    const d = decide([appt('a', { status: 'completed', amount: 0 })], [visit()], 100);
    expect(d).toMatchObject({ kind: 'check_out', total: 100 });
    expect(d.kind === 'check_out' && d.charges[0].usesStandardFee).toBe(true);
  });

  it('charges nothing already paid, waived or cancelled', () => {
    const d = decide([
      appt('paid', { status: 'completed', paymentStatus: 'paid', amount: 40 }),
      appt('waived', { status: 'incomplete', paymentStatus: 'waived' }),
      appt('cancelled', { status: 'cancelled' }),
    ], [visit()]);
    expect(d).toEqual({ kind: 'check_out', charges: [], total: 0 });
  });

  it('adds up two finished visits', () => {
    const d = decide([appt('a', { status: 'completed', amount: 40 }), appt('b', { status: 'completed' })], [visit()], 100);
    expect(d.kind === 'check_out' && d.total).toBe(140);
  });

  it('lets a checked-in walk-in with no visit leave without charge', () => {
    expect(decide([], [visit()])).toEqual({ kind: 'check_out', charges: [], total: 0 });
  });
});

describe('fees and names', () => {
  it('never charges a negative standard fee', () => {
    expect(visitFee({ amount: 0 }, -5).amount).toBe(0);
    expect(visitFee({ amount: undefined }, 100)).toEqual({ amount: 100, usesStandardFee: true });
  });

  it('shows only the first name', () => {
    expect(kioskGreetingName('Asha Rao')).toBe('Asha');
    expect(kioskGreetingName('  ')).toBe('there');
    expect(kioskGreetingName(undefined)).toBe('there');
  });
});

describe('checking in by phone number', () => {
  const people = [
    { id: 'p1', name: 'Asha Rao', phone: '+1 (512) 555-0134' },
    { id: 'p2', name: 'Ben Ortiz', phone: '512-555-0199' },
    { id: 'p3', name: 'Cara Ortiz', phone: '(512) 555 0199' },
  ];

  it('finds the one person with that number, however it was typed', () => {
    expect(kioskPhoneMatch(people, '5125550134')?.id).toBe('p1');
    expect(kioskPhoneMatch(people, '1-512-555-0134')?.id).toBe('p1');
  });

  it('does not match part of a number', () => {
    expect(kioskPhoneMatch(people, '5550134')).toBeUndefined();
  });

  it('sends people who share a number to the desk rather than guessing', () => {
    expect(kioskPhoneMatch(people, '5125550199')).toBeUndefined();
  });

  it('counts the same record found twice as one person', () => {
    expect(kioskPhoneMatch([people[0], people[0]], '5125550134')?.id).toBe('p1');
  });

  it('ignores a number too short to identify anyone', () => {
    expect(kioskPhoneMatch([{ id: 'x', phone: '12345' }], '12345')).toBeUndefined();
  });
});
