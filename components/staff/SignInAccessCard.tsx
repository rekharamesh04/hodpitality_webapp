'use client';

import { useState } from 'react';
import { KeyRound, MailPlus, ShieldCheck, ShieldOff, UserRoundCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmIdentity, hasProof } from '@/components/auth/ConfirmIdentity';
import { useLoginStatus, useResendInvite, useResetMfa } from '@/hooks/useLoginHelp';
import { useMfaStatus } from '@/hooks/useSettings';
import { describeLogin } from '@/lib/login-help';
import { popup } from '@/lib/popup';
import { formatDate, getFriendlyErrorMessage } from '@/lib/utils';
import type { Reauth } from '@/services/auth.service';

function errorText(err: unknown, fallback: string): string {
  return (err as { backendMessage?: string } | null)?.backendMessage ?? getFriendlyErrorMessage(err, fallback);
}

function errorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } } | null)?.response?.status;
}

/**
 * Someone else's sign-in, for an administrator: have they set their password yet, is two-factor
 * on, and the two fixes — send the invitation again, or take the authenticator off a lost phone.
 * The backend decides who may see and change whom (the staff-editing rule).
 *
 * `bare` drops the card frame, for use inside a dialog or sheet.
 */
export function SignInAccessCard({ email, bare = false }: { email: string; bare?: boolean }) {
  const login = useLoginStatus(email);
  const resend = useResendInvite();
  const [resetOpen, setResetOpen] = useState(false);

  const body = (() => {
    if (login.isLoading) {
      return <div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-full" /></div>;
    }
    if (login.isError || !login.data) {
      const notFound = errorStatus(login.error) === 404;
      return (
        <p className="text-sm text-muted-foreground">
          {notFound
            ? 'No sign-in was found for this email in your organisations.'
            : errorText(login.error, 'Could not load this sign-in. Please try again.')}
        </p>
      );
    }
    const info = login.data;
    const view = describeLogin(info);
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={view.tone}>{view.label}</Badge>
          {info.status !== 'disabled' && (
            info.mfaEnabled ? (
              <Badge variant="success"><ShieldCheck className="h-3 w-3" aria-hidden="true" /> Authenticator on</Badge>
            ) : (
              <Badge variant="muted"><ShieldOff className="h-3 w-3" aria-hidden="true" /> No authenticator</Badge>
            )
          )}
        </div>
        <p className="text-sm text-muted-foreground">{view.help}</p>
        {info.createdAt && (
          <p className="text-xs text-muted-foreground">
            Sign-in created {formatDate(info.createdAt)}
            {info.organisation ? ` · ${info.organisation}` : ''}
          </p>
        )}
        {(view.canResend || view.canResetMfa) && (
          <div className="flex flex-wrap gap-2">
            {view.canResend && (
              <Button
                size="sm"
                disabled={resend.isPending}
                onClick={() => resend.mutate(info.email, {
                  onSuccess: (res) => popup.success(res.message || 'Invitation sent.'),
                  onError: (err) => popup.error(errorText(err, 'The invitation could not be sent.')),
                })}
              >
                <MailPlus className="mr-2 h-4 w-4" />
                {resend.isPending ? 'Sending…' : 'Resend invitation'}
              </Button>
            )}
            {view.canResetMfa && (
              <Button size="sm" variant="outline" onClick={() => setResetOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Reset authenticator
              </Button>
            )}
          </div>
        )}
        <ResetAuthenticatorDialog email={info.email} open={resetOpen} onOpenChange={setResetOpen} />
      </div>
    );
  })();

  if (bare) return body;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRoundCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Sign-in access
        </CardTitle>
        <CardDescription>Invitation and two-factor status for {email}.</CardDescription>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

/** Confirm it is really the administrator, then take the authenticator off someone else's sign-in. */
function ResetAuthenticatorDialog({
  email, open, onOpenChange,
}: { email: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const ownMfa = useMfaStatus();
  const reset = useResetMfa();
  const [proof, setProof] = useState<Reauth | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const needsCode = !!ownMfa.data?.mfaEnabled;

  function close(next: boolean) {
    if (reset.isPending) return;
    if (!next) { setProof(null); setCode(''); setError(''); }
    onOpenChange(next);
  }

  function submit() {
    setError('');
    if (!hasProof(proof)) return setError('Enter your own password, or confirm with Google.');
    if (needsCode && !/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from your own authenticator app.');
    reset.mutate({ email, proof, code: needsCode ? code : '' }, {
      onSuccess: (res) => { popup.success(res.message || 'Authenticator reset.'); close(false); },
      onError: (err) => setError(errorText(err, 'The authenticator could not be reset.')),
    });
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Reset authenticator?</DialogTitle>
          <DialogDescription>
            For someone who lost or changed their phone. <strong>{email}</strong> will be signed out everywhere and can
            then sign in with just their password, and should set up the authenticator again in Settings → Security.
            They will get an email saying you did this.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Alert>
            <AlertDescription>
              Only do this after checking it is really them asking — for example by phone or in person.
            </AlertDescription>
          </Alert>
          <ConfirmIdentity id="reset-mfa-password" value={proof} onChange={setProof} disabled={reset.isPending} />
          {needsCode && (
            <div className="space-y-2">
              <Label htmlFor="reset-mfa-code">Your authenticator code</Label>
              <Input
                id="reset-mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                className="max-w-[10rem] tracking-[0.3em]"
                value={code}
                disabled={reset.isPending}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)} disabled={reset.isPending}>Cancel</Button>
          <Button variant="destructive" onClick={submit} disabled={reset.isPending}>
            {reset.isPending ? 'Resetting…' : 'Reset authenticator'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
