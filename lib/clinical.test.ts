import { describe, expect, it } from 'vitest';
import {
  EMPTY_INSURANCE_FORM, hasInsurance, insuranceFormOf, insurancePayload, insuranceSummary,
  insuranceTooLong, isClinicalIndustry, npiError, sameInsurance,
} from './clinical';

describe('isClinicalIndustry', () => {
  it('is true only for hospitals and pharmacies', () => {
    expect(isClinicalIndustry('healthcare')).toBe(true);
    expect(isClinicalIndustry('Pharmacy')).toBe(true);
    for (const other of ['hospitality', 'education', 'wellness', 'other', undefined, 'nonsense']) {
      expect(isClinicalIndustry(other)).toBe(false);
    }
  });
});

describe('npiError — same cases as the backend tests', () => {
  it('accepts valid NPIs', () => {
    expect(npiError('1234567893')).toBeNull(); // CMS's published example
    expect(npiError('1245319599')).toBeNull();
    expect(npiError(' 1234567893 ')).toBeNull();
  });
  it('rejects typos and bad shapes', () => {
    for (const bad of ['1234567890', '123456789', '12345678901', '12345abcde', '']) {
      expect(npiError(bad)).not.toBeNull();
    }
  });
});

describe('insurance', () => {
  it('trims and drops blanks', () => {
    expect(insurancePayload({ ...EMPTY_INSURANCE_FORM, carrier: ' Aetna ', memberId: 'A1', plan: '  ' }))
      .toEqual({ carrier: 'Aetna', memberId: 'A1' });
  });
  it('self-pay keeps nothing else', () => {
    expect(insurancePayload({ ...EMPTY_INSURANCE_FORM, selfPay: true, carrier: 'Aetna' })).toEqual({ selfPay: true });
  });
  it('an empty form means nothing on file', () => {
    expect(insurancePayload(EMPTY_INSURANCE_FORM)).toEqual({});
    expect(hasInsurance({})).toBe(false);
    expect(hasInsurance(undefined)).toBe(false);
    expect(hasInsurance({ selfPay: true })).toBe(true);
  });
  it('compares by content, so an untouched edit sends nothing', () => {
    expect(sameInsurance(undefined, {})).toBe(true);
    expect(sameInsurance({ carrier: 'Aetna' }, insurancePayload(insuranceFormOf({ carrier: 'Aetna' })))).toBe(true);
    expect(sameInsurance({ carrier: 'Aetna' }, { carrier: 'Cigna' })).toBe(false);
    expect(sameInsurance({ carrier: 'Aetna' }, {})).toBe(false);
  });
  it('flags a field over 100 characters, but not when self-pay', () => {
    expect(insuranceTooLong({ ...EMPTY_INSURANCE_FORM, plan: 'x'.repeat(101) })).toBe('plan');
    expect(insuranceTooLong({ ...EMPTY_INSURANCE_FORM, plan: 'x'.repeat(100) })).toBeNull();
    expect(insuranceTooLong({ ...EMPTY_INSURANCE_FORM, selfPay: true, plan: 'x'.repeat(101) })).toBeNull();
  });
  it('summarises for a profile', () => {
    expect(insuranceSummary({ carrier: 'Blue Cross', plan: 'PPO', memberId: 'X1', groupNumber: '77' }))
      .toBe('Blue Cross · PPO · Member X1 · Group 77');
    expect(insuranceSummary({ selfPay: true })).toBe('Self-pay');
    expect(insuranceSummary(undefined)).toBe('');
  });
});
