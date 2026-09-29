/**
 * The prescription record, as the backend actually stores it.
 *
 * This describes `create_prescription` in hospitality_lambda.py and nothing
 * more. It is a CLINICAL prescription — a practitioner writing medicines for a
 * patient, usually against an appointment — so there is deliberately no fill,
 * claim, will-call bin or pickup here. A dispensing pharmacy needs all of
 * those, and they belong on a separate record that references this one,
 * because one prescription with five refills produces six fills. See
 * docs/PHARMACY_MODULE.md for that design.
 *
 * Field pairs like `customerName`/`patientName` and `staffName`/`doctorName`
 * are both written by the backend with the same value. Readers should prefer
 * the neutral one and fall back, so a tenant in any industry reads correctly.
 */

/**
 * One line of the prescription.
 *
 * The API accepts whatever the client sends in `medicines` and never validates
 * it, so rows in the table hold a mix: some are objects, some are plain
 * strings from an older client. Every reader has to tolerate both — see
 * `medicineLabel`.
 */
export interface Medicine {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  [key: string]: unknown;
}

export type MedicineEntry = Medicine | string;

/**
 * The lifecycle the backend recognises. It writes `active` on create and
 * accepts anything on update, so a reader must tolerate an unknown value
 * rather than assuming this list is closed.
 */
export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

/**
 * A photo (or PDF) of the paper prescription. It is a person document with
 * category "prescription" that also names its prescription, so it is listed
 * under the patient's documents too. `url` is signed on every read and
 * expires — never store it.
 */
export interface PrescriptionAttachment {
  id: string;
  prescriptionId: string;
  personId?: string;
  title?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  url?: string;
  uploadedBy?: string;
  uploadedById?: string;
  created_at?: string;
  createdAt?: string;
}

export interface Prescription {
  id: string;
  PK?: string;
  entity_type?: string;
  tenant_id?: string;

  /** The patient. A CUSTOMER id, or a GUEST id — the backend accepts either. */
  customerId: string;
  customerName?: string;
  /** Same value as customerName; the backend writes both. */
  patientName?: string;

  /** The prescriber's STAFF row. Empty when the prescriber is an outside doctor. */
  staffId: string;
  /** The prescriber's name — a staff member's, or the outside doctor's as typed. */
  staffName?: string;
  /** Same value as staffName; the backend writes both. */
  doctorName?: string;
  /** True when the prescriber is a doctor outside this organisation (no STAFF row). */
  externalPrescriber?: boolean;

  /** The visit this was written at, when there was one. */
  appointmentId?: string;

  medicines?: MedicineEntry[];
  diagnosis?: string;
  notes?: string;
  status?: PrescriptionStatus | string;
  /** "paid" once a payment covering this prescription is recorded (POST /payments with prescriptionIds). */
  paymentStatus?: string;
  paymentId?: string;
  /** Photos of the paper prescription, oldest (page 1) first. Always present on reads. */
  attachments?: PrescriptionAttachment[];

  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionFilters {
  status?: string;
  search?: string;
  limit?: number;
}

export interface CreatePrescriptionPayload {
  /** The backend accepts `customerId` or `patientId`; it requires one of them. */
  customerId: string;
  /** A staff prescriber. The backend requires this or `prescriberName`. */
  staffId?: string;
  /** An outside doctor, by name, when the prescriber is not on the staff. */
  prescriberName?: string;
  appointmentId?: string;
  medicines?: MedicineEntry[];
  diagnosis?: string;
  notes?: string;
}

// ─── Readers ─────────────────────────────────────────────────────────────────

/** The patient's name, whichever field the row happens to carry. */
export function patientNameOf(p: Prescription): string {
  return p.customerName || p.patientName || 'Unknown patient';
}

/** The prescriber's name, in industry-neutral preference order. */
export function prescriberNameOf(p: Prescription): string {
  return p.staffName || p.doctorName || 'Unknown';
}

/** One medicine rendered as a line, whether it arrived as an object or a string. */
export function medicineLabel(entry: MedicineEntry): string {
  if (typeof entry === 'string') return entry;
  const parts = [entry.name, entry.dosage, entry.frequency, entry.duration].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'Unnamed medicine';
}

export function medicinesOf(p: Prescription): MedicineEntry[] {
  return Array.isArray(p.medicines) ? p.medicines : [];
}

/** Lines that actually name a medicine — the same test the backend applies before completing. */
export function typedMedicinesOf(p: Prescription): MedicineEntry[] {
  return medicinesOf(p).filter((m) => {
    const name = typeof m === 'string' ? m : m.name;
    return typeof name === 'string' && name.trim() !== '';
  });
}

/**
 * Saved from a photo of the paper and not typed up yet. It cannot be handed
 * over or completed until it is — the backend refuses with MEDICINES_NOT_TYPED.
 */
export function awaitingTyping(p: Prescription): boolean {
  return typedMedicinesOf(p).length === 0;
}

export function attachmentsOf(p: Prescription): PrescriptionAttachment[] {
  return Array.isArray(p.attachments) ? p.attachments : [];
}

/** When the prescription was written, whichever field the row carries. */
export function writtenAt(p: Prescription): string | undefined {
  return p.created_at ?? p.createdAt;
}

/**
 * One patient's prescriptions, newest first.
 *
 * `customerId` holds the guest id the prescription was written for (the form
 * picks from the guest directory), so that is what a profile matches on.
 */
export function prescriptionsFor(all: readonly Prescription[], patientId: string): Prescription[] {
  if (!patientId) return [];
  return all
    .filter((p) => p.customerId === patientId)
    .sort((a, b) => new Date(writtenAt(b) ?? 0).getTime() - new Date(writtenAt(a) ?? 0).getTime());
}

/**
 * Waiting to be collected. The record has no dispensing states, so "active"
 * — written and not yet released at the counter — is what ready means here;
 * releasing one sets it to completed. One still awaiting typing is not ready:
 * there is nothing checked to hand over.
 */
export function isReadyForPickup(p: Prescription): boolean {
  return p.status === 'active' && !awaitingTyping(p);
}
