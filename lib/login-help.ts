import type { LoginStatus } from '@/services/login-help.service';

type Tone = 'success' | 'warning' | 'muted' | 'destructive';

/** How a sign-in's state reads to an administrator, and what they can do about it. */
export function describeLogin(login: Pick<LoginStatus, 'status' | 'mfaEnabled' | 'tempPasswordDays'>): {
  label: string;
  tone: Tone;
  help: string;
  canResend: boolean;
  canResetMfa: boolean;
} {
  switch (login.status) {
    case 'invited':
      return {
        label: 'Invited — password not set yet',
        tone: 'warning',
        help: `They have not signed in yet. The temporary password in their invitation works for ${login.tempPasswordDays} days; `
          + 'if it was lost or has expired, send a new invitation.',
        canResend: true,
        canResetMfa: false,
      };
    case 'disabled':
      return {
        label: 'Switched off',
        tone: 'destructive',
        help: 'This sign-in was removed. Add the person again to give them access.',
        canResend: false,
        canResetMfa: false,
      };
    case 'reset_required':
      return {
        label: 'Password reset needed',
        tone: 'warning',
        help: 'They need to use "Forgot password" on the sign-in page.',
        canResend: false,
        canResetMfa: login.mfaEnabled,
      };
    default:
      return {
        label: 'Active',
        tone: 'success',
        help: login.mfaEnabled
          ? 'Signs in with a password and an authenticator code. If they lost their phone, reset the authenticator.'
          : 'Signs in with a password only. They can turn on an authenticator in Settings → Security.',
        canResend: false,
        canResetMfa: login.mfaEnabled,
      };
  }
}
