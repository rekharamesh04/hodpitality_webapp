import { describe, expect, it } from 'vitest';
import { sameClock } from './TimezoneSettingsCard';

describe('comparing timezones', () => {
  it('treats a legacy alias as the same place', () => {
    expect(sameClock('Asia/Calcutta', 'Asia/Kolkata')).toBe(true);
  });

  it('tells Texas from India', () => {
    expect(sameClock('America/Chicago', 'Asia/Kolkata')).toBe(false);
  });

  it('counts daylight saving: Phoenix is not Denver', () => {
    expect(sameClock('America/Phoenix', 'America/Denver')).toBe(false);
  });
});
