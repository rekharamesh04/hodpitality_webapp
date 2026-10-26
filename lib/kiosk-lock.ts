/**
 * The kiosk's exit PIN.
 *
 * The kiosk runs on a staff member's session, so the staff portal — every patient's record — is
 * one screen away from the public. Leaving kiosk mode therefore needs a PIN that staff set on this
 * device the first time they open the kiosk. Only a hash is stored, salted with the tenant so one
 * organisation's PIN says nothing about another's. Forgetting it costs a sign-out, never access.
 */

const STORAGE_KEY = 'entryflow_kiosk_pin';
export const KIOSK_PIN_MIN = 4;
export const KIOSK_PIN_MAX = 6;

export function isValidKioskPin(pin: string): boolean {
  return new RegExp(`^\\d{${KIOSK_PIN_MIN},${KIOSK_PIN_MAX}}$`).test(pin);
}

export async function hashKioskPin(tenant: string, pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`entryflow-kiosk:${tenant}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** The stored hash for this tenant, or null when this device has no PIN yet. */
export function readKioskPinHash(tenant: string): string | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return saved?.tenant === tenant && typeof saved.hash === 'string' ? saved.hash : null;
  } catch {
    return null;
  }
}

export async function saveKioskPin(tenant: string, pin: string): Promise<void> {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tenant, hash: await hashKioskPin(tenant, pin) }));
}

export async function kioskPinMatches(tenant: string, pin: string): Promise<boolean> {
  const saved = readKioskPinHash(tenant);
  return !!saved && saved === (await hashKioskPin(tenant, pin));
}

/** Signing out clears it, so the next person to open kiosk mode on this device sets their own. */
export function clearKioskPin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

/**
 * Whether this device is in kiosk mode.
 *
 * The PIN used to guard only the kiosk's own "Staff" button: the back button, or typing /guests in
 * the address bar, opened the full portal on a staff session in front of the waiting room. While
 * this is set, the portal's layout sends every page back to /kiosk; only the PIN (or signing out)
 * clears it. It survives a reload for the same reason.
 */
const ACTIVE_KEY = 'entryflow_kiosk_active';

export function setKioskActive(tenant: string, active: boolean): void {
  try {
    if (active) localStorage.setItem(ACTIVE_KEY, tenant);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Storage unavailable: kiosk mode cannot be held across pages on this device.
  }
}

export function isKioskActive(tenant: string): boolean {
  if (typeof window === 'undefined' || !tenant) return false;
  try {
    return localStorage.getItem(ACTIVE_KEY) === tenant && readKioskPinHash(tenant) !== null;
  } catch {
    return false;
  }
}
