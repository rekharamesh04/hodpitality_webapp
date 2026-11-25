import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RENEW_WHEN_LEFT_MS, clearLocationPass, isDefiniteRefusal, msUntilRenewal, readLocationPass, readPosition,
  saveLocationPass,
} from './location-pass';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => { data.delete(k); },
    setItem: (k, v) => { data.set(k, String(v)); },
  };
}

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: memoryStorage(), isSecureContext: true });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('the stored pass', () => {
  const now = 1_800_000_000_000;

  it('is sent until it expires', () => {
    saveLocationPass('tok', 20 * 60, 'Midtown', now);
    expect(readLocationPass(now)).toBe('tok');
    expect(readLocationPass(now + 20 * 60_000 + 1)).toBeNull();
  });

  it('is renewed with about 12 minutes left', () => {
    saveLocationPass('tok', 20 * 60, undefined, now);
    expect(msUntilRenewal(now)).toBe(20 * 60_000 - RENEW_WHEN_LEFT_MS);
    expect(msUntilRenewal(now + 15 * 60_000)).toBe(0);
    expect(msUntilRenewal(now + 21 * 60_000)).toBeNull();
  });

  it('is gone after sign-out', () => {
    saveLocationPass('tok', 600, undefined, now);
    clearLocationPass();
    expect(readLocationPass(now)).toBeNull();
  });

  it('ignores something unreadable', () => {
    window.localStorage.setItem('entryflow_location_pass', '{not json');
    expect(readLocationPass()).toBeNull();
  });
});

describe('readPosition', () => {
  const geo = (impl: Geolocation['getCurrentPosition']) => ({ getCurrentPosition: impl }) as unknown as Geolocation;

  it('returns the position and how precise it is', async () => {
    const reading = await readPosition(geo((ok) => ok({ coords: { latitude: 29.74, longitude: -95.37, accuracy: 25 } } as GeolocationPosition)));
    expect(reading).toEqual({ lat: 29.74, lng: -95.37, accuracy: 25 });
  });

  it('turns a blocked prompt into "denied"', async () => {
    const reading = await readPosition(geo((_ok, fail) => fail?.({ code: 1 } as GeolocationPositionError)));
    expect(reading).toEqual({ problem: 'denied' });
  });

  it('gives up on a prompt nobody answers', async () => {
    vi.useFakeTimers();
    const pending = readPosition(geo(() => { /* never answers */ }));
    vi.advanceTimersByTime(31_000);
    expect(await pending).toEqual({ problem: 'timeout' });
  });

  it('says unsupported without geolocation or outside HTTPS', async () => {
    expect(await readPosition(undefined)).toEqual({ problem: 'unsupported' });
    vi.stubGlobal('window', { localStorage: memoryStorage(), isSecureContext: false });
    expect(await readPosition(geo(() => {}))).toEqual({ problem: 'unsupported' });
  });
});

describe('isDefiniteRefusal', () => {
  it('means "not at a clinic", not "the device could not say"', () => {
    expect(isDefiniteRefusal({ allowed: false, reason: 'far' })).toBe(true);
    expect(isDefiniteRefusal({ allowed: false, reason: 'imprecise' })).toBe(true);
    expect(isDefiniteRefusal({ allowed: false, reason: 'timeout' })).toBe(false);
    expect(isDefiniteRefusal({ allowed: true })).toBe(false);
  });
});
