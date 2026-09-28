/**
 * Time-grid arithmetic for the day and week calendars.
 *
 * The grid only spans the hours that matter: from one hour before the first appointment to
 * one hour after the last, instead of a fixed working day. A quiet afternoon no longer costs a
 * screen of empty rows.
 */

/** Hours of padding shown before the first and after the last appointment. */
export const RANGE_PADDING_MINUTES = 60;
const DAY_MINUTES = 24 * 60;

export interface TimedItem {
  startTime?: string;
  duration?: number;
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/**
 * [start, end) in minutes since midnight, padded by an hour either side and snapped to whole
 * hours. Null when nothing has a start time — the caller shows an empty state instead of a grid.
 */
export function computeTimeRange(items: TimedItem[], defaultDuration = 30): { start: number; end: number } | null {
  const timed = items.filter((a) => !!a.startTime);
  if (timed.length === 0) return null;
  const starts = timed.map((a) => toMinutes(a.startTime as string));
  const ends = timed.map((a) => toMinutes(a.startTime as string) + (a.duration || defaultDuration));
  const start = Math.max(0, Math.floor((Math.min(...starts) - RANGE_PADDING_MINUTES) / 60) * 60);
  const end = Math.min(DAY_MINUTES, Math.ceil((Math.max(...ends) + RANGE_PADDING_MINUTES) / 60) * 60);
  return { start, end };
}

/**
 * Side-by-side lanes for appointments that overlap in one column.
 *
 * Returns, per item (same order as given), its lane and how many lanes its overlapping group
 * needs, so a card can take `1/lanes` of the column width at offset `lane/lanes`.
 */
export function assignLanes(items: TimedItem[], defaultDuration = 30): { lane: number; lanes: number }[] {
  const indexed = items
    .map((a, i) => ({
      i,
      start: a.startTime ? toMinutes(a.startTime) : 0,
      end: (a.startTime ? toMinutes(a.startTime) : 0) + (a.duration || defaultDuration),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result: { lane: number; lanes: number }[] = items.map(() => ({ lane: 0, lanes: 1 }));
  let group: typeof indexed = [];
  let groupEnd = -1;
  let laneEnds: number[] = [];

  const closeGroup = () => {
    const lanes = Math.max(1, laneEnds.length);
    for (const g of group) result[g.i].lanes = lanes;
    group = [];
    laneEnds = [];
  };

  for (const item of indexed) {
    if (group.length > 0 && item.start >= groupEnd) closeGroup();
    let lane = laneEnds.findIndex((end) => end <= item.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.end);
    } else {
      laneEnds[lane] = item.end;
    }
    result[item.i].lane = lane;
    group.push(item);
    groupEnd = Math.max(groupEnd, item.end);
  }
  closeGroup();
  return result;
}

/** Shifts a "YYYY-MM-DD" by whole days in UTC, so it never drifts across a DST boundary. */
export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** The Monday of the week containing this date. */
export function startOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
  return shiftDate(dateStr, -((weekday + 6) % 7));
}

export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDate(weekStart, i));
}

export function formatHourLabel(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const ampm = h < 12 ? 'AM' : 'PM';
  const dh = h % 12 === 0 ? 12 : h % 12;
  return `${dh} ${ampm}`;
}
