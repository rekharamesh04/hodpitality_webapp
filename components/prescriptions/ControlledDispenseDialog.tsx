'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmIdentity, hasProof } from '@/components/auth/ConfirmIdentity';
import type { Reauth } from '@/services/auth.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { prescriptionService } from '@/services/prescription.service';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { ControlledIdCheck } from '@/types/prescription';

const ID_TYPES: { value: ControlledIdCheck['idType']; label: string }[] = [
  { value: 'drivers_license', label: "Driver's license" },
  { value: 'state_id', label: 'State ID card' },
  { value: 'passport', label: 'Passport' },
  { value: 'military_id', label: 'Military ID' },
  { value: 'known_patient', label: 'Known to staff (no ID shown)' },
  { value: 'other', label: 'Other photo ID' },
];

const RELATIONSHIPS = [
  { value: 'self', label: 'The patient' },
  { value: 'parent_guardian', label: 'Parent or guardian' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'family', label: 'Family member' },
  { value: 'other', label: 'Other' },
];

/**
 * The two-factor sign-off for handing over controlled medicines (DEA schedules II–V).
 *
 * The person at the counter confirms with their own password AND the 6-digit code from their
 * authenticator app, and records the ID the collector showed. The backend checks both factors
 * with Cognito there and then and returns a sign-off id; `onSigned` completes each controlled
 * prescription with it. Only the last 4 characters of the ID number are sent or kept.
 */
export function ControlledDispenseDialog({
  open, onOpenChange, lines, defaultCollector, onSigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: { name: string; schedule: string }[];
  defaultCollector?: string;
  /** Called with the sign-off id; the dialog closes once it resolves. */
  onSigned: (signoffId: string) => void | Promise<void>;
}) {
  const [proof, setProof] = useState<Reauth | null>(null);
  const [code, setCode] = useState('');
  const [idType, setIdType] = useState<ControlledIdCheck['idType'] | ''>('');
  const [idLast4, setIdLast4] = useState('');
  const [collector, setCollector] = useState('');
  const [relationship, setRelationship] = useState('self');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; needsMfa?: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;
    setProof(null); setCode(''); setIdType(''); setIdLast4('');
    setCollector(defaultCollector ?? ''); setRelationship('self'); setError(null);
  }, [open, defaultCollector]);

  const needsNumber = idType !== '' && idType !== 'known_patient';
  const ready = hasProof(proof) && /^\d{6}$/.test(code) && !!idType && !!collector.trim()
    && (!needsNumber || idLast4.replace(/[^A-Za-z0-9]/g, '').length >= 2);

  async function submit() {
    if (!ready || !idType || !hasProof(proof)) return;
    setBusy(true);
    setError(null);
    try {
      const who = 'currentPassword' in proof
        ? { password: proof.currentPassword }
        : { ssoProvider: proof.ssoProvider, ssoToken: proof.ssoToken };
      const { signoffId } = await prescriptionService.createControlledSignoff({
        ...who, mfaCode: code, idType, idLast4: idLast4.trim(), collectorName: collector.trim(),
        collectorRelationship: relationship,
      });
      await onSigned(signoffId);
      onOpenChange(false);
    } catch (err: any) {
      const apiCode = err?.response?.data?.code;
      setError({
        message: err?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not confirm the hand-over.'),
        needsMfa: apiCode === 'MFA_REQUIRED_FOR_CONTROLLED',
      });
      if (apiCode === 'MFA_CODE_INVALID') setCode('');
    } finally {
      // Never keep a password or a sign-in token around after an attempt.
      setProof(null);
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" /> Controlled medicine hand-over
          </DialogTitle>
          <DialogDescription>
            Confirm it is you (your password, or Google if that is how you sign in) and your authenticator code, and
            record the ID of the person collecting.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
          {lines.map((l, i) => (
            <li key={`${l.name}-${i}`} className="flex justify-between gap-3">
              <span className="font-medium">{l.name}</span>
              {l.schedule && <span className="text-muted-foreground">Schedule {l.schedule}</span>}
            </li>
          ))}
        </ul>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cd-collector">Collected by</Label>
              <Input id="cd-collector" value={collector} onChange={(e) => setCollector(e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd-relationship">Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger id="cd-relationship"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd-idtype">ID shown</Label>
              <Select value={idType} onValueChange={(v) => setIdType(v as ControlledIdCheck['idType'])}>
                <SelectTrigger id="cd-idtype"><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {ID_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd-last4">Last 4 of ID number</Label>
              <Input id="cd-last4" value={idLast4} maxLength={4} disabled={!needsNumber}
                onChange={(e) => setIdLast4(e.target.value)} autoComplete="off" />
            </div>
          </div>

          <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <ConfirmIdentity id="cd-password" value={proof} onChange={setProof} disabled={busy} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd-code">Authenticator code</Label>
              <Input id="cd-code" inputMode="numeric" maxLength={6} placeholder="123456" value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" />
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              <div>
                <p>{error.message}</p>
                {error.needsMfa && (
                  <Link href="/settings?tab=security" className="font-medium text-primary underline">Turn on two-factor authentication</Link>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" loading={busy} disabled={!ready}>Confirm and hand over</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
