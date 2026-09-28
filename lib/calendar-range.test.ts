import { describe, expect, it } from 'vitest';
import { assignLanes, computeTimeRange, startOfWeek, weekDates, formatHourLabel } from './calendar-range';

describe('computeTimeRange', () => {
  it('spans one hour before the first appointment to one hour after the last', () => {
    const range = computeTimeRange([
      { startTime: '10:00', duration: 30 },
      { startTime: '14:00', duration: 60 },
    ]);
    expect(range).toEqual({ start: 9 * 60, end: 16 * 60 });
  });

  it('snaps to whole hours', () => {
    expect(computeTimeRange([{ startTime: '10:30', duration: 45 }])).toEqual({ start: 9 * 60, end: 13 * 60 });
  });

  it('is not stretched to a fixed working day', () => {
    // Previously the grid always covered at least 8 AM–6 PM.
    expect(computeTimeRange([{ startTime: '15:00', duration: 30 }])).toEqual({ start: 14 * 60, end: 17 * 60 });
  });

  it('stays within the day', () => {
    expect(computeTimeRange([{ startTime: '00:15' }, { startTime: '23:30', duration: 20 }]))
      .toEqual({ start: 0, end: 24 * 60 });
  });

  it('defaults a missing duration to 30 minutes', () => {
    expect(computeTimeRange([{ startTime: '11:00' }])).toEqual({ start: 10 * 60, end: 13 * 60 });
  });

  it('is null when nothing is scheduled, so the caller can show an empty state', () => {
    expect(computeTimeRange([])).toBeNull();
    expect(computeTimeRange([{ duration: 30 }])).toBeNull();
  });
});

describe('assignLanes', () => {
  it('keeps non-overlapping appointments full width', () => {
    expect(assignLanes([{ startTime: '09:00', duration: 30 }, { startTime: '09:30', duration: 30 }]))
      .toEqual([{ lane: 0, lanes: 1 }, { lane: 0, lanes: 1 }]);
  });

  it('puts overlapping appointments side by side', () => {
    expect(assignLanes([
      { startTime: '09:00', duration: 60 },
      { startTime: '09:30', duration: 30 },
      { startTime: '11:00', duration: 30 },
    ])).toEqual([{ lane: 0, lanes: 2 }, { lane: 1, lanes: 2 }, { lane: 0, lanes: 1 }]);
  });

  it('reuses a lane once it frees up within the same group', () => {
    const lanes = assignLanes([
      { startTime: '09:00', duration: 120 },
      { startTime: '09:00', duration: 30 },
      { startTime: '09:30', duration: 30 },
    ]);
    expect(lanes.map((l) => l.lanes)).toEqual([2, 2, 2]);
    // 09:00–09:30 takes lane 0 and the long one lane 1; lane 0 is free again at 09:30.
    expect(lanes[0].lane).toBe(1);
    expect(lanes[1].lane).toBe(0);
    expect(lanes[2].lane).toBe(0);
  });
});

describe('weeks', () => {
  it('starts on Monday', () => {
    expect(startOfWeek('2026-09-28')).toBe('2026-09-28'); // a Monday
    expect(startOfWeek('2026-10-04')).toBe('2026-09-28'); // the Sunday after
    expect(startOfWeek('2026-10-01')).toBe('2026-09-28');
  });

  it('crosses month and year ends', () => {
    expect(weekDates('2026-12-28')).toEqual([
      '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03',
    ]);
  });

  it('labels hours in 12-hour time', () => {
    expect(formatHourLabel(0)).toBe('12 AM');
    expect(formatHourLabel(13 * 60)).toBe('1 PM');
    expect(formatHourLabel(24 * 60)).toBe('12 AM');
  });
});
