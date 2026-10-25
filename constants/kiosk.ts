import type { Appointment, CheckIn } from '@/types';
import { isOpenCheckIn, localDay, opdStageOf } from './opd';

/**
 * The reception kiosk's one decision: what to offer the person whose face it just matched.
 *
 * An iPad at the entrance does two things only. Arriving, it checks you in. Leaving — after the
 * consultation — it checks you out and takes the visit fee. Everything is derived from records the
 * desk already keeps (today's check-ins and appointments), so the kiosk and the OPD queue can never
 * disagree about where someone is.
 */

/** One fee due at checkout. */
export interface KioskCharge {
  appointmentId: string;
  /** What the fee is for, e.g. "Consultation with Dr Rao". */
  label: string;
  amount: number;
  /** True when the visit had no fee of its own and the organisation's standard fee applies. */
  usesStandardFee: boolean;
}

export type KioskDecision =
  /** No open visit today: check them in. */
  | { kind: 'check_in'; nextAppointment?: Appointment }
  /** Checked in and not yet seen, or with the doctor now: nothing to do but wait. */
  | { kind: 'waiting'; appointment?: Appointment }
  /** Checked in and finished: take what is owed, then check out. */
  | { kind: 'check_out'; charges: KioskCharge[]; total: number };

const PAID = new Set(['paid', 'waived', 'refunded']);

/**
 * What a visit costs at checkout: its own fee when one was set (a booked consultation, a co-pay),
 * otherwise the organisation's standard visit fee. Insurance is deliberately not calculated.
 */
export function visitFee(a: Pick<Appointment, 'amount'>, standardFee: number): { amount: number; usesStandardFee: boolean } {
  const own = Number(a.amount ?? 0);
  if (Number.isFinite(own) && own > 0) return { amount: own, usesStandardFee: false };
  return { amount: Math.max(0, standardFee), usesStandardFee: true };
}

export function kioskDecision({
  appointments, checkIns, today, standardFee,
}: {
  /** This person's appointments (any day; only `today` counts). */
  appointments: readonly Appointment[];
  /** This person's check-ins (any day; only open ones from `today` count). */
  checkIns: readonly CheckIn[];
  /** YYYY-MM-DD, the business day. */
  today: string;
  standardFee: number;
}): KioskDecision {
  const todays = appointments.filter((a) => a.date === today && opdStageOf(a) !== 'off');
  const onSite = checkIns.some((c) => isOpenCheckIn(c) && localDay(c.timestamp ?? c.checkInTime) === today);

  if (!onSite) {
    const next = todays
      .filter((a) => opdStageOf(a) === 'booked')
      .sort((x, y) => (x.startTime ?? '').localeCompare(y.startTime ?? ''))[0];
    return { kind: 'check_in', nextAppointment: next };
  }

  const inProgress = todays.find((a) => opdStageOf(a) === 'with_doctor') ?? todays.find((a) => opdStageOf(a) === 'waiting');
  if (inProgress) return { kind: 'waiting', appointment: inProgress };

  const charges: KioskCharge[] = todays
    .filter((a) => opdStageOf(a) === 'done' && !PAID.has((a.paymentStatus ?? '').toLowerCase()))
    .map((a) => {
      const fee = visitFee(a, standardFee);
      return {
        appointmentId: a.id,
        label: [a.service || a.serviceName || 'Visit', a.staffName ? `with ${a.staffName}` : ''].filter(Boolean).join(' '),
        ...fee,
      };
    })
    .filter((c) => c.amount > 0);
  return { kind: 'check_out', charges, total: charges.reduce((sum, c) => sum + c.amount, 0) };
}

/** Only the first name goes on a screen everyone in the lobby can see. */
export function kioskGreetingName(fullName?: string): string {
  return (fullName ?? '').trim().split(/\s+/)[0] || 'there';
}

/** The digits of a phone number, with a leading country code dropped so "+1 (512) 555-0134" and "5125550134" agree. */
export function phoneDigits(phone?: string): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Fewer digits than this could belong to many people, so the kiosk does not try. */
export const KIOSK_PHONE_MIN_DIGITS = 7;

/**
 * The kiosk's way in for someone who does not use face check-in: their phone number.
 *
 * The number must match one record exactly. The search behind it matches any part of a number,
 * so a partial number would find strangers; and two people sharing a number (a parent and child)
 * cannot be told apart on a public screen. Both are sent to the desk instead of guessing.
 */
export function kioskPhoneMatch<T extends { id: string; phone?: string }>(people: readonly T[], entered: string): T | undefined {
  const want = phoneDigits(entered);
  if (want.length < KIOSK_PHONE_MIN_DIGITS) return undefined;
  const byId = new Map(people.filter((p) => phoneDigits(p.phone) === want).map((p) => [p.id, p]));
  return byId.size === 1 ? [...byId.values()][0] : undefined;
}
