import { describe, expect, it } from 'vitest';
import {
  checkTime, clockInZone, formatClock, hasSchedule, openSlots, parseClock, parseDayHours, weekDayOf,
} from './availability';

// 2026-11-18 is a Wednesday, 2026-11-22 a Sunday.
const WED = '2026-11-18';
const SUN = '2026-11-22';

describe('parseClock', () => {
  it('reads 24-hour, short and am/pm forms', () => {
    expect(parseClock('09:00')).toBe(540);
    expect(parseClock('9:00')).toBe(540);
    expect(parseClock('9')).toBe(540);
    expect(parseClock('14:30:00')).toBe(870);
    expect(parseClock('2:30 PM')).toBe(870);
    expect(parseClock('12:00 am')).toBe(0);
    expect(parseClock('12:15 p.m.')).toBe(735);
  });
  it('refuses what it cannot read', () => {
    for (const bad of ['', 'noon', '25:00', '10:75', '13:00 pm', undefined, 900]) {
      expect(parseClock(bad as unknown)).toBeNull();
    }
  });
  it('round-trips through formatClock', () => {
    expect(formatClock(parseClock('7:05')!)).toBe('07:05');
  });
});

describe('parseDayHours', () => {
  it('treats blank as a day off', () => {
    expect(parseDayHours('')).toEqual([]);
    expect(parseDayHours(undefined)).toEqual([]);
  });
  it('reads a range, a break, and dash variants', () => {
    expect(parseDayHours('09:00-17:00')).toEqual([{ start: 540, end: 1020 }]);
    expect(parseDayHours('14:00 – 17:00, 9:00-13:00')).toEqual([
      { start: 540, end: 780 }, { start: 840, end: 1020 },
    ]);
  });
  it('rejects nonsense and backwards ranges', () => {
    expect(parseDayHours('morning')).toBeNull();
    expect(parseDayHours('17:00-09:00')).toBeNull();
    expect(parseDayHours('09:00')).toBeNull();
  });
});

describe('weekDayOf', () => {
  it('names the day without timezone drift', () => {
    expect(weekDayOf(WED)).toBe('wed');
    expect(weekDayOf(SUN)).toBe('sun');
    expect(weekDayOf('18/11/2026')).toBeNull();
  });
});

describe('clockInZone', () => {
  // 2026-11-19 19:45 UTC = 13:45 in Chicago (CST, UTC-6) and 01:15 next day in Kolkata (UTC+5:30).
  const instant = new Date(Date.UTC(2026, 10, 19, 19, 45));

  it('reads the clinic’s own date and time', () => {
    expect(clockInZone('America/Chicago', instant)).toEqual({ date: '2026-11-19', minutes: 13 * 60 + 45 });
    expect(clockInZone('Asia/Kolkata', instant)).toEqual({ date: '2026-11-20', minutes: 1 * 60 + 15 });
  });

  it('handles midnight as 00:xx, not 24:xx', () => {
    const midnightChicago = new Date(Date.UTC(2026, 10, 20, 6, 5)); // 00:05 CST
    expect(clockInZone('America/Chicago', midnightChicago)).toEqual({ date: '2026-11-20', minutes: 5 });
  });

  it('falls back to the browser clock for a missing or unknown zone', () => {
    const local = clockInZone(undefined, instant);
    expect(local.minutes).toBe(instant.getHours() * 60 + instant.getMinutes());
    expect(clockInZone('Not/AZone', instant)).toEqual(local);
  });
});

describe('hasSchedule', () => {
  it('is false for missing, empty, or unreadable schedules', () => {
    expect(hasSchedule(undefined)).toBe(false);
    expect(hasSchedule({})).toBe(false);
    expect(hasSchedule({ mon: 'whenever' })).toBe(false);
    expect(hasSchedule({ mon: '09:00-17:00' })).toBe(true);
  });
});

describe('openSlots', () => {
  const schedule = { mon: '09:00-17:00', wed: '09:00-12:00, 13:00-14:00' };

  it('returns null when there is no schedule, so the form shows nothing extra', () => {
    expect(openSlots({ schedule: undefined, date: WED })).toBeNull();
    expect(openSlots({ schedule: {}, date: WED })).toBeNull();
  });

  it('returns an empty list on a day off', () => {
    expect(openSlots({ schedule, date: SUN })).toEqual([]);
  });

  it('fits the visit inside working hours and skips the break', () => {
    const slots = openSlots({ schedule, date: WED, duration: 60, step: 30 })!;
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00', '13:00']);
  });

  it('removes times that overlap a booking, not just the same start', () => {
    const bookings = [{ date: WED, startTime: '10:00', duration: 30, status: 'scheduled' }];
    const slots = openSlots({ schedule, date: WED, duration: 30, step: 15, bookings })!;
    expect(slots).not.toContain('09:45'); // 9:45–10:15 runs into it
    expect(slots).not.toContain('10:00');
    expect(slots).not.toContain('10:15');
    expect(slots).toContain('09:30');
    expect(slots).toContain('10:30');
  });

  it('ignores cancelled and no-show bookings, which free the time', () => {
    for (const status of ['cancelled', 'no-show', 'no_show']) {
      const bookings = [{ date: WED, startTime: '10:00', duration: 30, status }];
      expect(openSlots({ schedule, date: WED, bookings })).toContain('10:00');
    }
  });

  it('ignores bookings on other days and bookings with unreadable times', () => {
    const bookings = [
      { date: '2026-11-19', startTime: '10:00', duration: 30 },
      { date: WED, startTime: 'later', duration: 30 },
    ];
    expect(openSlots({ schedule, date: WED, bookings })).toContain('10:00');
  });

  it('drops times already past when notBefore is given', () => {
    const slots = openSlots({ schedule, date: WED, step: 60, notBefore: 10 * 60 + 1 })!;
    expect(slots[0]).toBe('11:00');
  });
});

describe('checkTime', () => {
  const schedule = { wed: '09:00-12:00' };

  it('is ok inside hours with no clash', () => {
    expect(checkTime({ schedule, date: WED, startTime: '10:00' })).toEqual({ kind: 'ok' });
  });
  it('flags a day off and times outside hours', () => {
    expect(checkTime({ schedule, date: SUN, startTime: '10:00' }).kind).toBe('day-off');
    expect(checkTime({ schedule, date: WED, startTime: '11:45', duration: 30 })).toEqual({
      kind: 'outside-hours', hours: '09:00–12:00',
    });
  });
  it('flags an overlap even when the doctor has no schedule', () => {
    const bookings = [{ date: WED, startTime: '10:00', duration: 30 }];
    expect(checkTime({ schedule: undefined, date: WED, startTime: '10:15', bookings })).toEqual({
      kind: 'overlap', with: '10:00',
    });
  });
  it('can ignore the booking being edited', () => {
    const bookings = [{ id: 'a1', date: WED, startTime: '10:00', duration: 30 }];
    expect(checkTime({ schedule, date: WED, startTime: '10:00', bookings, ignoreId: 'a1' }).kind).toBe('ok');
  });
  it('says unknown, never "wrong", when it cannot tell', () => {
    expect(checkTime({ schedule: undefined, date: WED, startTime: '10:00' }).kind).toBe('unknown');
    expect(checkTime({ schedule, date: WED, startTime: '' }).kind).toBe('unknown');
  });
});
