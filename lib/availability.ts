/**
 * When is a staff member free?
 *
 * Reads the weekly schedule a staff member already has (`schedule.mon =
 * "09:00-17:00"`, set from the staff profile) and the bookings they already
 * hold, and works out the open start times for one day.
 *
 * This is ADVICE for the booking form, never a gate. The backend still owns
 * conflicts (its SCHEDULE# lock), and the desk can always type any time — a
 * walk-in or an emergency must never be refused because a schedule is stale.
 *
 * It is also the question an outside booking channel (Zocdoc and the like)
 * asks: "when is Dr X free?". Keeping the answer in one pure, tested function
 * means a server-side version later can copy these rules exactly.
 */

export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

/** A span of minutes since midnight, end exclusive. */
export interface Span {
  start: number;
  end: number;
}

export interface Booking {
  date?: string;
  startTime?: string;
  time?: string;
  duration?: number | string;
  status?: string;
  id?: string;
}

/** Statuses that free the time again — the backend releases its lock on exactly these. */
const RELEASED = new Set(['cancelled', 'canceled', 'no-show', 'no_show']);

const DEFAULT_DURATION = 30;

/**
 * "09:00", "9:00", "9", "2:30 PM", "14:30:00" → minutes since midnight.
 * Returns null for anything it cannot read, so a strange value is ignored rather than guessed.
 */
export function parseClock(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([ap]\.?m\.?)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ampm = m[3]?.toLowerCase().replace(/\./g, '');
  if (min > 59) return null;
  if (ampm) {
    if (h < 1 || h > 12) return null;
    if (ampm === 'pm' && h !== 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
  }
  if (h > 24 || (h === 24 && min > 0)) return null;
  return h * 60 + min;
}

/** 870 → "14:30" — the format the booking API stores. */
export function formatClock(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * One day's hours → working spans.
 * Accepts "09:00-17:00", a break as "09:00-13:00, 14:00-17:00", and en/em dashes.
 * Blank means "off". Returns null when any part is unreadable or ends before it starts.
 */
export function parseDayHours(raw: unknown): Span[] | null {
  if (raw === undefined || raw === null) return [];
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  if (!text) return [];
  const spans: Span[] = [];
  for (const part of text.split(/[,;]/)) {
    const piece = part.trim();
    if (!piece) continue;
    const ends = piece.split(/\s*[-–—]\s*/);
    if (ends.length !== 2) return null;
    const start = parseClock(ends[0]);
    const end = parseClock(ends[1]);
    if (start === null || end === null || end <= start) return null;
    spans.push({ start, end });
  }
  return spans.sort((a, b) => a.start - b.start);
}

/** "2026-11-18" → "wed". Read as a calendar date, so the viewer's timezone cannot shift the day. */
export function weekDayOf(dateIso: string): WeekDay | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) return null;
  return WEEK_DAYS[(d.getUTCDay() + 6) % 7];
}

/**
 * Today's date and the minutes since midnight AT THE CLINIC, from its IANA timezone.
 * The browser's clock is the wrong one when someone books for a clinic elsewhere — a
 * platform admin in India working in an Austin clinic would otherwise hide the wrong slots.
 * No or unknown timezone → the browser's own clock, as before.
 */
export function clockInZone(timezone: string | undefined | null, now: Date = new Date()): { date: string; minutes: number } {
  if (timezone) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(now);
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
      const hour = Number(get('hour')) % 24;
      const minute = Number(get('minute'));
      const date = `${get('year')}-${get('month')}-${get('day')}`;
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(hour) && Number.isFinite(minute)) {
        return { date, minutes: hour * 60 + minute };
      }
    } catch {
      // Unknown zone: fall through to the browser clock.
    }
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    minutes: now.getHours() * 60 + now.getMinutes(),
  };
}

/** True when the schedule has at least one day with readable hours. No schedule = no opinion. */
export function hasSchedule(schedule: unknown): schedule is Record<string, unknown> {
  if (!schedule || typeof schedule !== 'object') return false;
  const rec = schedule as Record<string, unknown>;
  return WEEK_DAYS.some((d) => {
    const spans = parseDayHours(rec[d]);
    return !!spans && spans.length > 0;
  });
}

function bookingSpan(b: Booking): Span | null {
  const start = parseClock(b.startTime ?? b.time);
  if (start === null) return null;
  const dur = Number(b.duration);
  const length = Number.isFinite(dur) && dur > 0 ? dur : DEFAULT_DURATION;
  return { start, end: start + length };
}

function overlaps(a: Span, b: Span): boolean {
  return a.start < b.end && b.start < a.end;
}

/** The bookings that still hold time on this date. */
function busySpans(bookings: readonly Booking[], date: string, ignoreId?: string): Span[] {
  return bookings
    .filter((b) => (!b.date || b.date === date) && !RELEASED.has(String(b.status ?? '').toLowerCase()))
    .filter((b) => !ignoreId || b.id !== ignoreId)
    .map(bookingSpan)
    .filter((s): s is Span => s !== null);
}

export interface OpenSlotsInput {
  schedule: unknown;
  date: string;
  /** Length of the visit being booked, in minutes. */
  duration?: number;
  bookings?: readonly Booking[];
  /** Grid the start times sit on. */
  step?: number;
  /** Minutes since midnight; starts before this are dropped (pass it only when `date` is today). */
  notBefore?: number;
}

/**
 * Open start times for one day, as "HH:MM".
 * Returns null when the staff member has no schedule at all — "we don't know",
 * which the form must treat as "show nothing extra", not as "fully booked".
 */
export function openSlots({
  schedule, date, duration = DEFAULT_DURATION, bookings = [], step = 15, notBefore,
}: OpenSlotsInput): string[] | null {
  if (!hasSchedule(schedule)) return null;
  const day = weekDayOf(date);
  if (!day) return null;
  const hours = parseDayHours(schedule[day]);
  if (!hours || hours.length === 0) return [];
  const length = duration > 0 ? duration : DEFAULT_DURATION;
  const busy = busySpans(bookings, date);
  const out: string[] = [];
  for (const span of hours) {
    for (let t = Math.ceil(span.start / step) * step; t + length <= span.end; t += step) {
      if (notBefore !== undefined && t < notBefore) continue;
      const visit = { start: t, end: t + length };
      if (!busy.some((b) => overlaps(b, visit))) out.push(formatClock(t));
    }
  }
  return out;
}

export type TimeCheck =
  | { kind: 'ok' }
  | { kind: 'unknown' }
  | { kind: 'day-off' }
  | { kind: 'outside-hours'; hours: string }
  | { kind: 'overlap'; with: string };

/**
 * Is this exact time sensible for this staff member? Used to WARN, never to block.
 * `unknown` covers no schedule, an unreadable time, or an unreadable day.
 */
export function checkTime({
  schedule, date, startTime, duration = DEFAULT_DURATION, bookings = [], ignoreId,
}: {
  schedule: unknown;
  date: string;
  startTime: string;
  duration?: number;
  bookings?: readonly Booking[];
  ignoreId?: string;
}): TimeCheck {
  const start = parseClock(startTime);
  if (start === null) return { kind: 'unknown' };
  const visit = { start, end: start + (duration > 0 ? duration : DEFAULT_DURATION) };

  const clash = busySpans(bookings, date, ignoreId).find((b) => overlaps(b, visit));
  if (clash) return { kind: 'overlap', with: formatClock(clash.start) };

  if (!hasSchedule(schedule)) return { kind: 'unknown' };
  const day = weekDayOf(date);
  if (!day) return { kind: 'unknown' };
  const hours = parseDayHours(schedule[day]);
  if (!hours) return { kind: 'unknown' };
  if (hours.length === 0) return { kind: 'day-off' };
  if (!hours.some((s) => visit.start >= s.start && visit.end <= s.end)) {
    return { kind: 'outside-hours', hours: hours.map((s) => `${formatClock(s.start)}–${formatClock(s.end)}`).join(', ') };
  }
  return { kind: 'ok' };
}
