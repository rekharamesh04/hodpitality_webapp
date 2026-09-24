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

  /** The prescriber, as a STAFF row rather than an external NPI. */
  staffId: string;
  staffName?: string;
  /** Same value as staffName; the backend writes both. */
  doctorName?: string;

  /** The visit this was written at, when there was one. */
  appointmentId?: string;

  medicines?: MedicineEntry[];
  diagnosis?: string;
  notes?: string;
  status?: PrescriptionStatus | string;

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
  /** The backend accepts `staffId` or `doctorId`; it requires one of them. */
  staffId: string;
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
