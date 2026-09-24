/**
 * Placeholder data for the treatment board.
 *
 * Same arrangement as lib/mock/pharmacy.ts: the `treatments` module has no API
 * behind it yet, so the screen renders this rather than calling an endpoint
 * that would 404. Nothing else imports it, so deleting it once real hooks
 * exist is a compile error in exactly the places that must change.
 *
 * Times are minutes from midnight, resolved against the board's own working
 * day rather than wall-clock, so the board looks the same whenever it is
 * opened for a demo.
 */

/** Where a booking has got to. A spa cares about lateness, not a long lifecycle. */
export type TreatmentState =
  | 'booked'        // on the sheet, client not here yet
  | 'arrived'       // checked in, waiting in the lounge
  | 'in_treatment'
  | 'turnaround'    // suite being reset between clients
  | 'complete'
  | 'no_show';

export interface Booking {
  id: string;
  clientName: string;
  /** Repeat clients are the ones a spa most wants recognised by name. */
  returning: boolean;
  treatment: string;
  therapist: string;
  suiteId: string;
  /** Minutes from midnight. */
  start: number;
  durationMin: number;
  state: TreatmentState;
  /** Minutes past the scheduled start that it actually began. */
  startedLateBy?: number;
  price: number;
  /** A note the therapist must read before starting — allergies, pressure, pregnancy. */
  careNote?: string;
  addOns?: string[];
}

export interface Suite {
  id: string;
  name: string;
  /** What the room is equipped for; a booking cannot move to a suite that lacks it. */
  capability: 'massage' | 'facial' | 'hydro' | 'couples';
  outOfService?: string;
}

export const SPA_OPENS = 9 * 60;   // 09:00
export const SPA_CLOSES = 19 * 60; // 19:00

/** The demo "now", parked mid-afternoon so the board has past, present and future on it. */
export const SPA_NOW = 14 * 60 + 25; // 14:25

export const SUITES: Suite[] = [
  { id: 's1', name: 'Willow',  capability: 'massage' },
  { id: 's2', name: 'Cedar',   capability: 'massage' },
  { id: 's3', name: 'Lotus',   capability: 'facial' },
  { id: 's4', name: 'Hydro 1', capability: 'hydro' },
  { id: 's5', name: 'Juniper', capability: 'couples' },
  { id: 's6', name: 'Aspen',   capability: 'facial', outOfService: 'Steamer fault — engineer 16:00' },
];

export const BOOKINGS: Booking[] = [
  // ── Willow ─────────────────────────────────────────────
  { id: 'b1', clientName: 'Amara Osei', returning: true, treatment: 'Deep Tissue Massage', therapist: 'Lena',
    suiteId: 's1', start: 9 * 60 + 30, durationMin: 60, state: 'complete', price: 110 },
  { id: 'b2', clientName: 'Peter Lindqvist', returning: false, treatment: 'Swedish Massage', therapist: 'Lena',
    suiteId: 's1', start: 11 * 60, durationMin: 90, state: 'complete', price: 145 },
  { id: 'b3', clientName: 'Rosa Iqbal', returning: true, treatment: 'Hot Stone Massage', therapist: 'Lena',
    suiteId: 's1', start: 13 * 60 + 45, durationMin: 75, state: 'in_treatment', startedLateBy: 10, price: 160,
    careNote: 'Avoid lower back — recent injury' },
  { id: 'b4', clientName: 'Tom Achebe', returning: false, treatment: 'Sports Massage', therapist: 'Lena',
    suiteId: 's1', start: 15 * 60 + 30, durationMin: 60, state: 'booked', price: 120 },

  // ── Cedar ──────────────────────────────────────────────
  { id: 'b5', clientName: 'Nadia Farouk', returning: true, treatment: 'Aromatherapy Massage', therapist: 'Marcus',
    suiteId: 's2', start: 10 * 60, durationMin: 60, state: 'complete', price: 115 },
  { id: 'b6', clientName: 'Greg Halloran', returning: false, treatment: 'Deep Tissue Massage', therapist: 'Marcus',
    suiteId: 's2', start: 12 * 60 + 30, durationMin: 60, state: 'no_show', price: 110 },
  { id: 'b7', clientName: 'Yuki Tanabe', returning: true, treatment: 'Prenatal Massage', therapist: 'Marcus',
    suiteId: 's2', start: 14 * 60, durationMin: 60, state: 'in_treatment', price: 125,
    careNote: 'Second trimester — side-lying only, no deep pressure' },
  { id: 'b8', clientName: 'Colette Brun', returning: false, treatment: 'Swedish Massage', therapist: 'Marcus',
    suiteId: 's2', start: 15 * 60 + 15, durationMin: 60, state: 'booked', price: 110 },

  // ── Lotus ──────────────────────────────────────────────
  { id: 'b9', clientName: 'Imani Walker', returning: true, treatment: 'Signature Facial', therapist: 'Priya',
    suiteId: 's3', start: 9 * 60, durationMin: 75, state: 'complete', price: 135 },
  { id: 'b10', clientName: 'Sandra Volkov', returning: true, treatment: 'Anti-Ageing Facial', therapist: 'Priya',
    suiteId: 's3', start: 11 * 60, durationMin: 90, state: 'complete', price: 180, addOns: ['LED therapy'] },
  { id: 'b11', clientName: 'Dele Adeyemi', returning: false, treatment: 'Express Facial', therapist: 'Priya',
    suiteId: 's3', start: 14 * 60 + 15, durationMin: 30, state: 'in_treatment', price: 75 },
  { id: 'b12', clientName: 'Margot Ferrand', returning: true, treatment: 'Signature Facial', therapist: 'Priya',
    suiteId: 's3', start: 15 * 60, durationMin: 75, state: 'arrived', price: 135,
    careNote: 'Sensitive skin — no exfoliants' },

  // ── Hydro 1 ────────────────────────────────────────────
  { id: 'b13', clientName: 'Bruno Sant', returning: false, treatment: 'Hydrotherapy Circuit', therapist: 'Ivo',
    suiteId: 's4', start: 10 * 60 + 30, durationMin: 45, state: 'complete', price: 90 },
  { id: 'b14', clientName: 'Elif Demir', returning: true, treatment: 'Detox Wrap', therapist: 'Ivo',
    suiteId: 's4', start: 13 * 60, durationMin: 60, state: 'complete', price: 130 },
  { id: 'b15', clientName: 'Hugh Barrett', returning: false, treatment: 'Hydrotherapy Circuit', therapist: 'Ivo',
    suiteId: 's4', start: 14 * 60 + 15, durationMin: 45, state: 'turnaround', price: 90 },
  { id: 'b16', clientName: 'Aiko Mori', returning: true, treatment: 'Detox Wrap', therapist: 'Ivo',
    suiteId: 's4', start: 16 * 60, durationMin: 60, state: 'booked', price: 130 },

  // ── Juniper (couples) ──────────────────────────────────
  { id: 'b17', clientName: 'The Nakamuras', returning: true, treatment: 'Couples Ritual', therapist: 'Lena + Marcus',
    suiteId: 's5', start: 16 * 60 + 30, durationMin: 120, state: 'booked', price: 340,
    addOns: ['Champagne', 'Rose petals'] },
];

export const THERAPISTS = ['Lena', 'Marcus', 'Priya', 'Ivo'] as const;

/** Minutes-from-midnight rendered as "14:25". */
export function hhmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function endOf(b: Booking): number {
  return b.start + (b.startedLateBy ?? 0) + b.durationMin;
}

/** How many minutes of a running treatment are left. Negative means it has overrun. */
export function minutesRemaining(b: Booking, now: number = SPA_NOW): number {
  return endOf(b) - now;
}

export function bookingsFor(suiteId: string): Booking[] {
  return BOOKINGS.filter((b) => b.suiteId === suiteId).sort((a, b) => a.start - b.start);
}

/**
 * The gap before a booking, in minutes — a suite's turnaround.
 *
 * A spa sells time in a room, so an unsold gap is the thing a manager is
 * actually looking for on this board. Null when nothing precedes it.
 */
export function gapBefore(b: Booking): number | null {
  const sameSuite = bookingsFor(b.suiteId);
  const index = sameSuite.findIndex((x) => x.id === b.id);
  if (index <= 0) return null;
  return b.start - endOf(sameSuite[index - 1]);
}
