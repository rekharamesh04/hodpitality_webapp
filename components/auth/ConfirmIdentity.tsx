'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import type { Reauth } from '@/services/auth.service';

const GOOGLE_ON = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * "Confirm it's you" for a sensitive step: the person's password, or — for people who
 * sign in with Google and so have no password of their own — a fresh Google sign-in.
 * The backend checks either one the same way (see _reauth_access_token).
 *
 * Controlled: `value` is the proof so far (null until there is one), `onChange` gets
 * a new proof or null.
 */
export function ConfirmIdentity({
  id, value, onChange, disabled,
}: {
  id: string;
  value: Reauth | null;
  onChange: (proof: Reauth | null) => void;
  disabled?: boolean;
}) {
  const sso = value && 'ssoProvider' in value ? value : null;
  const password = value && 'currentPassword' in value ? value.currentPassword : '';

  if (sso) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
        <span>Confirmed with {sso.ssoProvider === 'google' ? 'Google' : 'Microsoft'}</span>
        <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={() => onChange(null)} disabled={disabled}>
          Use my password instead
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={id}>Your password</Label>
        <PasswordInput
          id={id}
          autoComplete="current-password"
          value={password}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value ? { currentPassword: e.target.value } : null)}
        />
      </div>
      {GOOGLE_ON && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Sign in with Google instead of a password? Confirm with Google:</p>
          <GoogleSignInButton
            text="continue_with"
            disabled={disabled}
            onCredential={(token) => onChange({ ssoProvider: 'google', ssoToken: token })}
          />
        </div>
      )}
    </div>
  );
}

/** True when there is something to send: a non-empty password or a Google/Microsoft token. */
export function hasProof(proof: Reauth | null): proof is Reauth {
  if (!proof) return false;
  return 'ssoToken' in proof ? !!proof.ssoToken : !!proof.currentPassword;
}
