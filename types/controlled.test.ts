import { describe, expect, it } from 'vitest';
import { controlledMedicinesOf, type Prescription } from './prescription';

const rx = (medicines: Prescription['medicines']): Prescription => ({ id: 'rx', customerId: 'p', staffId: '', medicines });

describe('controlledMedicinesOf', () => {
  it('lists only lines marked controlled, with their schedule', () => {
    expect(controlledMedicinesOf(rx([
      { name: 'Oxycodone 5mg', controlled: true, schedule: 'II' },
      { name: 'Amoxicillin' },
      'Paracetamol',
      { name: '  ', controlled: true },
    ]))).toEqual([{ name: 'Oxycodone 5mg', schedule: 'II' }]);
  });

  it('is empty for a prescription with no medicines', () => {
    expect(controlledMedicinesOf(rx(undefined))).toEqual([]);
  });
});
