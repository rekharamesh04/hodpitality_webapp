import { describe, expect, it } from 'vitest';
import { describeRemoved, personDeleteWarning } from './person-delete';

describe('describeRemoved', () => {
  it('lists what went with the person, in plain words', () => {
    expect(describeRemoved({ APPOINTMENT: 2, PRESCRIPTION: 1 })).toBe('with 2 appointments and 1 prescription');
    expect(describeRemoved({ APPOINTMENT: 1, DOCUMENT: 3, CHECKIN: 2 })).toBe('with 1 appointment, 3 reports and 2 visits');
  });

  it('says nothing when nothing else was removed', () => {
    expect(describeRemoved({})).toBe('');
    expect(describeRemoved(undefined)).toBe('');
    expect(describeRemoved({ APPOINTMENT: 0 })).toBe('');
  });
});

describe('personDeleteWarning', () => {
  it('warns that related records go and payments stay', () => {
    const text = personDeleteWarning('Patient');
    expect(text).toContain('prescriptions');
    expect(text).toContain('Payments are kept');
  });
});
