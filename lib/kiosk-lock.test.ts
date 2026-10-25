import { describe, expect, it } from 'vitest';
import { hashKioskPin, isValidKioskPin } from './kiosk-lock';

describe('the kiosk exit PIN', () => {
  it('is four to six digits', () => {
    expect(isValidKioskPin('1234')).toBe(true);
    expect(isValidKioskPin('123456')).toBe(true);
    expect(isValidKioskPin('123')).toBe(false);
    expect(isValidKioskPin('1234567')).toBe(false);
    expect(isValidKioskPin('12a4')).toBe(false);
  });

  it('is stored as a hash that differs between organisations', async () => {
    const a = await hashKioskPin('tenant-a', '1234');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain('1234');
    expect(await hashKioskPin('tenant-a', '1234')).toBe(a);
    expect(await hashKioskPin('tenant-b', '1234')).not.toBe(a);
  });
});
