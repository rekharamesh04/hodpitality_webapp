import { describe, expect, it } from 'vitest';
import { getStatusMenuActions, isClosedSession, TERMINAL_APPOINTMENT_STATUSES } from './appointment';
import { getDuplicateFaceConflict, getDuplicatePersonConflict, getStatusColor } from '@/lib/utils';
import { isOrgAdmin } from './roles';

describe('status menu', () => {
  it('offers End session instead of a bare Completed for an open session', () => {
    expect(getStatusMenuActions('arrived')).toEqual(['end-session', 'cancelled', 'no-show']);
    expect(getStatusMenuActions('scheduled')).toEqual(['confirmed', 'end-session', 'cancelled', 'no-show']);
  });

  it('lets only an admin reopen a closed session', () => {
    for (const closed of ['completed', 'incomplete']) {
      expect(getStatusMenuActions(closed)).toEqual([]);
      expect(getStatusMenuActions(closed, true)).toEqual(['reopen']);
    }
  });

  it('offers nothing on a cancelled or missed appointment, admin or not', () => {
    expect(getStatusMenuActions('cancelled', true)).toEqual([]);
    expect(getStatusMenuActions('no-show', true)).toEqual([]);
  });

  it('treats incomplete as closed and terminal', () => {
    expect(isClosedSession('incomplete')).toBe(true);
    expect(isClosedSession('arrived')).toBe(false);
    expect(TERMINAL_APPOINTMENT_STATUSES.has('incomplete')).toBe(true);
  });
});

describe('roles', () => {
  it('company admin and above are org admins; desk roles are not', () => {
    for (const role of ['super_admin', 'reseller', 'company_admin']) expect(isOrgAdmin(role)).toBe(true);
    for (const role of ['staff', 'receptionist', 'doctor', 'nurse', undefined]) expect(isOrgAdmin(role)).toBe(false);
  });
});

describe('duplicate face response', () => {
  const duplicate = {
    response: {
      status: 409,
      data: {
        error: 'This face is already registered to Asha Rao.',
        code: 'DUPLICATE_FACE',
        duplicateOf: { id: 'g1', entityType: 'GUEST', name: 'Asha Rao', email: 'a@x.test', similarity: 99.2 },
        matches: [{ id: 'g1', entityType: 'GUEST', name: 'Asha Rao' }],
        canOverride: false,
      },
    },
  };

  it('is recognised with the existing record', () => {
    const conflict = getDuplicateFaceConflict(duplicate);
    expect(conflict?.duplicateOf.id).toBe('g1');
    expect(conflict?.canOverride).toBe(false);
    expect(conflict?.message).toContain('Asha Rao');
  });

  it('is not mistaken for a duplicate email, and vice versa', () => {
    expect(getDuplicatePersonConflict(duplicate)).toBeNull();
    const emailConflict = { response: { status: 409, data: { id: 'g2', error: 'Conflict: A guest with this email already exists.' } } };
    expect(getDuplicateFaceConflict(emailConflict)).toBeNull();
    expect(getDuplicatePersonConflict(emailConflict)?.id).toBe('g2');
  });

  it('ignores anything that is not a 409', () => {
    expect(getDuplicateFaceConflict({ response: { status: 400, data: { code: 'DUPLICATE_FACE' } } })).toBeNull();
    expect(getDuplicateFaceConflict(new Error('network'))).toBeNull();
  });
});

describe('new badge tones', () => {
  it('gives incomplete and waived their own tones rather than the neutral fallback', () => {
    expect(getStatusColor('incomplete')).toContain('amber');
    expect(getStatusColor('waived')).toBe(getStatusColor('inactive'));
  });
});
