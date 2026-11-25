import { describe, expect, it } from 'vitest';
import {
  describeDistance, isLocationRefusal, newSiteId, parseCoordinates, radiusLabel, refusalReasonText, sameNetwork,
} from './clinic-sites';

describe('describeDistance', () => {
  it('reads naturally in the US, matching the server', () => {
    expect(describeDistance(120)).toBe('390 ft (120 m)');
    expect(describeDistance(3200)).toBe('2.0 miles (3.2 km)');
  });
});

describe('radiusLabel', () => {
  it('shows feet for small circles and miles for large ones', () => {
    expect(radiusLabel(200)).toBe('200 m (660 ft)');
    expect(radiusLabel(1000)).toBe('1 km (0.6 mi)');
  });
});

describe('parseCoordinates', () => {
  it('takes what Google Maps copies', () => {
    expect(parseCoordinates('29.742012, -95.378045')).toEqual({ lat: 29.742012, lng: -95.378045 });
    expect(parseCoordinates(' (29.7420,-95.3780) ')).toEqual({ lat: 29.742, lng: -95.378 });
    expect(parseCoordinates('29.7420 -95.3780')).toEqual({ lat: 29.742, lng: -95.378 });
  });
  it('refuses anything else', () => {
    for (const bad of ['', 'Midtown, Houston', '95, 200', '0, 0', '29.7']) {
      expect(parseCoordinates(bad), bad).toBeNull();
    }
  });
});

describe('newSiteId', () => {
  it('is in the form the server keeps', () => {
    expect(newSiteId()).toMatch(/^s-[0-9a-f]{8}$/);
    expect(newSiteId()).not.toBe(newSiteId());
  });
});

describe('refusals', () => {
  it('says why in a few words', () => {
    expect(refusalReasonText('location_far', 'Midtown', 3200)).toBe('Not at a clinic — 2.0 miles (3.2 km) from Midtown');
    expect(refusalReasonText('location_denied')).toBe('Location blocked in the browser');
    expect(refusalReasonText(undefined)).toBe('Not on an approved network');
  });
  it('only network refusals can be fixed by allowing the address', () => {
    expect(isLocationRefusal('location_far')).toBe(true);
    expect(isLocationRefusal('network')).toBe(false);
    expect(isLocationRefusal(undefined)).toBe(false);
  });
});

describe('sameNetwork', () => {
  it('treats an address and its /32 as one entry', () => {
    expect(sameNetwork('203.0.113.7', '203.0.113.7/32')).toBe(true);
    expect(sameNetwork('Clinic.DDNS.net.', 'clinic.ddns.net')).toBe(true);
  });
});
