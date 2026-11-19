import type { Guest } from '@/types';

/**
 * Families and school excuse notes: the rules the screens need, free of React so they can be tested.
 *
 * A child is a patient record linked to a parent or guardian who is also a patient record. The
 * guardian is who the hospital writes to, so a child needs no email or phone of their own.
 *
 * A school excuse note confirms a visit so the school excuses the absence. It goes to the parent
 * always, and to the school only with the parent's permission on file for that school's email.
 *
 * The backend enforces every rule here (app/school_notes.py); these copies only let a screen say
 * why something is unavailable before anyone presses a button.
 */

export const GUARDIAN_RELATIONSHIPS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'parent', label: 'Parent' },
  { value: 'legal_guardian', label: 'Legal guardian' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'foster_parent', label: 'Foster parent' },
  { value: 'other', label: 'Other' },
] as const;

export const DEFAULT_RELATIONSHIP = 'parent';
export const ADULT_AGE = 18;

export function relationshipLabel(value?: string): string {
  return GUARDIAN_RELATIONSHIPS.find((r) => r.value === value)?.label ?? 'Parent or guardian';
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A YYYY-MM-DD string as [year, month, day], or null. Never parsed as UTC midnight. */
function parts(value?: string): [number, number, number] | null {
  const m = DATE_RE.exec((value ?? '').trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(y, mo - 1, d);
  if (probe.getFullYear() !== y || probe.getMonth() !== mo - 1 || probe.getDate() !== d) return null;
  return [y, mo, d];
}

/** Whole years from a date of birth to `today` (YYYY-MM-DD), or null when either is unknown. */
export function ageOn(dateOfBirth: string | undefined, today: string): number | null {
  const dob = parts(dateOfBirth);
  const now = parts(today);
  if (!dob || !now) return null;
  const before = now[1] < dob[1] || (now[1] === dob[1] && now[2] < dob[2]);
  return Math.max(0, now[0] - dob[0] - (before ? 1 : 0));
}

export function isMinor(dateOfBirth: string | undefined, today: string): boolean {
  const age = ageOn(dateOfBirth, today);
  return age !== null && age < ADULT_AGE;
}

/** "9 years old", or '' when the date of birth is unknown. */
export function ageLabel(dateOfBirth: string | undefined, today: string): string {
  const age = ageOn(dateOfBirth, today);
  if (age === null) return '';
  return age === 1 ? '1 year old' : `${age} years old`;
}

/**
 * Whether a note may be sent to this person's school, and if not, why — the backend's
 * school_consent_state, in the same words.
 */
export function schoolConsentState(person: Partial<Guest> | null | undefined, today: string): { ok: boolean; reason: string } {
  const schoolEmail = (person?.schoolEmail ?? '').trim().toLowerCase();
  if (!schoolEmail) return { ok: false, reason: 'No school email address is on this record.' };
  if (person?.schoolShareConsent !== true) {
    return { ok: false, reason: 'The parent or guardian has not given permission to send notes to the school.' };
  }
  if ((person.schoolShareConsentEmail ?? '').trim().toLowerCase() !== schoolEmail) {
    return { ok: false, reason: 'Permission was given for a different school email address. Record it again for the current one.' };
  }
  const expires = person.schoolShareConsentExpires;
  if (expires && parts(expires) && expires < today) {
    return { ok: false, reason: `Permission to send to the school expired on ${expires}.` };
  }
  return { ok: true, reason: '' };
}

/** YYYY-MM-DD plus `days`, in local calendar terms. */
export function addDays(date: string, days: number): string {
  const p = parts(date);
  if (!p) return '';
  const d = new Date(p[0], p[1] - 1, p[2] + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** The next weekday after `date` — when a child seen on Friday goes back on Monday. */
export function nextSchoolDay(date: string): string {
  let next = addDays(date, 1);
  for (let i = 0; i < 3; i++) {
    const p = parts(next);
    if (!p) return '';
    const weekday = new Date(p[0], p[1] - 1, p[2]).getDay();
    if (weekday !== 0 && weekday !== 6) return next;
    next = addDays(next, 1);
  }
  return next;
}

/** An ISO timestamp as local HH:MM for a time input, or '' when there is none. */
export function localTimeOf(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "14:05" → "2:05 PM"; '' for anything else. */
export function time12h(value?: string): string {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec((value ?? '').trim());
  if (!m) return '';
  const hour = Number(m[1]);
  return `${hour % 12 || 12}:${m[2]} ${hour < 12 ? 'AM' : 'PM'}`;
}

/** The fields the patient form sends for family and school, so a blank one clears what is stored. */
export interface FamilyFormFields {
  dateOfBirth: string;
  guardianId: string;
  guardianRelationship: string;
  schoolName: string;
  schoolGrade: string;
  schoolEmail: string;
}

export const EMPTY_FAMILY_FIELDS: FamilyFormFields = {
  dateOfBirth: '', guardianId: '', guardianRelationship: '', schoolName: '', schoolGrade: '', schoolEmail: '',
};

/**
 * Whether a record already carries family or school details — the patient form opens them ticked.
 *
 * Every patient may now have a date of birth, so a date of birth alone only counts when it makes
 * the person a minor. An adult with a birth date on file is not "a child or dependant".
 */
export function hasFamilyDetails(guest?: Partial<Guest> | null, today: string = localToday()): boolean {
  return !!(guest?.guardianId || guest?.schoolName || guest?.schoolGrade || guest?.schoolEmail
    || (guest?.dateOfBirth && isMinor(guest.dateOfBirth, today)));
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function familyFieldsOf(guest?: Partial<Guest> | null): FamilyFormFields {
  return {
    dateOfBirth: guest?.dateOfBirth ?? '',
    guardianId: guest?.guardianId ?? '',
    guardianRelationship: guest?.guardianRelationship ?? '',
    schoolName: guest?.schoolName ?? '',
    schoolGrade: guest?.schoolGrade ?? '',
    schoolEmail: guest?.schoolEmail ?? '',
  };
}

/**
 * What to send for family and school. On create only filled-in fields go, so a plain adult
 * registration is byte-for-byte what it always was. On edit every field goes, so emptying one
 * clears it — but only fields that changed, so an untouched record is never rewritten.
 */
export function familyPayload(form: FamilyFormFields, original: FamilyFormFields | null): Partial<FamilyFormFields> {
  const out: Partial<FamilyFormFields> = {};
  (Object.keys(form) as (keyof FamilyFormFields)[]).forEach((key) => {
    const value = form[key].trim();
    if (!original) {
      if (value) out[key] = value;
    } else if (value !== original[key].trim()) {
      out[key] = value;
    }
  });
  // A guardian with no relationship chosen is a "parent" — say so, rather than leaving the backend to guess.
  if (out.guardianId && !form.guardianRelationship.trim()) out.guardianRelationship = DEFAULT_RELATIONSHIP;
  return out;
}
