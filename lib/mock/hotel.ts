/**
 * Placeholder data for the front desk board.
 *
 * Same arrangement as the other mock files: the `frontdesk` module has no API
 * behind it yet, so the screen renders this rather than calling an endpoint
 * that would 404. Nothing else imports it.
 */

/** Where a stay is in its day. The front desk thinks in exactly these three piles. */
export type StayState = 'arriving' | 'in_house' | 'departing' | 'departed';

/** Housekeeping's view of a room, which is what decides whether an arrival can be let in. */
export type RoomState = 'ready' | 'occupied' | 'cleaning' | 'dirty' | 'out_of_order';

export interface Room {
  number: string;
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Accessible';
  floor: number;
  state: RoomState;
  note?: string;
}

export interface Stay {
  id: string;
  guestName: string;
  /** Loyalty tier drives who gets recognised and upgraded. */
  tier?: 'Founding' | 'Signature' | 'Standard';
  roomNumber?: string;
  roomType: Room['type'];
  nights: number;
  adults: number;
  state: StayState;
  /** "14:00" — when they said they would arrive, or must be out by. */
  time: string;
  /** Requests still outstanding on this stay. */
  openRequests: string[];
  /** Something the desk must say or do at the counter. */
  flag?: string;
  balance: number;
  eta?: string;
}

export const ROOMS: Room[] = [
  { number: '101', type: 'Standard',   floor: 1, state: 'ready' },
  { number: '102', type: 'Standard',   floor: 1, state: 'cleaning' },
  { number: '103', type: 'Accessible', floor: 1, state: 'ready' },
  { number: '104', type: 'Standard',   floor: 1, state: 'occupied' },
  { number: '201', type: 'Deluxe',     floor: 2, state: 'occupied' },
  { number: '202', type: 'Deluxe',     floor: 2, state: 'dirty' },
  { number: '203', type: 'Deluxe',     floor: 2, state: 'ready' },
  { number: '204', type: 'Standard',   floor: 2, state: 'occupied' },
  { number: '301', type: 'Suite',      floor: 3, state: 'cleaning' },
  { number: '302', type: 'Suite',      floor: 3, state: 'occupied' },
  { number: '303', type: 'Deluxe',     floor: 3, state: 'out_of_order', note: 'Aircon failure — parts due Thursday' },
  { number: '304', type: 'Standard',   floor: 3, state: 'ready' },
];

export const STAYS: Stay[] = [
  // ── Arrivals ───────────────────────────────────────────
  { id: 'a1', guestName: 'Priya Raghunathan', tier: 'Founding', roomType: 'Suite', nights: 3, adults: 2,
    state: 'arriving', time: '14:00', eta: '13:40', openRequests: ['Airport pickup', 'Late dinner'],
    flag: 'Anniversary — champagne on arrival', balance: 1240 },
  { id: 'a2', guestName: 'Daniel Okafor', roomType: 'Deluxe', nights: 1, adults: 1,
    state: 'arriving', time: '15:00', openRequests: [], balance: 210 },
  { id: 'a3', guestName: 'The Hendricks Family', tier: 'Signature', roomType: 'Standard', nights: 4, adults: 2,
    state: 'arriving', time: '16:00', openRequests: ['Cot in room'], flag: 'Travelling with infant', balance: 680 },
  { id: 'a4', guestName: 'Wei Zhang', roomType: 'Accessible', nights: 2, adults: 1,
    state: 'arriving', time: '18:30', openRequests: ['Step-free route'], flag: 'Accessible room confirmed', balance: 340 },

  // ── In house ───────────────────────────────────────────
  { id: 'i1', guestName: 'Marta Olsen', tier: 'Signature', roomNumber: '201', roomType: 'Deluxe', nights: 5, adults: 2,
    state: 'in_house', time: '—', openRequests: ['Extra towels'], balance: 0 },
  { id: 'i2', guestName: 'Rob Castellano', roomNumber: '104', roomType: 'Standard', nights: 2, adults: 1,
    state: 'in_house', time: '—', openRequests: [], balance: 48 },
  { id: 'i3', guestName: 'Aisha Bello', tier: 'Founding', roomNumber: '302', roomType: 'Suite', nights: 7, adults: 2,
    state: 'in_house', time: '—', openRequests: ['Spa booking', 'Laundry'], flag: 'VIP — GM to greet', balance: 0 },
  { id: 'i4', guestName: 'Liam Doyle', roomNumber: '204', roomType: 'Standard', nights: 1, adults: 1,
    state: 'in_house', time: '—', openRequests: [], balance: 96 },

  // ── Departures ─────────────────────────────────────────
  { id: 'd1', guestName: 'Sofia Marchetti', roomNumber: '202', roomType: 'Deluxe', nights: 2, adults: 2,
    state: 'departing', time: '11:00', openRequests: ['Late checkout 13:00'], balance: 145 },
  { id: 'd2', guestName: 'Kwame Mensah', tier: 'Signature', roomNumber: '301', roomType: 'Suite', nights: 3, adults: 1,
    state: 'departing', time: '11:00', openRequests: ['Taxi to airport'], balance: 0 },
  { id: 'd3', guestName: 'Ingrid Falk', roomNumber: '102', roomType: 'Standard', nights: 1, adults: 1,
    state: 'departed', time: '09:20', openRequests: [], balance: 0 },
];

export const ROOM_STATE_LABEL: Record<RoomState, string> = {
  ready: 'Ready',
  occupied: 'Occupied',
  cleaning: 'Being cleaned',
  dirty: 'Needs cleaning',
  out_of_order: 'Out of order',
};

export const ROOM_STATE_CLASS: Record<RoomState, string> = {
  ready:        'border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400',
  occupied:     'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
  cleaning:     'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400',
  dirty:        'border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400',
  out_of_order: 'border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400',
};

export function staysIn(state: StayState): Stay[] {
  return STAYS.filter((s) => s.state === state);
}

/**
 * Rooms that could take an arrival of this type right now.
 *
 * The front desk's real question is not "is a room free" but "is a room of the
 * right type clean", which is why readiness and type are answered together.
 */
export function readyRoomsFor(type: Room['type']): Room[] {
  return ROOMS.filter((r) => r.state === 'ready' && r.type === type);
}

/** An arrival with no clean room of its type is the thing that ruins a check-in. */
export function arrivalsAtRisk(): Stay[] {
  return staysIn('arriving').filter((s) => readyRoomsFor(s.roomType).length === 0);
}
