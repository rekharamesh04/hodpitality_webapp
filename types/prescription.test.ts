import { describe, expect, it } from 'vitest';
import {
  attachmentsOf, awaitingTyping, isReadyForPickup, prescriptionsFor, typedMedicinesOf, type Prescription,
} from './prescription';

const rx = (id: string, customerId: string, status: string, created_at: string, extra: Partial<Prescription> = {}): Prescription =>
  ({ id, customerId, staffId: 's1', status, created_at, medicines: [{ name: 'Paracetamol' }], ...extra });

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

describe('a prescription saved from a photo', () => {
  const photo = { id: 'doc1', prescriptionId: 'p', url: 'https://signed.example/x' };

  it('awaits typing until a medicine is named, and is not ready for pickup meanwhile', () => {
    const untyped = rx('p', 'g1', 'active', '', { medicines: [], attachments: [photo] });
    expect(awaitingTyping(untyped)).toBe(true);
    expect(isReadyForPickup(untyped)).toBe(false);
  });

  it('does not count a blank row as typed, but does count an older plain-string medicine', () => {
    expect(awaitingTyping(rx('p', 'g1', 'active', '', { medicines: [{ name: '  ', dosage: '5 mg' }] }))).toBe(true);
    expect(typedMedicinesOf(rx('p', 'g1', 'active', '', { medicines: ['Amoxicillin 500', ''] }))).toEqual(['Amoxicillin 500']);
  });

  it('reads attachments defensively', () => {
    expect(attachmentsOf(rx('p', 'g1', 'active', '', { attachments: [photo] }))).toEqual([photo]);
    expect(attachmentsOf(rx('p', 'g1', 'active', ''))).toEqual([]);
  });
});
