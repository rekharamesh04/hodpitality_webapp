import { describe, expect, it } from 'vitest';
import { findEmailOwner } from './email-owner';
import type { Company, Reseller } from '@/types';

const companies = [
  { id: 'c1', name: 'City Hospital', email: 'manikantavanapalli18@gmail.com', industry: 'healthcare' },
] as Company[];
const resellers = [{ id: 'r1', name: 'MedPartners', email: 'priya@medpartners.test' }] as Reseller[];

describe('finding who already uses an email', () => {
  it('names the organisation and its industry, ignoring case and spaces', () => {
    expect(findEmailOwner(' ManikantaVanapalli18@Gmail.com ', { companies })).toBe('City Hospital (Healthcare)');
  });

  it('checks resellers too', () => {
    expect(findEmailOwner('priya@medpartners.test', { companies, resellers })).toBe('the reseller MedPartners');
  });

  it('lets a record keep its own email, and a new email through', () => {
    expect(findEmailOwner('manikantavanapalli18@gmail.com', { companies, exceptId: 'c1' })).toBeNull();
    expect(findEmailOwner('owner@careplus.test', { companies, resellers })).toBeNull();
    expect(findEmailOwner('', { companies })).toBeNull();
  });
});
