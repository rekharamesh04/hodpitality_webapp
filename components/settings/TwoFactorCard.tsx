'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
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
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');

  const enabled = !!status.data?.mfaEnabled;

  // The QR code is drawn here in the browser. The setup key must never be sent to an outside
  // QR service: anyone holding it can generate this person's sign-in codes.
  useEffect(() => {
    if (!secret?.otpauthUrl) { setQr(''); return; }
    let live = true;
    QRCode.toDataURL(secret.otpauthUrl, { errorCorrectionLevel: 'M', margin: 2, width: 220 })
      .then((url) => { if (live) setQr(url); })
      .catch(() => { if (live) setQr(''); });
    return () => { live = false; };
  }, [secret]);

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
          Ask for a code from an authenticator app on your phone each time you sign in. Required to hand
          over controlled medicines.
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
                Open <span className="font-medium text-foreground">Microsoft Authenticator</span> or{' '}
                <span className="font-medium text-foreground">Google Authenticator</span> on your phone and tap{' '}
                <span className="font-medium text-foreground">+</span>. In Microsoft Authenticator choose{' '}
                <span className="font-medium text-foreground">Other account (Google, Facebook, etc.)</span>.
              </li>
              <li>Scan this QR code with the phone.</li>
              <li>Type the 6-digit code the app shows for EntryFlow.</li>
            </ol>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {qr ? (
                // A data URL drawn locally; next/image adds nothing for it.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} width={220} height={220} alt="QR code to add EntryFlow to your authenticator app"
                  className="rounded-lg border bg-white p-1" />
              ) : (
                <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg border text-xs text-muted-foreground">
                  Preparing QR code…
                </div>
              )}
              <p className="max-w-xs text-xs text-muted-foreground">
                Keep this private: anyone who scans it can make your sign-in codes. Setting up on this phone?{' '}
                <a href={secret.otpauthUrl} className="text-primary underline">Open it in the app</a> instead.
              </p>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">Can&rsquo;t scan? Enter a setup key instead</summary>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="break-all rounded-md border bg-muted px-3 py-2 font-mono text-sm">{secret.secretCode}</code>
                <Button size="sm" variant="outline" onClick={copySecret} aria-label="Copy setup key">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Choose &ldquo;Enter code manually&rdquo; in the app, paste the key, and set it as time-based.</p>
            </details>
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
