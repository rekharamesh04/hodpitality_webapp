import { describe, expect, it } from 'vitest';
import {
  ageOn, isMinor, schoolConsentState, nextSchoolDay, addDays, time12h, familyPayload,
  familyFieldsOf, EMPTY_FAMILY_FIELDS, relationshipLabel, hasFamilyDetails,
} from './family';

const TODAY = '2026-11-13';

describe('age', () => {
  it('counts whole years, turning on the birthday', () => {
    expect(ageOn('2017-03-14', '2026-03-13')).toBe(8);
    expect(ageOn('2017-03-14', '2026-03-14')).toBe(9);
    expect(ageOn('', TODAY)).toBeNull();
    expect(ageOn('2017-02-30', TODAY)).toBeNull();
  });

  it('a minor is under 18', () => {
    expect(isMinor('2009-11-14', TODAY)).toBe(true);
    expect(isMinor('2008-11-13', TODAY)).toBe(false);
    expect(isMinor(undefined, TODAY)).toBe(false);
  });
});

describe('permission to send to the school', () => {
  const granted = {
    schoolEmail: 'office@lincoln.test', schoolShareConsent: true, schoolShareConsentEmail: 'office@lincoln.test',
  };

  it('holds for the address it was given for', () => {
    expect(schoolConsentState(granted, TODAY)).toEqual({ ok: true, reason: '' });
    expect(schoolConsentState({ ...granted, schoolEmail: 'Office@Lincoln.test' }, TODAY).ok).toBe(true);
  });

  it('explains every way it does not', () => {
    expect(schoolConsentState({}, TODAY).reason).toMatch(/No school email/);
    expect(schoolConsentState({ schoolEmail: 'office@lincoln.test' }, TODAY).reason).toMatch(/not given permission/);
    expect(schoolConsentState({ ...granted, schoolEmail: 'new@school.test' }, TODAY).reason).toMatch(/different school email/);
    expect(schoolConsentState({ ...granted, schoolShareConsentExpires: '2026-11-12' }, TODAY).reason).toMatch(/expired/);
    expect(schoolConsentState({ ...granted, schoolShareConsentExpires: TODAY }, TODAY).ok).toBe(true);
  });
});

describe('dates and times', () => {
  it('returns to school on the next weekday', () => {
    expect(nextSchoolDay('2026-11-12')).toBe('2026-11-13'); // Thursday → Friday
    expect(nextSchoolDay('2026-11-13')).toBe('2026-11-16'); // Friday → Monday
    expect(nextSchoolDay('2026-11-14')).toBe('2026-11-16'); // Saturday → Monday
  });

  it('adds days across a month end', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('nonsense', 1)).toBe('');
  });

  it('prints times the US way', () => {
    expect(time12h('00:05')).toBe('12:05 AM');
    expect(time12h('12:30')).toBe('12:30 PM');
    expect(time12h('9:30')).toBe('');
  });

  it('labels relationships', () => {
    expect(relationshipLabel('legal_guardian')).toBe('Legal guardian');
    expect(relationshipLabel(undefined)).toBe('Parent or guardian');
  });
});

describe('whether the child section opens ticked', () => {
  it('is ticked for a record with any family or school detail, not for a plain adult', () => {
    expect(hasFamilyDetails({ guardianId: 'sarah' })).toBe(true);
    expect(hasFamilyDetails({ schoolEmail: 'a@b.test' })).toBe(true);
    expect(hasFamilyDetails({ name: 'Adult', email: 'a@b.test' })).toBe(false);
    expect(hasFamilyDetails(null)).toBe(false);
  });

  it('a date of birth alone counts only for a minor — every patient may have one now', () => {
    expect(hasFamilyDetails({ dateOfBirth: '1980-05-02' }, TODAY)).toBe(false);
    expect(hasFamilyDetails({ dateOfBirth: '2017-03-14' }, TODAY)).toBe(true);
    expect(hasFamilyDetails({ dateOfBirth: '1980-05-02', guardianId: 'sarah' }, TODAY)).toBe(true);
  });

  it('unticking on an edit clears what was there', () => {
    const original = familyFieldsOf({ guardianId: 'sarah', guardianRelationship: 'mother', schoolName: 'Lincoln' });
    expect(familyPayload(EMPTY_FAMILY_FIELDS, original))
      .toEqual({ guardianId: '', guardianRelationship: '', schoolName: '' });
  });
});

describe('what the patient form sends', () => {
  it('on create, only what was filled in — an adult registration sends nothing new', () => {
    expect(familyPayload(EMPTY_FAMILY_FIELDS, null)).toEqual({});
    expect(familyPayload({ ...EMPTY_FAMILY_FIELDS, guardianId: 'sarah', dateOfBirth: '2017-03-14' }, null))
      .toEqual({ guardianId: 'sarah', dateOfBirth: '2017-03-14', guardianRelationship: 'parent' });
  });

  it('on edit, only what changed — and an emptied field is sent empty so it is cleared', () => {
    const original = familyFieldsOf({ guardianId: 'sarah', guardianRelationship: 'mother', schoolEmail: 'a@b.test' });
    expect(familyPayload(original, original)).toEqual({});
    expect(familyPayload({ ...original, schoolEmail: '' }, original)).toEqual({ schoolEmail: '' });
    expect(familyPayload({ ...original, guardianId: '', guardianRelationship: '' }, original))
      .toEqual({ guardianId: '', guardianRelationship: '' });
  });
});
