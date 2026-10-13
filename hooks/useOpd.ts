import { useMutation, useQueryClient } from '@tanstack/react-query';
import { popup } from '@/lib/popup';
import { appointmentService } from '@/services/appointment.service';
import { checkInService } from '@/services/checkin.service';
import { QUERY_KEYS } from '@/constants';
import { walkInSlot } from '@/constants/opd';
import { getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';
import type { Appointment, Triage, VisitPriority } from '@/types';

/**
 * The OPD queue's actions. Each is a call to an endpoint that already exists —
 * the queue is appointments seen a particular way, not a resource of its own.
 */

/** Where a desk check-in is recorded, so the check-ins log reads sensibly. */
const OPD_VENUE = 'OPD';

function useInvalidateQueue() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.CHECKINS });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.CALENDAR });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS });
  };
}

/**
 * Check a booked patient in. A real check-in, not just a status flip: it puts the
 * person on site and lets the backend stamp the arrival time their token is built on.
 */
export function useOpdCheckIn() {
  const invalidate = useInvalidateQueue();
  return useMutation({
    mutationFn: (a: Appointment) =>
      checkInService.checkIn({
        guestId: a.customerId || a.guestId,
        appointmentId: a.id,
        method: 'Manual',
        venue: OPD_VENUE,
      }),
    onSuccess: (_data, a) => {
      invalidate();
      popup.success(`${a.customerName || a.guestName || 'Patient'} checked in`, {
        description: a.staffName ? `Added to ${a.staffName}'s queue.` : undefined,
      });
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Check-in failed')),
  });
}

/** Call the patient in to the doctor. The backend stamps when the consultation began. */
export function useCallIn() {
  const invalidate = useInvalidateQueue();
  return useMutation({
    mutationFn: ({ appointment }: { appointment: Appointment; token?: number }) =>
      appointmentService.updateAppointmentStatus(appointment.id, 'in-progress'),
    onSuccess: (_data, { appointment, token }) => {
      invalidate();
      const who = token ? `Token ${token}` : appointment.customerName || appointment.guestName || 'Patient';
      popup.success(`${who} called in`, { description: appointment.staffName || undefined });
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not call the patient in')),
  });
}

/** Save triage vitals and the visit's priority onto the appointment. */
export function useRecordTriage() {
  const invalidate = useInvalidateQueue();
  return useMutation({
    mutationFn: ({ id, triage, visitPriority }: { id: string; triage: Triage; visitPriority: VisitPriority }) =>
      appointmentService.updateAppointment(id, { triage, visitPriority }),
    onSuccess: (_data, { visitPriority }) => {
      invalidate();
      popup.success('Triage saved', {
        description: visitPriority === 'emergency' ? 'Moved to the front of the queue.' : undefined,
      });
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not save triage')),
  });
}

export interface WalkInInput {
  patientId: string;
  patientName: string;
  staffId: string;
  service?: string;
  amount?: number;
  visitPriority?: VisitPriority;
  complaint?: string;
  /** The patient was already checked in at the entrance (face or QR) — do not log a second visit. */
  alreadyOnSite: boolean;
}

/** Slots tried before giving up; each retry moves the walk-in on by one minute. */
const WALK_IN_SLOT_ATTEMPTS = 5;

/**
 * Put a walk-in on a doctor's list and into the queue, in one action.
 *
 * Books an appointment for now, then marks the arrival: through a real check-in
 * when the patient has not been checked in yet, or by status alone when the
 * entrance already logged them — one visit, never two.
 */
export function useWalkIn() {
  const invalidate = useInvalidateQueue();
  return useMutation({
    mutationFn: async (input: WalkInInput): Promise<Appointment> => {
      const now = new Date();
      let created: Appointment | null = null;
      for (let attempt = 0; attempt < WALK_IN_SLOT_ATTEMPTS && !created; attempt += 1) {
        try {
          created = await appointmentService.createAppointment({
            customerId: input.patientId,
            staffId: input.staffId,
            date: toLocalDateInput(now),
            startTime: walkInSlot(now, attempt),
            service: input.service || undefined,
            amount: input.amount,
            notes: ['Walk-in', input.complaint?.trim()].filter(Boolean).join(' — '),
          });
        } catch (err: any) {
          // 409: this doctor already has a visit in that exact minute. Try the next one.
          if (err?.response?.status !== 409 || attempt === WALK_IN_SLOT_ATTEMPTS - 1) throw err;
        }
      }
      const appointment = created!;
      if (input.alreadyOnSite) {
        await appointmentService.updateAppointmentStatus(appointment.id, 'arrived');
      } else {
        await checkInService.checkIn({
          guestId: input.patientId, appointmentId: appointment.id, method: 'Walk-in', venue: OPD_VENUE,
        });
      }
      if (input.visitPriority && input.visitPriority !== 'routine') {
        await appointmentService.updateAppointment(appointment.id, { visitPriority: input.visitPriority });
      }
      return appointment;
    },
    onSuccess: (_data, input) => {
      invalidate();
      popup.success(`${input.patientName} added to the queue`);
    },
    onError: (err: any) => popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not add the walk-in')),
  });
}
