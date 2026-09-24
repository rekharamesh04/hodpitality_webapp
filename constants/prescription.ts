/**
 * Labels, colouring and ordering for the pharmacy module.
 *
 * The lifecycle here is the product's own state machine rather than tenant
 * vocabulary, so — unlike ./guest and ./customer — these maps are fixed rather
 * than derived from the tenant's industry. The words a pharmacy uses for a
 * *person* still come from ./industry via `useTerminology()`.
 */

import type {
  AlertKind,
  AlertSeverity,
  ClaimStatus,
  ControlledSchedule,
  PrescriptionSource,
  PrescriptionStatus,
  VerificationMethod,
} from '@/types/prescription';

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  received: 'Received',
  data_entry: 'Data entry',
  clinical_review: 'Pharmacist review',
  insurance: 'Insurance',
  problem: 'Problem',
  filling: 'Filling',
  ready: 'Ready for pickup',
  picked_up: 'Picked up',
  on_hold: 'On hold',
  cancelled: 'Cancelled',
  expired: 'Expired',
  transferred: 'Transferred',
  returned_to_stock: 'Returned to stock',
};

/**
 * Tailwind classes per status, in the same light/dark pairing the check-ins
 * page uses for its method badges.
 */
export const PRESCRIPTION_STATUS_CLASSES: Record<PrescriptionStatus, string> = {
  received:          'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700',
  data_entry:        'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  clinical_review:   'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  insurance:         'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800',
  problem:           'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  filling:           'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800',
  ready:             'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  picked_up:         'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
  on_hold:           'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800',
  cancelled:         'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  expired:           'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
  transferred:       'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800',
  returned_to_stock: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
};

/**
 * The happy path, in order, as the detail page's stepper draws it.
 *
 * Terminal and exception states (`on_hold`, `cancelled`, `problem`…) are
 * deliberately absent: they are departures from this line rather than points
 * on it, and the stepper renders them as an interruption instead.
 */
export const PRESCRIPTION_PIPELINE: readonly PrescriptionStatus[] = [
  'received', 'data_entry', 'clinical_review', 'insurance', 'filling', 'ready', 'picked_up',
];

/** True for a status that has left the pipeline and needs a person to decide something. */
export function isExceptionStatus(status: PrescriptionStatus): boolean {
  return !PRESCRIPTION_PIPELINE.includes(status);
}

/**
 * The work queues the worklist page offers, in the order a pharmacy works
 * them. `statuses` is what each tab counts and filters to — an `undefined`
 * list means "everything".
 */
export interface PrescriptionQueue {
  id: string;
  label: string;
  /** Short description shown under the heading when the queue is selected. */
  hint: string;
  statuses?: readonly PrescriptionStatus[];
}

export const PRESCRIPTION_QUEUES: readonly PrescriptionQueue[] = [
  { id: 'all',      label: 'All',             hint: 'Every prescription in the pharmacy right now.' },
  { id: 'intake',   label: 'Intake',          hint: 'Arrived but not yet transcribed.',            statuses: ['received', 'data_entry'] },
  { id: 'review',   label: 'Pharmacist review', hint: 'Waiting on a pharmacist to verify.',        statuses: ['clinical_review'] },
  { id: 'insurance',label: 'Insurance',       hint: 'Claims in flight with the plan.',             statuses: ['insurance'] },
  { id: 'problem',  label: 'Problems',        hint: 'Rejections, prior auths and clarifications.', statuses: ['problem', 'on_hold'] },
  { id: 'filling',  label: 'Filling',         hint: 'Being counted, labelled and bagged.',         statuses: ['filling'] },
  { id: 'ready',    label: 'Ready',           hint: 'On the will-call shelf waiting for collection.', statuses: ['ready'] },
  { id: 'closed',   label: 'Closed',          hint: 'Collected, cancelled or returned to stock.',  statuses: ['picked_up', 'cancelled', 'expired', 'transferred', 'returned_to_stock'] },
];

export const SOURCE_LABELS: Record<PrescriptionSource, string> = {
  e_prescription: 'e-Prescription',
  fax: 'Fax',
  paper: 'Paper',
  phone: 'Phone',
  transfer_in: 'Transfer in',
  refill_request: 'Refill request',
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  not_submitted: 'Not submitted',
  submitted: 'Submitted',
  paid: 'Paid',
  rejected: 'Rejected',
  prior_auth: 'Prior authorization',
  reversed: 'Reversed',
};

export const ALERT_KIND_LABELS: Record<AlertKind, string> = {
  drug_interaction: 'Drug interaction',
  allergy: 'Allergy',
  duplicate_therapy: 'Duplicate therapy',
  dose_range: 'Dose range',
  age: 'Age',
  pregnancy: 'Pregnancy',
  early_refill: 'Early refill',
  quantity: 'Quantity',
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: 'Information',
  moderate: 'Moderate',
  severe: 'Severe',
  contraindicated: 'Contraindicated',
};

export const ALERT_SEVERITY_CLASSES: Record<AlertSeverity, string> = {
  info:            'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900',
  moderate:        'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900',
  severe:          'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-900',
  contraindicated: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900',
};

/**
 * Severities a pharmacist must consciously override before the fill proceeds.
 * Anything milder is shown but does not stand in the way.
 */
export const BLOCKING_SEVERITIES: readonly AlertSeverity[] = ['severe', 'contraindicated'];

export function isBlockingSeverity(severity: AlertSeverity): boolean {
  return BLOCKING_SEVERITIES.includes(severity);
}

/** Ordering for a list of alerts — worst first, so nothing severe sits below the fold. */
export const SEVERITY_RANK: Record<AlertSeverity, number> = {
  contraindicated: 0, severe: 1, moderate: 2, info: 3,
};

export const SCHEDULE_LABELS: Record<ControlledSchedule, string> = {
  none: '', CII: 'C-II', CIII: 'C-III', CIV: 'C-IV', CV: 'C-V',
};

export function isControlled(schedule: ControlledSchedule): boolean {
  return schedule !== 'none';
}

export const VERIFICATION_METHOD_LABELS: Record<VerificationMethod, string> = {
  face: 'Face match',
  government_id: 'Government ID',
  date_of_birth: 'Date of birth',
  one_time_code: 'One-time code',
  staff_attestation: 'Staff attestation',
};

/**
 * The verification ladder, strongest first.
 *
 * Every rung is offered at the counter at all times. A pharmacy that leads
 * with face recognition still has to be able to release medication when the
 * camera is down, the patient declined enrolment, or the match simply fails —
 * so this is an ordered list of equals rather than a primary with backups.
 */
export const VERIFICATION_LADDER: readonly VerificationMethod[] = [
  'face', 'government_id', 'date_of_birth', 'one_time_code', 'staff_attestation',
];

/** Default face-match score a pharmacy accepts. Configurable per tenant once the API lands. */
export const DEFAULT_FACE_MATCH_THRESHOLD = 92;
