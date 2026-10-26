import { describe, expect, it } from 'vitest';
import { getVisibleNavSections, isPlatformModePath, moduleForPath } from './navigation';
import { INDUSTRY_SLUGS } from './industry';

describe('the module a page belongs to', () => {
  it('covers every module page and its detail pages', () => {
    expect(moduleForPath('/prescriptions')).toBe('prescriptions');
    expect(moduleForPath('/prescriptions/abc-123')).toBe('prescriptions');
    expect(moduleForPath('/pickup')).toBe('prescriptions');
    expect(moduleForPath('/treatments')).toBe('treatments');
    expect(moduleForPath('/front-desk')).toBe('frontdesk');
    expect(moduleForPath('/opd')).toBe('opd');
    expect(moduleForPath('/kiosk')).toBe('opd');
    expect(moduleForPath('/events/42')).toBe('events');
    expect(moduleForPath('/registrations')).toBe('registrations');
    expect(moduleForPath('/payments')).toBe('payments');
    expect(moduleForPath('/calendar')).toBe('appointments');
    expect(moduleForPath('/hospitality/7')).toBe('hospitality');
  });

  it('is nothing for pages every industry has', () => {
    for (const path of ['/dashboard', '/guests', '/guests/1', '/customers', '/staff', '/check-ins', '/venues', '/settings', '/companies']) {
      expect(moduleForPath(path), path).toBeUndefined();
    }
  });

  it('does not match a route that merely shares a prefix', () => {
    expect(moduleForPath('/eventsfoo')).toBeUndefined();
  });
});

describe('the platform navigation', () => {
  const hrefs = (role: string, industry: string) =>
    getVisibleNavSections(role, industry, { platformMode: true }).flatMap((s) => s.items.map((i) => i.href));

  it('offers no daily-work screen, in any industry', () => {
    for (const industry of INDUSTRY_SLUGS) {
      for (const href of hrefs('super_admin', industry)) expect(isPlatformModePath(href)).toBe(true);
      expect(hrefs('super_admin', industry)).not.toContain('/check-ins');
    }
  });

  it('is the same for every industry, so adding one never changes it', () => {
    const first = hrefs('super_admin', INDUSTRY_SLUGS[0]);
    for (const industry of INDUSTRY_SLUGS) expect(hrefs('super_admin', industry)).toEqual(first);
  });

  it('keeps Resellers with the super admin', () => {
    expect(hrefs('super_admin', 'healthcare')).toContain('/resellers');
    expect(hrefs('reseller', 'healthcare')).not.toContain('/resellers');
  });

  it('gives an opened hospital its own screens', () => {
    const opened = getVisibleNavSections('super_admin', 'healthcare').flatMap((s) => s.items.map((i) => i.href));
    expect(opened).toContain('/opd');
    expect(opened).not.toContain('/treatments');
  });

  it('tells platform pages from one organisation’s pages', () => {
    expect(isPlatformModePath('/companies')).toBe(true);
    expect(isPlatformModePath('/staff/abc')).toBe(true);
    expect(isPlatformModePath('/guests')).toBe(false);
    expect(isPlatformModePath('/dashboard')).toBe(false);
  });
});
