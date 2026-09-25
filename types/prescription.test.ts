import { describe, expect, it } from 'vitest';
import { isReadyForPickup, prescriptionsFor, type Prescription } from './prescription';

const rx = (id: string, customerId: string, status: string, created_at: string): Prescription =>
  ({ id, customerId, staffId: 's1', status, created_at });

describe("a patient's prescriptions", () => {
  const all = [
    rx('a', 'g1', 'active', '2026-09-20T10:00:00Z'),
    rx('b', 'g2', 'active', '2026-09-21T10:00:00Z'),
    rx('c', 'g1', 'completed', '2026-09-22T10:00:00Z'),
    rx('d', 'g1', 'active', '2026-09-23T10:00:00Z'),
  ];

  it('are only theirs, newest first', () => {
    expect(prescriptionsFor(all, 'g1').map((p) => p.id)).toEqual(['d', 'c', 'a']);
  });

  it('are none for a missing id, rather than everyone’s', () => {
    expect(prescriptionsFor(all, '')).toEqual([]);
  });

  it('are ready for pickup until released', () => {
    expect(prescriptionsFor(all, 'g1').filter(isReadyForPickup).map((p) => p.id)).toEqual(['d', 'a']);
    expect(isReadyForPickup(rx('x', 'g1', 'cancelled', ''))).toBe(false);
  });
});
