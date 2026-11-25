/**
 * Small, pure helpers for the clinic-sites part of Settings → Approved networks.
 * Kept out of the component so they can be tested on their own.
 */

/** US-first: feet up to about 1/5 mile, then miles; metric in brackets. Matches the server's wording. */
export function describeDistance(metres: number): string {
  const m = Math.max(0, metres);
  if (m < 320) return `${Math.round((m * 3.28084) / 10) * 10} ft (${Math.round(m)} m)`;
  return `${(m / 1609.344).toFixed(1)} miles (${(m / 1000).toFixed(1)} km)`;
}

/** The radius choices offered for a clinic, in metres. */
export const RADIUS_CHOICES = [100, 150, 200, 300, 500, 1000, 2000, 5000];

export function radiusLabel(metres: number): string {
  if (metres < 500) return `${metres} m (${Math.round((metres * 3.28084) / 10) * 10} ft)`;
  const km = metres >= 1000 ? `${metres / 1000} km` : `${metres} m`;
  return `${km} (${(metres / 1609.344).toFixed(1)} mi)`;
}

/**
 * A position pasted from a map, e.g. "29.7420, -95.3780" (Google Maps: right-click the
 * building and click the numbers to copy them). Null when it is not one.
 */
export function parseCoordinates(text: string): { lat: number; lng: number } | null {
  const match = text.trim().match(/^\(?\s*(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*\)?$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 };
}

/** A new site's id, in the form the server keeps ("s-" and 8 hex digits). */
export function newSiteId(): string {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  return `s-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/** Why a sign-in was refused, in a few words, for the "Recently refused" list. */
export function refusalReasonText(reason: string | undefined, site?: string, distance?: number | null): string {
  switch (reason) {
    case 'location_far':
      return distance != null
        ? `Not at a clinic — ${describeDistance(distance)} from ${site || 'the nearest clinic'}`
        : 'Not at a clinic';
    case 'location_imprecise':
      return 'Device could not tell precisely where it was';
    case 'location_denied':
      return 'Location blocked in the browser';
    case 'location_timeout':
    case 'location_unavailable':
      return 'Device could not find its location';
    case 'location_unsupported':
      return 'Browser cannot share its location';
    default:
      return 'Not on an approved network';
  }
}

/** Refusals by location cannot be fixed by allowing the address (it is usually a phone's). */
export function isLocationRefusal(reason: string | undefined): boolean {
  return (reason ?? '').startsWith('location');
}

// ── Network entries (addresses, ranges and dynamic-DNS names) ─────────────────

interface NetworkEntry {
  cidr?: string;
  host?: string;
  label: string;
}

/** Digits, dots and a slash, or a colon (IPv6): an address or range. Anything else is a hostname. */
export function looksLikeAddress(value: string): boolean {
  const v = value.trim();
  return /^[0-9./]+$/.test(v) || (v.includes(':') && !v.includes('://'));
}

/** The address/range or hostname an entry stands for. */
export function keyOf(n: { cidr?: string; host?: string }): string {
  return n.cidr ?? n.host ?? '';
}

/** "203.0.113.7" and "203.0.113.7/32" are the same entry; hostnames ignore case. */
export function sameNetwork(a: string, b: string): boolean {
  const norm = (x: string) => {
    const v = x.trim().toLowerCase();
    if (!looksLikeAddress(v)) return v.replace(/\.$/, '');
    return v.includes('/') ? v : `${v}/${v.includes(':') ? 128 : 32}`;
  };
  return norm(a) === norm(b);
}

export function entryFor(value: string, label: string): NetworkEntry {
  const v = value.trim();
  return looksLikeAddress(v) ? { cidr: v, label } : { host: v, label };
}
