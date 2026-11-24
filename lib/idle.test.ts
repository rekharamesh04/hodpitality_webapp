import { describe, expect, it } from 'vitest';
import { IDLE_LIMIT_MS, idleSignOutApplies, isIdle } from './idle';

describe('isIdle', () => {
  const now = 1_800_000_000_000;
  it('is idle only after the limit', () => {
    expect(isIdle(now - IDLE_LIMIT_MS - 1, now)).toBe(true);
    expect(isIdle(now - IDLE_LIMIT_MS + 1000, now)).toBe(false);
  });
  it('treats a missing time as active (first visit)', () => {
    expect(isIdle(null, now)).toBe(false);
    expect(isIdle(Number.NaN, now)).toBe(false);
  });
});

describe('idleSignOutApplies', () => {
  it('never on the kiosk', () => {
    expect(idleSignOutApplies('/kiosk', null)).toBe(false);
    expect(idleSignOutApplies('/dashboard', 'tenant-1')).toBe(false);
  });
  it('everywhere else', () => {
    expect(idleSignOutApplies('/customers', null)).toBe(true);
  });
});
