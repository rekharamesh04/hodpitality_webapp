import { describe, expect, it } from 'vitest';
import { moduleForPath } from './navigation';

describe('the module a page belongs to', () => {
  it('covers every module page and its detail pages', () => {
    expect(moduleForPath('/prescriptions')).toBe('prescriptions');
    expect(moduleForPath('/prescriptions/abc-123')).toBe('prescriptions');
    expect(moduleForPath('/pickup')).toBe('prescriptions');
    expect(moduleForPath('/treatments')).toBe('treatments');
    expect(moduleForPath('/front-desk')).toBe('frontdesk');
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
