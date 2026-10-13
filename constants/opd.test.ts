import { describe, expect, it } from 'vitest';
import type { Appointment, CheckIn } from '@/types';
import {
  assignTokens, buildLanes, compareQueue, opdStageOf, unassignedArrivals, visitPriorityOf,
  vitalsSummary, waitingMinutes, waitTone, walkInSlot, isOpenCheckIn, BP_PATTERN,
} from './opd';

const DAY = '2026-10-13';

function appt(id: string, extra: Partial<Appointment> = {}): Appointment {
  return { id, date: DAY, startTime: '10:00', staffId: 'dr-a', staffName: 'Dr Asha Rao', customerId: `p-${id}`, status: 'scheduled', ...extra };
}

const at = (hhmm: string) => `${DAY}T${hhmm}:00.000Z`;

describe('the stage of a visit', () => {
  it('maps every status the API sends', () => {
    expect(opdStageOf({ status: 'scheduled' })).toBe('booked');
    expect(opdStageOf({ status: 'confirmed' })).toBe('booked');
    expect(opdStageOf({ status: 'arrived' })).toBe('waiting');
    expect(opdStageOf({ status: 'in-progress' })).toBe('with_doctor');
    expect(opdStageOf({ status: 'in_progress' as Appointment['status'] })).toBe('with_doctor');
    expect(opdStageOf({ status: 'completed' })).toBe('done');
    expect(opdStageOf({ status: 'incomplete' })).toBe('done');
    expect(opdStageOf({ status: 'no-show' })).toBe('off');
    expect(opdStageOf({ status: 'cancelled' })).toBe('off');
    expect(opdStageOf({ status: undefined })).toBe('booked');
  });
});

describe('priority', () => {
  it('lets triage override the record', () => {
    expect(visitPriorityOf({ customerCategory: 'Emergency', visitPriority: 'routine' })).toBe('routine');
    expect(visitPriorityOf({ visitPriority: 'emergency' })).toBe('emergency');
  });

  it('falls back to the record until triage has run', () => {
    expect(visitPriorityOf({ customerCategory: 'emergency' })).toBe('emergency');
    expect(visitPriorityOf({ isPriority: true })).toBe('urgent');
    expect(visitPriorityOf({})).toBe('routine');
  });

  it('ignores a priority value it does not know', () => {
    expect(visitPriorityOf({ visitPriority: 'whenever' as never, isPriority: true })).toBe('urgent');
  });
});

describe('tokens', () => {
  it('number each doctor’s patients in order of arrival', () => {
    const rows = [
      appt('late', { status: 'arrived', arrivedAt: at('09:30') }),
      appt('early', { status: 'arrived', arrivedAt: at('09:05') }),
      appt('other-doc', { status: 'arrived', arrivedAt: at('09:10'), staffId: 'dr-b' }),
      appt('not-here', { status: 'scheduled' }),
    ];
    const tokens = assignTokens(rows);
    expect(tokens.get('early')).toBe(1);
    expect(tokens.get('late')).toBe(2);
    expect(tokens.get('other-doc')).toBe(1);
    expect(tokens.has('not-here')).toBe(false);
  });

  it('are kept by patients who have left the queue, so nobody behind is renumbered', () => {
    const rows = [
      appt('a', { status: 'completed', arrivedAt: at('09:00') }),
      appt('b', { status: 'no-show', arrivedAt: at('09:10') }),
      appt('c', { status: 'arrived', arrivedAt: at('09:20') }),
    ];
    expect(assignTokens(rows).get('c')).toBe(3);
  });

  it('fall back to the booked slot for a visit from before arrival was stamped', () => {
    const rows = [
      appt('legacy', { status: 'arrived', startTime: '08:45' }),
      appt('stamped', { status: 'arrived', arrivedAt: at('09:00') }),
    ];
    expect(assignTokens(rows).get('legacy')).toBe(1);
  });
});

describe('calling order', () => {
  it('puts emergencies first, then urgent, then whoever has waited longest', () => {
    const rows = [
      appt('routine-early', { status: 'arrived', arrivedAt: at('09:00') }),
      appt('urgent', { status: 'arrived', arrivedAt: at('09:20'), isPriority: true }),
      appt('routine-late', { status: 'arrived', arrivedAt: at('09:10') }),
      appt('emergency', { status: 'arrived', arrivedAt: at('09:40'), visitPriority: 'emergency' }),
    ];
    const tokens = assignTokens(rows);
    expect([...rows].sort(compareQueue(tokens)).map((a) => a.id))
      .toEqual(['emergency', 'urgent', 'routine-early', 'routine-late']);
  });
});

describe('lanes', () => {
  it('give each doctor their own piles, with unassigned visits last', () => {
    const rows = [
      appt('w', { status: 'arrived', arrivedAt: at('09:00'), room: 'OPD 3' }),
      appt('in', { status: 'in-progress', arrivedAt: at('08:50') }),
      appt('b', { status: 'scheduled', startTime: '11:00' }),
      appt('d', { status: 'completed', arrivedAt: at('08:30') }),
      appt('x', { status: 'cancelled' }),
      appt('z', { staffId: 'dr-z', staffName: 'Dr Zed', status: 'arrived', arrivedAt: at('09:00') }),
      appt('none', { staffId: '', staffName: '', status: 'arrived', arrivedAt: at('09:00') }),
    ];
    const lanes = buildLanes(rows, assignTokens(rows));
    expect(lanes.map((l) => l.doctorName)).toEqual(['Dr Asha Rao', 'Dr Zed', 'No doctor assigned']);
    const rao = lanes[0];
    expect(rao.room).toBe('OPD 3');
    expect(rao.waiting.map((a) => a.id)).toEqual(['w']);
    expect(rao.withDoctor.map((a) => a.id)).toEqual(['in']);
    expect(rao.booked.map((a) => a.id)).toEqual(['b']);
    expect(rao.done.map((a) => a.id)).toEqual(['d']);
    expect(rao.off.map((a) => a.id)).toEqual(['x']);
  });
});

describe('waiting time', () => {
  const now = Date.parse(at('10:00'));

  it('runs from arrival until the doctor called them in', () => {
    expect(waitingMinutes({ arrivedAt: at('09:15'), consultStartedAt: at('09:40') }, now)).toBe(25);
  });

  it('runs until now while they are still waiting', () => {
    expect(waitingMinutes({ arrivedAt: at('09:15') }, now)).toBe(45);
  });

  it('is unknown, not zero, without an arrival time', () => {
    expect(waitingMinutes({}, now)).toBeNull();
    expect(waitingMinutes({ arrivedAt: 'garbage' }, now)).toBeNull();
  });

  it('is coloured by how long it has been', () => {
    expect(waitTone(5)).toBe('ok');
    expect(waitTone(30)).toBe('warn');
    expect(waitTone(60)).toBe('late');
  });
});

describe('walk-ins', () => {
  // Local-time timestamps, so the business day is the same in any test zone.
  const local = (hhmm: string) => new Date(`${DAY}T${hhmm}:00`).toISOString();
  const checkIn = (guestId: string, extra: Partial<CheckIn> = {}): CheckIn => ({
    id: `c-${guestId}-${extra.timestamp ?? ''}`, guestId, guestName: guestId, guestEmail: '', checkInTime: '',
    checkInMethod: 'Manual', badgePrinted: false, status: 'arrived', timestamp: local('09:00'), ...extra,
  });

  it('are people checked in today whom no doctor has on their list', () => {
    const appts = [appt('1', { customerId: 'booked' })];
    const result = unassignedArrivals([checkIn('booked'), checkIn('walk-in')], appts, DAY);
    expect(result.map((c) => c.guestId)).toEqual(['walk-in']);
  });

  it('count a person once, however often they were scanned', () => {
    const result = unassignedArrivals(
      [checkIn('p', { timestamp: local('09:00') }), checkIn('p', { timestamp: local('09:30') })], [], DAY);
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(local('09:30'));
  });

  it('leave out people already checked out, other days, and cancelled bookings', () => {
    const appts = [appt('1', { customerId: 'cancelled', status: 'cancelled' })];
    const result = unassignedArrivals([
      checkIn('gone', { status: 'completed' }),
      checkIn('yesterday', { timestamp: new Date('2026-10-12T09:00:00').toISOString() }),
      checkIn('cancelled'),
    ], appts, DAY);
    expect(result.map((c) => c.guestId)).toEqual(['cancelled']);
  });

  it('treat only the backend’s open statuses as still on site', () => {
    expect(isOpenCheckIn({ status: 'arrived' })).toBe(true);
    expect(isOpenCheckIn({ status: undefined })).toBe(true);
    expect(isOpenCheckIn({ status: 'completed' })).toBe(false);
  });

  it('are booked into the current minute, moving on a minute per retry', () => {
    const now = new Date(2026, 9, 13, 9, 58);
    expect(walkInSlot(now)).toBe('09:58');
    expect(walkInSlot(now, 3)).toBe('10:01');
    expect(walkInSlot(new Date(2026, 9, 13, 23, 59), 5)).toBe('23:59');
  });
});

describe('triage', () => {
  it('summarises only what was measured', () => {
    expect(vitalsSummary({ bp: '120/80', temperature: 99.1, spo2: 97 })).toBe('BP 120/80 · Temp 99.1°F · SpO₂ 97%');
    expect(vitalsSummary(undefined)).toBe('');
    expect(vitalsSummary({})).toBe('');
  });

  it('accepts a blood pressure written as systolic/diastolic', () => {
    expect(BP_PATTERN.test('120/80')).toBe(true);
    expect(BP_PATTERN.test('120 / 80')).toBe(true);
    expect(BP_PATTERN.test('120')).toBe(false);
    expect(BP_PATTERN.test('abc/80')).toBe(false);
  });
});
