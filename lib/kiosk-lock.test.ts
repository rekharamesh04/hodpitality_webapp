import { beforeEach, describe, expect, it } from 'vitest';
import { clearKioskPin, hashKioskPin, isKioskActive, isValidKioskPin, saveKioskPin, setKioskActive } from './kiosk-lock';

/** A Map-backed localStorage, since vitest runs these in node. */
function installStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  Object.assign(globalThis, { window: globalThis, localStorage: storage });
}

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

describe('kiosk mode', () => {
  beforeEach(installStorage);

  it('holds only with a PIN set, and only for the organisation that set it', async () => {
    setKioskActive('tenant-a', true);
    expect(isKioskActive('tenant-a')).toBe(false); // no PIN yet: nothing could ever unlock it
    await saveKioskPin('tenant-a', '1234');
    expect(isKioskActive('tenant-a')).toBe(true);
    expect(isKioskActive('tenant-b')).toBe(false);
  });

  it('ends with the PIN, or with signing out', async () => {
    await saveKioskPin('tenant-a', '1234');
    setKioskActive('tenant-a', true);
    setKioskActive('tenant-a', false);
    expect(isKioskActive('tenant-a')).toBe(false);
    setKioskActive('tenant-a', true);
    clearKioskPin();
    expect(isKioskActive('tenant-a')).toBe(false);
  });
});
