/**
 * The pharmacy module's vocabulary.
 *
 * These types describe the `prescriptions` module already declared in
 * constants/industry.ts but never built. Nothing here is served by the API
 * yet — the screens under app/(dashboard)/prescriptions and
 * app/(dashboard)/pickup render lib/mock/pharmacy.ts. See
 * docs/PHARMACY_MODULE.md for the endpoints each field is expected to arrive
 * from, so the shapes can be kept honest when the backend lands.
 *
 * Field names deliberately mirror the existing modules (`id`/`PK`,
 * `createdAt`/`created_at`, denormalized display names alongside ids) so a
 * prescription row reads like a guest or payment row to anyone already
 * working in this codebase.
 */

/**
 * Where a prescription sits in the pharmacy's own workflow.
 *
 * This is a closed union because — unlike a guest `category` or a hospitality
 * `type`, which are per-industry vocabulary — the lifecycle is the product's
 * own state machine, not a tenant's word for something. A value outside this
 * list would have no queue to sit in and no allowed transitions, so readers
 * may treat an unknown one as `received` rather than having to render it.
 */
export type PrescriptionStatus =
  | 'received'          // arrived (e-Rx, fax, paper, phone) — not yet keyed in
  | 'data_entry'        // being transcribed by a technician
  | 'clinical_review'   // waiting on a pharmacist's verification
  | 'insurance'         // claim in flight
  | 'problem'           // rejection, prior auth, refill-too-soon, clarification needed
  | 'filling'           // counted, labelled, bagged
  | 'ready'             // on the will-call shelf
  | 'picked_up'         // released to the patient or their representative
  | 'on_hold'
  | 'cancelled'
  | 'expired'
  | 'transferred'
  | 'returned_to_stock';

/** How the prescription reached the pharmacy. Drives what intake screen is shown. */
export type PrescriptionSource = 'e_prescription' | 'fax' | 'paper' | 'phone' | 'transfer_in' | 'refill_request';

/** DEA schedule. `none` covers everything that is not a controlled substance. */
export type ControlledSchedule = 'none' | 'CII' | 'CIII' | 'CIV' | 'CV';

/** How severe a clinical alert is. Only `severe` and `contraindicated` block a fill without an override. */
export type AlertSeverity = 'info' | 'moderate' | 'severe' | 'contraindicated';

/** What a clinical alert is about. */
export type AlertKind =
  | 'drug_interaction'
  | 'allergy'
  | 'duplicate_therapy'
  | 'dose_range'
  | 'age'
  | 'pregnancy'
  | 'early_refill'
  | 'quantity';

export interface ClinicalAlert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  /** One line a pharmacist can act on, e.g. "Warfarin + ibuprofen — bleeding risk". */
  title: string;
  detail: string;
  /** The other medication this alert is about, when the alert is a comparison. */
  againstDrug?: string;
  /** Set once a pharmacist has consciously accepted the risk. */
  overriddenBy?: string;
  overriddenAt?: string;
  overrideReason?: string;
}

export interface Prescriber {
  name: string;
  /** National Provider Identifier — ten digits. */
  npi: string;
  /** DEA number, present only for controlled-substance prescribing. */
  dea?: string;
  clinic?: string;
  phone?: string;
}

export interface Drug {
  /** National Drug Code, the 11-digit billing identifier. */
  ndc: string;
  name: string;
  genericName?: string;
  brandName?: string;
  strength: string;
  /** Tablet, capsule, solution, cream… */
  form: string;
  manufacturer?: string;
  schedule: ControlledSchedule;
  therapeuticClass?: string;
}

/** A claim as the switch answered it. */
export type ClaimStatus = 'not_submitted' | 'submitted' | 'paid' | 'rejected' | 'prior_auth' | 'reversed';

export interface InsuranceClaim {
  id: string;
  status: ClaimStatus;
  planName?: string;
  bin?: string;
  pcn?: string;
  group?: string;
  memberId?: string;
  /** What the patient owes after the plan pays. */
  copay?: number;
  /** What the plan paid. */
  planPaid?: number;
  /** The NCPDP reject code, e.g. "75" for prior authorization required. */
  rejectCode?: string;
  rejectReason?: string;
  submittedAt?: string;
  respondedAt?: string;
}

export interface Prescription {
  id: string;
  PK?: string;
  entity_type?: string;
  /** The human-facing number printed on the label and quoted on the phone. */
  rxNumber: string;
  /** The person the medication is for — a row in the existing guest directory. */
  patientId: string;
  patientName: string;
  patientDob?: string;
  patientPhone?: string;
  drug: Drug;
  /** Directions as they will print on the label, e.g. "Take 1 tablet by mouth twice daily". */
  sig: string;
  quantity: number;
  daysSupply?: number;
  refillsAuthorized: number;
  refillsRemaining: number;
  /** Dispense As Written code — 0 means substitution is permitted. */
  daw?: number;
  prescriber: Prescriber;
  source: PrescriptionSource;
  status: PrescriptionStatus;
  /** Raised by the interaction engine; a pharmacist clears or overrides each one. */
  alerts: ClinicalAlert[];
  claim?: InsuranceClaim;
  writtenDate?: string;
  expiresOn?: string;
  /** When this row entered its current queue — drives the "waiting" column. */
  queuedAt?: string;
  filledAt?: string;
  readyAt?: string;
  pickedUpAt?: string;
  /** Free-text the pharmacist attaches to the fill, not the patient. */
  pharmacistNotes?: string;
  /** The shelf bin the bag is sitting in, once ready. */
  willCallBin?: string;
  price?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
}

// ─── Identity ────────────────────────────────────────────────────────────────

/**
 * How the person at the counter was proven to be who they claim.
 *
 * Face recognition is one member of this union rather than the union itself:
 * a biometric false negative must never be the only thing standing between a
 * patient and their medication, so every screen that verifies identity offers
 * the whole ladder. See docs/PHARMACY_MODULE.md.
 */
export type VerificationMethod =
  | 'face'
  | 'government_id'
  | 'date_of_birth'
  | 'one_time_code'
  | 'staff_attestation';

export type VerificationOutcome = 'verified' | 'failed' | 'skipped' | 'pending';

export interface VerificationAttempt {
  id: string;
  method: VerificationMethod;
  outcome: VerificationOutcome;
  /** Match score for `face`, 0–100. Absent for every other method. */
  confidence?: number;
  /** The score this pharmacy requires before a face counts as a match. */
  threshold?: number;
  at: string;
  /** The staff member who ran or attested to the check. */
  by?: string;
  note?: string;
}

/** Whether a patient has a face template on file, and whether they wanted one. */
export type FaceEnrollmentState = 'enrolled' | 'not_enrolled' | 'opted_out' | 'expired';

/**
 * Someone other than the patient who may collect on their behalf.
 *
 * HIPAA lets a pharmacy release to a family member or friend involved in the
 * patient's care, so this is a first-class record with its own expiry and
 * scope rather than an informal note on the patient.
 */
export interface AuthorizedRepresentative {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phone?: string;
  /** What the representative may collect — all prescriptions, or named ones only. */
  scope: 'all' | 'listed';
  listedRxNumbers?: string[];
  /** Controlled substances usually need an explicit extra grant. */
  allowControlled: boolean;
  faceEnrollment: FaceEnrollmentState;
  idOnFile?: string;
  startsOn?: string;
  expiresOn?: string;
  status: 'active' | 'expired' | 'revoked';
  addedBy?: string;
  addedAt?: string;
}

/** The pharmacy-side view of a patient, assembled for the pickup counter. */
export interface PharmacyPatient {
  id: string;
  name: string;
  dob: string;
  phone?: string;
  email?: string;
  address?: string;
  faceEnrollment: FaceEnrollmentState;
  facePhotoUrl?: string;
  /** Allergies drive the clinical alerts, so they are shown wherever a fill is decided. */
  allergies: string[];
  insurancePlan?: string;
  representatives: AuthorizedRepresentative[];
  /** How many bags are on the will-call shelf for this person right now. */
  readyCount: number;
}

// ─── Audit ───────────────────────────────────────────────────────────────────

/**
 * One line of the access trail.
 *
 * Every read of a prescription is an event, not only every write: the point of
 * the log is to answer "who saw this patient's record", which a write-only log
 * cannot.
 */
export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  actorRole: string;
  action: string;
  /** What was acted on, in words — "Rx #4417832", "Face template". */
  target: string;
  outcome?: 'success' | 'failure';
  device?: string;
  detail?: string;
}
