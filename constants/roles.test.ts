import { describe, expect, it } from 'vitest';
import { DESK_ROLES, canPrescribe, isOrgAdmin } from './roles';
import { getVisibleNavSections } from './navigation';
import { writtenHere } from '@/types/prescription';
import { getFriendlyErrorMessage } from '@/lib/utils';

describe('who may do what', () => {
  it('keeps deleting, refunding and exporting with administrators', () => {
    expect(['super_admin', 'reseller', 'company_admin'].every(isOrgAdmin)).toBe(true);
    expect(DESK_ROLES.some(isOrgAdmin)).toBe(false);
  });

  it('lets prescribers and administrators prescribe, and no one else at the desk', () => {
    expect(canPrescribe('doctor')).toBe(true);
    expect(canPrescribe('practitioner')).toBe(true);
    expect(canPrescribe('company_admin')).toBe(true);
    for (const role of ['staff', 'receptionist', 'nurse', 'assistant']) expect(canPrescribe(role)).toBe(false);
  });

  it('treats only an in-house prescriber’s prescription as theirs to change', () => {
    expect(writtenHere({ staffId: 's1' })).toBe(true);
    expect(writtenHere({ staffId: '', externalPrescriber: true })).toBe(false);
    // A pharmacy's copy of a prescription sent to it.
    expect(writtenHere({ staffId: 's1', externalPrescriber: true })).toBe(false);
  });

  it('shows Analytics to a company admin, not to the desk', () => {
    const labels = (role: string) =>
      getVisibleNavSections(role, 'healthcare').flatMap((s) => s.items.map((i) => i.href));
    expect(labels('company_admin')).toContain('/analytics');
    expect(labels('receptionist')).not.toContain('/analytics');
  });
});

describe('error messages', () => {
  it('passes on a refusal the backend wrote for people', () => {
    const err = { response: { status: 403, data: { code: 'ADMIN_ONLY', error: 'Only administrators can refund payments.' } } };
    expect(getFriendlyErrorMessage(err)).toBe('Only administrators can refund payments.');
  });

  it('keeps the generic line for an uncoded error', () => {
    const err = { response: { status: 403, data: { error: 'Forbidden' } } };
    expect(getFriendlyErrorMessage(err)).toBe("You don't have permission to view this data.");
  });
});
