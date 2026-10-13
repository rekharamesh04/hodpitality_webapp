import type { Appointment, CheckIn, VisitPriority } from '@/types';

/**
 * The rules of a hospital's OPD queue, kept free of React so they can be tested.
 *
 * The queue is not a new record. A visit IS an appointment: booked for a
 * doctor (`staffId`), marked `arrived` on check-in (which stamps `arrivedAt`),
 * `in-progress` when the doctor calls the patient in (`consultStartedAt`), and
 * closed `completed` or `incomplete`. Everything here is derived from those
 * fields, so the queue is tenant-scoped and writable through the existing
 * endpoints, and a token can never disagree with the record behind it.
 */

/** Where a visit has got to, in the words the OPD uses. */
export type OpdStage = 'booked' | 'waiting' | 'with_doctor' | 'done' | 'off';

export function opdStageOf(a: Pick<Appointment, 'status'>): OpdStage {
  switch ((a.status ?? '').toLowerCase()) {
    case 'arrived': return 'waiting';
    case 'in-progress': case 'in_progress': return 'with_doctor';
    case 'completed': case 'incomplete': return 'done';
    case 'cancelled': case 'no-show': case 'no_show': return 'off';
    default: return 'booked';
  }
}

export const OPD_STAGE_LABEL: Record<OpdStage, string> = {
  booked: 'Not arrived',
  waiting: 'Waiting',
  with_doctor: 'With doctor',
  done: 'Seen',
  off: 'Cancelled / no-show',
};

// ── Priority ────────────────────────────────────────────────────────────────

export const VISIT_PRIORITIES: readonly VisitPriority[] = ['emergency', 'urgent', 'routine'];

export const VISIT_PRIORITY_LABEL: Record<VisitPriority, string> = {
  emergency: 'Emergency',
  urgent: 'Urgent',
  routine: 'Routine',
};

export const VISIT_PRIORITY_STYLE: Record<VisitPriority, string> = {
  emergency: 'border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
  urgent: 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  routine: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
};

/**
 * How urgently this visit must be seen.
 *
 * Triage decides, when it has run: a nurse who assessed the patient knows more
 * than the label on their record. Until then the record speaks — a patient
 * registered as Emergency is treated as one, and anyone the industry flags as
 * priority (a "Priority" tier) as urgent.
 */
export function visitPriorityOf(
  a: Pick<Appointment, 'visitPriority' | 'customerCategory' | 'isPriority'>,
): VisitPriority {
  if (a.visitPriority && (VISIT_PRIORITIES as readonly string[]).includes(a.visitPriority)) return a.visitPriority;
  if ((a.customerCategory ?? '').trim().toLowerCase() === 'emergency') return 'emergency';
  if (a.isPriority) return 'urgent';
  return 'routine';
}

const PRIORITY_RANK: Record<VisitPriority, number> = { emergency: 0, urgent: 1, routine: 2 };

// ── Time ────────────────────────────────────────────────────────────────────

/** Waits at or above these read amber, then red. */
export const OPD_WAIT_WARN_MINUTES = 30;
export const OPD_WAIT_LATE_MINUTES = 60;

export type WaitTone = 'ok' | 'warn' | 'late';

export function waitTone(minutes: number): WaitTone {
  if (minutes >= OPD_WAIT_LATE_MINUTES) return 'late';
  if (minutes >= OPD_WAIT_WARN_MINUTES) return 'warn';
  return 'ok';
}

export const WAIT_TONE_TEXT: Record<WaitTone, string> = {
  ok: 'text-muted-foreground',
  warn: 'text-amber-700 dark:text-amber-400',
  late: 'text-red-700 dark:text-red-400',
};

function parseTime(iso?: string): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Minutes this patient waited for the doctor: from arrival until they were
 * called in, or until `now` while they are still waiting. Null when the
 * arrival time is unknown — an honest blank, not a made-up zero.
 */
export function waitingMinutes(a: Pick<Appointment, 'arrivedAt' | 'consultStartedAt'>, now: number): number | null {
  const arrived = parseTime(a.arrivedAt);
  if (arrived === null) return null;
  const end = parseTime(a.consultStartedAt) ?? now;
  return Math.max(0, Math.floor((end - arrived) / 60000));
}

// ── Tokens ──────────────────────────────────────────────────────────────────

/** A sortable arrival time: the stamped arrival, or the booked slot for a row from before stamping. */
function arrivalKey(a: Appointment): string {
  return a.arrivedAt || `${a.date ?? ''}T${a.startTime ?? '00:00'}`;
}

function hasArrived(a: Appointment): boolean {
  if (a.arrivedAt) return true;
  const stage = opdStageOf(a);
  return stage === 'waiting' || stage === 'with_doctor' || stage === 'done';
}

/**
 * Token numbers, per doctor, in order of arrival.
 *
 * Derived rather than stored, so it needs no counter and no write. It is stable
 * because `arrivedAt` is stamped once by the server and cannot be edited, and
 * because a patient keeps their token after leaving the queue — a cancellation
 * never renumbers the people behind them.
 */
export function assignTokens(rows: readonly Appointment[]): Map<string, number> {
  const byDoctor = new Map<string, Appointment[]>();
  for (const a of rows) {
    if (!hasArrived(a)) continue;
    const key = a.staffId || '';
    if (!byDoctor.has(key)) byDoctor.set(key, []);
    byDoctor.get(key)!.push(a);
  }
  const tokens = new Map<string, number>();
  for (const list of byDoctor.values()) {
    list
      .sort((x, y) => arrivalKey(x).localeCompare(arrivalKey(y)) || x.id.localeCompare(y.id))
      .forEach((a, i) => tokens.set(a.id, i + 1));
  }
  return tokens;
}

/** Who goes in next: most urgent first, then whoever has waited longest (lowest token). */
export function compareQueue(tokens: Map<string, number>) {
  return (x: Appointment, y: Appointment) =>
    PRIORITY_RANK[visitPriorityOf(x)] - PRIORITY_RANK[visitPriorityOf(y)]
    || (tokens.get(x.id) ?? Infinity) - (tokens.get(y.id) ?? Infinity);
}

// ── Lanes ───────────────────────────────────────────────────────────────────

export interface OpdLane {
  staffId: string;
  doctorName: string;
  /** The room the doctor is seeing patients in today, from their visits. */
  room: string;
  withDoctor: Appointment[];
  /** In calling order — see compareQueue. */
  waiting: Appointment[];
  /** Booked but not here yet, by slot time. */
  booked: Appointment[];
  done: Appointment[];
  off: Appointment[];
}

/** One lane per doctor with a visit on the board, alphabetical; visits with no doctor last. */
export function buildLanes(rows: readonly Appointment[], tokens: Map<string, number>): OpdLane[] {
  const lanes = new Map<string, OpdLane>();
  for (const a of rows) {
    const staffId = a.staffId || '';
    if (!lanes.has(staffId)) {
      lanes.set(staffId, {
        staffId,
        doctorName: a.staffName || (staffId ? 'Unknown doctor' : 'No doctor assigned'),
        room: '',
        withDoctor: [], waiting: [], booked: [], done: [], off: [],
      });
    }
    const lane = lanes.get(staffId)!;
    if (!lane.room && a.room) lane.room = a.room;
    const stage = opdStageOf(a);
    if (stage === 'with_doctor') lane.withDoctor.push(a);
    else if (stage === 'waiting') lane.waiting.push(a);
    else if (stage === 'booked') lane.booked.push(a);
    else if (stage === 'done') lane.done.push(a);
    else lane.off.push(a);
  }
  const byToken = (x: Appointment, y: Appointment) => (tokens.get(x.id) ?? 0) - (tokens.get(y.id) ?? 0);
  for (const lane of lanes.values()) {
    lane.waiting.sort(compareQueue(tokens));
    lane.withDoctor.sort(byToken);
    lane.done.sort(byToken);
    lane.booked.sort((x, y) => (x.startTime ?? '').localeCompare(y.startTime ?? ''));
  }
  return [...lanes.values()].sort((x, y) => {
    if (!x.staffId !== !y.staffId) return x.staffId ? -1 : 1;
    return x.doctorName.localeCompare(y.doctorName);
  });
}

// ── Walk-ins ────────────────────────────────────────────────────────────────

/**
 * A check-in that is still open, i.e. the person has not been checked out.
 * Mirrors OPEN_CHECKIN_STATUSES in the backend; checking out writes "completed".
 */
const OPEN_CHECKIN_STATUSES = new Set(['arrived', 'checked-in', 'checked_in', 'in-progress', '']);

export function isOpenCheckIn(c: Pick<CheckIn, 'status'>): boolean {
  return OPEN_CHECKIN_STATUSES.has((c.status ?? '').toLowerCase());
}

/** The business day of an ISO timestamp, in the browser's zone, as YYYY-MM-DD. */
export function localDay(iso?: string): string {
  const ms = parseTime(iso);
  if (ms === null) return '';
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * People checked in on `date` who are on nobody's list — a face scan or QR at
 * the entrance for someone with no appointment that day. They are physically
 * in the hospital and invisible to every doctor until a desk assigns one, which
 * is the gap this surfaces. One row per person, latest check-in first.
 */
export function unassignedArrivals(
  checkIns: readonly CheckIn[],
  appointments: readonly Appointment[],
  date: string,
): CheckIn[] {
  const booked = new Set(
    appointments
      .filter((a) => opdStageOf(a) !== 'off')
      .flatMap((a) => [a.customerId, a.guestId])
      .filter((id): id is string => !!id),
  );
  const seen = new Set<string>();
  return [...checkIns]
    .filter((c) => localDay(c.timestamp ?? c.checkInTime) === date)
    .filter(isOpenCheckIn)
    .sort((x, y) => (y.timestamp ?? y.checkInTime ?? '').localeCompare(x.timestamp ?? x.checkInTime ?? ''))
    .filter((c) => {
      if (!c.guestId || booked.has(c.guestId) || seen.has(c.guestId)) return false;
      seen.add(c.guestId);
      return true;
    });
}

/**
 * The slot a walk-in is booked into: now, rounded down to the minute.
 *
 * The API reserves one slot per doctor per exact start time, so two walk-ins
 * for the same doctor in the same minute collide with a 409. `attempt` moves
 * the slot on by a minute each retry until one is free.
 */
export function walkInSlot(now: Date, attempt = 0): string {
  const minutes = now.getHours() * 60 + now.getMinutes() + attempt;
  const capped = Math.min(minutes, 23 * 60 + 59);
  return `${String(Math.floor(capped / 60)).padStart(2, '0')}:${String(capped % 60).padStart(2, '0')}`;
}

// ── Triage ──────────────────────────────────────────────────────────────────

/** Ranges outside which a vital is almost certainly a typing slip, not a reading. */
export const VITAL_LIMITS = {
  pulse: { min: 20, max: 250, unit: 'bpm' },
  temperature: { min: 90, max: 110, unit: '°F' },
  spo2: { min: 50, max: 100, unit: '%' },
  weight: { min: 0.5, max: 400, unit: 'kg' },
} as const;

export const BP_PATTERN = /^\d{2,3}\s*\/\s*\d{2,3}$/;

/** A one-line summary of what triage recorded, or '' when nothing was. */
export function vitalsSummary(t: Appointment['triage']): string {
  if (!t) return '';
  return [
    t.bp ? `BP ${t.bp}` : '',
    t.pulse ? `Pulse ${t.pulse}` : '',
    t.temperature ? `Temp ${t.temperature}°F` : '',
    t.spo2 ? `SpO₂ ${t.spo2}%` : '',
    t.weight ? `${t.weight} kg` : '',
  ].filter(Boolean).join(' · ');
}
