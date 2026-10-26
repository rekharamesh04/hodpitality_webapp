'use client';

import { useState } from 'react';
import { Copy, ShieldCheck, ShieldOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useDisableMfa, useMfaStatus, useSetupMfa, useVerifyMfa } from '@/hooks/useSettings';
import { getFriendlyErrorMessage } from '@/lib/utils';
import { popup } from '@/lib/popup';

type Step = 'idle' | 'password' | 'scan' | 'disable';

function errorText(err: unknown, fallback: string): string {
  return (err as { backendMessage?: string } | null)?.backendMessage ?? getFriendlyErrorMessage(err, fallback);
}

/**
 * Two-factor sign-in with an authenticator app (Google Authenticator, Microsoft Authenticator,
 * 1Password…). Turning it on or off asks for the password again; turning it off also asks for a
 * current code, so someone at an unlocked screen cannot remove it.
 */
export function TwoFactorCard() {
  const status = useMfaStatus();
  const setup = useSetupMfa();
  const verify = useVerifyMfa();
  const disable = useDisableMfa();

  const [step, setStep] = useState<Step>('idle');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState<{ secretCode: string; otpauthUrl: string } | null>(null);
  const [error, setError] = useState('');

  const enabled = !!status.data?.mfaEnabled;

  function reset() {
    setStep('idle');
    setPassword('');
    setCode('');
    setSecret(null);
    setError('');
  }

  function start() {
    setError('');
    setup.mutate(password, {
      onSuccess: (res) => { setSecret(res); setStep('scan'); },
      onError: (err) => setError(errorText(err, 'Could not start two-factor setup.')),
    });
  }

  function confirm() {
    setError('');
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from the app.');
    verify.mutate({ currentPassword: password, code }, {
      onSuccess: reset,
      onError: (err) => setError(errorText(err, 'That code was not accepted.')),
    });
  }

  function turnOff() {
    setError('');
    if (!password) return setError('Enter your password.');
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from the app.');
    disable.mutate({ currentPassword: password, code }, {
      onSuccess: reset,
      onError: (err) => setError(errorText(err, 'Could not turn off two-factor authentication.')),
    });
  }

  async function copySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret.secretCode);
      popup.success('Setup key copied');
    } catch {
      popup.error('Could not copy — select the key and copy it instead.');
    }
  }

  const codeInput = (
    <div className="space-y-2">
      <Label htmlFor="mfa-code">Code from the app</Label>
      <Input
        id="mfa-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        className="max-w-[10rem] tracking-[0.3em]"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />
    </div>
  );

  const passwordInput = (
    <div className="space-y-2">
      <Label htmlFor="mfa-password">Current password</Label>
      <PasswordInput
        id="mfa-password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Two-factor authentication</CardTitle>
          {!status.isLoading && !status.isError && (
            <Badge variant={enabled ? 'default' : 'outline'}>{enabled ? 'On' : 'Off'}</Badge>
          )}
        </div>
        <CardDescription>
          Ask for a code from an authenticator app on your phone each time you sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.isError && (
          <p className="text-sm text-destructive">{errorText(status.error, 'Could not read your two-factor setting.')}</p>
        )}

        {step === 'idle' && !status.isLoading && !status.isError && (
          enabled ? (
            <Button variant="outline" onClick={() => setStep('disable')}>
              <ShieldOff className="mr-2 h-4 w-4" /> Turn off
            </Button>
          ) : (
            <Button onClick={() => setStep('password')}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Turn on
            </Button>
          )
        )}

        {step === 'password' && (
          <>
            {passwordInput}
            <div className="flex gap-2">
              <Button onClick={start} loading={setup.isPending} disabled={!password}>Continue</Button>
              <Button variant="ghost" onClick={reset} disabled={setup.isPending}>Cancel</Button>
            </div>
          </>
        )}

        {step === 'scan' && secret && (
          <>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>
                In your authenticator app, add an account and choose <span className="font-medium text-foreground">Enter a setup key</span>
                {' '}— or, on this phone, <a href={secret.otpauthUrl} className="text-primary underline">open it in the app</a>.
              </li>
              <li>Enter the key below, set as time-based.</li>
              <li>Type the 6-digit code the app shows.</li>
            </ol>
            <div className="flex flex-wrap items-center gap-2">
              <code className="break-all rounded-md border bg-muted px-3 py-2 font-mono text-sm">{secret.secretCode}</code>
              <Button size="sm" variant="outline" onClick={copySecret} aria-label="Copy setup key">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {codeInput}
            <div className="flex gap-2">
              <Button onClick={confirm} loading={verify.isPending}>Turn on</Button>
              <Button variant="ghost" onClick={reset} disabled={verify.isPending}>Cancel</Button>
            </div>
          </>
        )}

        {step === 'disable' && (
          <>
            {passwordInput}
            {codeInput}
            <div className="flex gap-2">
              <Button variant="destructive" onClick={turnOff} loading={disable.isPending}>Turn off</Button>
              <Button variant="ghost" onClick={reset} disabled={disable.isPending}>Cancel</Button>
            </div>
          </>
        )}

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
