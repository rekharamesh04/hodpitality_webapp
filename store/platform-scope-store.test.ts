import { describe, expect, it } from 'vitest';
import { ALL_ORGANISATIONS, sanitizeScope, scopeIndustry, scopeKey, scopeQueryParams, type PlatformScope } from './platform-scope-store';

const hospital: PlatformScope = { kind: 'company', tenantId: 'tenant-h1', name: 'City Hospital', industry: 'healthcare' };
const spas: PlatformScope = { kind: 'industry', industry: 'wellness' };

describe('the platform scope', () => {
  it('sends parameters for platform roles only', () => {
    expect(scopeQueryParams('super_admin', hospital)).toEqual({ scopeTenantId: 'tenant-h1' });
    expect(scopeQueryParams('reseller', spas)).toEqual({ scopeIndustry: 'wellness' });
    expect(scopeQueryParams('super_admin', ALL_ORGANISATIONS)).toEqual({});
    for (const role of ['company_admin', 'receptionist', 'doctor', undefined]) {
      expect(scopeQueryParams(role, hospital), String(role)).toEqual({});
    }
  });

  it('decides the vocabulary for platform roles only', () => {
    expect(scopeIndustry('super_admin', hospital)).toBe('healthcare');
    expect(scopeIndustry('super_admin', spas)).toBe('wellness');
    expect(scopeIndustry('super_admin', ALL_ORGANISATIONS)).toBeNull();
    expect(scopeIndustry('company_admin', hospital)).toBeNull();
  });

  it('keys each scope distinctly', () => {
    expect(new Set([scopeKey(hospital), scopeKey(spas), scopeKey(ALL_ORGANISATIONS)]).size).toBe(3);
  });

  it('treats anything malformed as the whole platform', () => {
    for (const bad of [null, 'x', 42, {}, { kind: 'industry', industry: 'crypto' }, { kind: 'company', industry: 'healthcare' }, { kind: 'company', tenantId: 't', industry: 'nope' }]) {
      expect(sanitizeScope(bad)).toEqual(ALL_ORGANISATIONS);
    }
    expect(sanitizeScope(hospital)).toEqual(hospital);
    expect(sanitizeScope({ ...hospital, name: 7 })).toEqual({ ...hospital, name: '' });
  });
});
