/**
 * Doctor NPI and patient insurance — the facts an outside booking channel
 * (Zocdoc) needs before it can list a doctor or hand over a booking.
 *
 * Both are optional, and only clinical organisations see them. The rules here
 * mirror the backend (`_npi_error`, `_clean_insurance` in hospitality_lambda.py),
 * so the form catches a mistake before the server has to.
 */
import { normalizeIndustry } from '@/constants/industry';
import type { NpiRegistryRecord, PatientInsurance } from '@/types';

/**
 * Hospitals and pharmacies only. Named outright rather than "has the prescriptions
 * module": the catch-all "other" pack (also the platform-wide view) carries every
 * module, and must not grow US clinical fields.
 */
const CLINICAL_INDUSTRIES = new Set<string>(['healthcare', 'pharmacy']);

export function isClinicalIndustry(industry: unknown): boolean {
  return CLINICAL_INDUSTRIES.has(normalizeIndustry(industry));
}

/**
 * Null when `raw` is a well-formed US National Provider Identifier, else why not.
 * 10 digits; the last is a Luhn check over the first nine with the prefix 80840.
 */
export function npiError(raw: string): string | null {
  const npi = raw.trim();
  if (!/^\d{10}$/.test(npi)) return 'NPI must be exactly 10 digits.';
  let total = 0;
  const digits = `80840${npi}`.split('').reverse();
  digits.forEach((ch, i) => {
    let d = Number(ch);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    total += d;
  });
  return total % 10 === 0 ? null : 'That NPI is not valid. Check the number and try again.';
}

/** "ARDALAN ENKESHAFI" → "Ardalan Enkeshafi". The registry stores names in capitals. */
function titleCase(text: string): string {
  return text.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/**
 * One line for a staff profile, from what the US NPI Registry said:
 * "Ardalan Enkeshafi, M.D. · Hospitalist". Empty when the NPI was never verified.
 */
export function npiRegistrySummary(rec: NpiRegistryRecord | undefined | null): string {
  if (!rec?.name) return '';
  const who = rec.credential ? `${titleCase(rec.name)}, ${rec.credential}` : titleCase(rec.name);
  return [who, rec.specialty].filter(Boolean).join(' · ');
}

export const INSURANCE_FIELD_MAX = 100;

export interface InsuranceForm {
  selfPay: boolean;
  carrier: string;
  plan: string;
  memberId: string;
  groupNumber: string;
}

export const EMPTY_INSURANCE_FORM: InsuranceForm = {
  selfPay: false, carrier: '', plan: '', memberId: '', groupNumber: '',
};

export function insuranceFormOf(ins: PatientInsurance | undefined | null): InsuranceForm {
  if (!ins) return EMPTY_INSURANCE_FORM;
  return {
    selfPay: ins.selfPay === true,
    carrier: ins.carrier ?? '',
    plan: ins.plan ?? '',
    memberId: ins.memberId ?? '',
    groupNumber: ins.groupNumber ?? '',
  };
}

/** What the API stores for this form: trimmed, blanks dropped, self-pay alone. `{}` = nothing on file. */
export function insurancePayload(form: InsuranceForm): PatientInsurance {
  if (form.selfPay) return { selfPay: true };
  const out: PatientInsurance = {};
  (['carrier', 'plan', 'memberId', 'groupNumber'] as const).forEach((k) => {
    const v = form[k].trim();
    if (v) out[k] = v;
  });
  return out;
}

export function hasInsurance(ins: PatientInsurance | undefined | null): boolean {
  return !!ins && Object.keys(insurancePayload(insuranceFormOf(ins))).length > 0;
}

export function sameInsurance(a: PatientInsurance | undefined | null, b: PatientInsurance | undefined | null): boolean {
  const x = insurancePayload(insuranceFormOf(a));
  const y = insurancePayload(insuranceFormOf(b));
  const keys = new Set([...Object.keys(x), ...Object.keys(y)]) as Set<keyof PatientInsurance>;
  return [...keys].every((k) => x[k] === y[k]);
}

/** The first field that is too long, if any. */
export function insuranceTooLong(form: InsuranceForm): keyof InsuranceForm | null {
  if (form.selfPay) return null;
  const k = (['carrier', 'plan', 'memberId', 'groupNumber'] as const)
    .find((key) => form[key].trim().length > INSURANCE_FIELD_MAX);
  return k ?? null;
}

/** One line for a profile: "Blue Cross · PPO Gold · Member XYZ123 · Group 77", or "Self-pay". */
export function insuranceSummary(ins: PatientInsurance | undefined | null): string {
  if (!ins) return '';
  if (ins.selfPay) return 'Self-pay';
  return [
    ins.carrier,
    ins.plan,
    ins.memberId ? `Member ${ins.memberId}` : '',
    ins.groupNumber ? `Group ${ins.groupNumber}` : '',
  ].filter(Boolean).join(' · ');
}
