import { describe, expect, it } from 'vitest';
import { describeLogin } from './login-help';

describe('describeLogin', () => {
  it('offers a new invitation only before the password is set', () => {
    expect(describeLogin({ status: 'invited', mfaEnabled: false, tempPasswordDays: 7 }).canResend).toBe(true);
    expect(describeLogin({ status: 'active', mfaEnabled: false, tempPasswordDays: 7 }).canResend).toBe(false);
    expect(describeLogin({ status: 'disabled', mfaEnabled: false, tempPasswordDays: 7 }).canResend).toBe(false);
  });

  it('offers an authenticator reset only when one is set up and the login is on', () => {
    expect(describeLogin({ status: 'active', mfaEnabled: true, tempPasswordDays: 7 }).canResetMfa).toBe(true);
    expect(describeLogin({ status: 'active', mfaEnabled: false, tempPasswordDays: 7 }).canResetMfa).toBe(false);
    expect(describeLogin({ status: 'disabled', mfaEnabled: true, tempPasswordDays: 7 }).canResetMfa).toBe(false);
  });

  it('says how long the temporary password lasts', () => {
    expect(describeLogin({ status: 'invited', mfaEnabled: false, tempPasswordDays: 7 }).help).toContain('7 days');
  });
});
