import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emailFromIdToken, forgetRememberedBrowser, rememberedBrowserFor, saveRememberedBrowser } from './remembered-browser';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => { data.delete(k); },
    setItem: (k, v) => { data.set(k, String(v)); },
  };
}

const device = { key: 'us-east-2_1a2b3c4d-0000-1111-2222-333344445555', groupKey: '-abcDEF12', secret: 'c2VjcmV0LXNlY3JldC1zZWNyZXQtc2VjcmV0' };

beforeEach(() => { vi.stubGlobal('window', { localStorage: memoryStorage() }); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('remembered browsers', () => {
  it('are kept per person, whatever the case of the email', () => {
    saveRememberedBrowser('Desk@Clinic.com', { ...device, name: 'Chrome on macOS', days: 30 });
    expect(rememberedBrowserFor('desk@clinic.com')).toEqual(device);
    expect(rememberedBrowserFor('nurse@clinic.com')).toBeUndefined();
  });

  it('let two people on one shared computer be remembered separately', () => {
    saveRememberedBrowser('a@clinic.com', device);
    saveRememberedBrowser('b@clinic.com', { ...device, key: 'us-east-2_other' });
    forgetRememberedBrowser('a@clinic.com');
    expect(rememberedBrowserFor('a@clinic.com')).toBeUndefined();
    expect(rememberedBrowserFor('b@clinic.com')?.key).toBe('us-east-2_other');
  });

  it('ignore anything malformed', () => {
    saveRememberedBrowser('a@clinic.com', { key: 'has spaces', groupKey: 'g', secret: 'short' });
    expect(rememberedBrowserFor('a@clinic.com')).toBeUndefined();
    window.localStorage.setItem('entryflow_remembered_browsers', '{broken');
    expect(rememberedBrowserFor('a@clinic.com')).toBeUndefined();
  });

  it('nothing to send without an email', () => {
    expect(rememberedBrowserFor('')).toBeUndefined();
    expect(rememberedBrowserFor(undefined)).toBeUndefined();
  });
});

describe('emailFromIdToken', () => {
  const token = (payload: object) => `h.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.s`;
  it('reads Google and Microsoft tokens', () => {
    vi.stubGlobal('atob', (s: string) => Buffer.from(s, 'base64').toString('binary'));
    expect(emailFromIdToken(token({ email: 'Desk@Clinic.com' }))).toBe('desk@clinic.com');
    expect(emailFromIdToken(token({ preferred_username: 'dr@clinic.com' }))).toBe('dr@clinic.com');
    expect(emailFromIdToken('garbage')).toBe('');
  });
});
