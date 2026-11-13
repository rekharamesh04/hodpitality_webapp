'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, ShieldOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useUpdateGuest } from '@/hooks/use-guests';
import { ageLabel, isMinor, relationshipLabel, schoolConsentState } from '@/constants/family';
import { formatDate, toLocalDateInput } from '@/lib/utils';
import type { Guest } from '@/types';

/**
 * A patient's family and school: who their parent or guardian is (the hospital writes to them),
 * whose guardian they are, their school, and whether the parent allows notes to go straight to it.
 */
export function FamilyCard({ guestId, guest }: { guestId: string; guest: Guest }) {
  const today = toLocalDateInput();
  const update = useUpdateGuest();
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const minor = isMinor(guest.dateOfBirth, today);
  const age = ageLabel(guest.dateOfBirth, today);
  const dependants = guest.dependants ?? [];
  const consent = schoolConsentState(guest, today);
  const hasSchool = !!(guest.schoolName || guest.schoolGrade || guest.schoolEmail);
  const nothing = !guest.dateOfBirth && !guest.guardianId && dependants.length === 0 && !hasSchool;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" aria-hidden="true" /> Family &amp; school
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {nothing && (
          <p className="text-muted-foreground">
            No family or school details. For a child, add the date of birth and link the parent with Edit.
          </p>
        )}

        {guest.dateOfBirth && (
          <Row label="Date of birth">
            {formatDate(`${guest.dateOfBirth}T12:00:00`)}{age ? ` · ${age}` : ''}
            {minor && (
              <span className="ml-2 rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                Minor
              </span>
            )}
          </Row>
        )}

        {guest.guardianId && (
          <Row label={relationshipLabel(guest.guardianRelationship)}>
            {guest.guardian ? (
              <>
                <Link href={`/guests/${guest.guardian.id}`} className="font-medium text-primary hover:underline">
                  {guest.guardian.name || 'Unnamed'}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {[guest.guardian.email || 'No email on file', guest.guardian.phone].filter(Boolean).join(' · ')}
                </span>
              </>
            ) : (
              <span className="text-amber-700 dark:text-amber-400">The linked record is no longer available — link another with Edit.</span>
            )}
          </Row>
        )}

        {dependants.length > 0 && (
          <Row label="Parent or guardian of">
            <ul className="space-y-0.5">
              {dependants.map((d) => (
                <li key={d.id}>
                  <Link href={`/guests/${d.id}`} className="font-medium text-primary hover:underline">{d.name || 'Unnamed'}</Link>
                  {d.dateOfBirth && <span className="text-xs text-muted-foreground"> · {ageLabel(d.dateOfBirth, today)}</span>}
                </li>
              ))}
            </ul>
          </Row>
        )}

        {hasSchool && (
          <Row label="School" icon={GraduationCap}>
            <span className="font-medium">{guest.schoolName || 'School not named'}</span>
            {guest.schoolGrade && <span className="text-muted-foreground"> · Grade {guest.schoolGrade}</span>}
            <span className="block break-all text-xs text-muted-foreground">{guest.schoolEmail || 'No school email'}</span>
          </Row>
        )}

        {guest.schoolEmail && (
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1.5 font-medium">
              {consent.ok
                ? <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                : <ShieldOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              Send notes to the school
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {consent.ok
                ? `Allowed by ${guest.schoolShareConsentGivenBy || 'the family'}${guest.schoolShareConsentAt ? ` on ${formatDate(guest.schoolShareConsentAt)}` : ''}${guest.schoolShareConsentExpires ? `, until ${formatDate(`${guest.schoolShareConsentExpires}T12:00:00`)}` : ''}.`
                : consent.reason}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant={consent.ok ? 'outline' : 'default'} onClick={() => setPermissionOpen(true)}>
                {consent.ok ? 'Record again' : 'Record permission'}
              </Button>
              {guest.schoolShareConsent === true && (
                <Button size="sm" variant="outline" onClick={() => setWithdrawOpen(true)}>Withdraw</Button>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <SchoolPermissionDialog
        open={permissionOpen}
        onOpenChange={setPermissionOpen}
        guest={guest}
        saving={update.isPending}
        onSave={(givenBy, expires) => update.mutate(
          {
            id: guestId,
            data: { schoolShareConsent: true, schoolShareConsentGivenBy: givenBy, schoolShareConsentExpires: expires },
          },
          { onSuccess: () => setPermissionOpen(false) },
        )}
      />

      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="Withdraw permission?"
        description="Notes will no longer be emailed to the school. They can still go to the parent or guardian."
        confirmLabel="Withdraw"
        confirmingLabel="Withdrawing…"
        isConfirming={update.isPending}
        onConfirm={() => update.mutate(
          { id: guestId, data: { schoolShareConsent: false } },
          { onSuccess: () => setWithdrawOpen(false) },
        )}
      />
    </Card>
  );
}

function Row({
  label, icon: Icon, children,
}: { label: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {label}
      </p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

/**
 * Recording the parent's permission to email notes to the school. A school is not covered by
 * HIPAA, so this is written down: who agreed, for which address, and until when.
 */
function SchoolPermissionDialog({
  open, onOpenChange, guest, saving, onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Guest;
  saving: boolean;
  onSave: (givenBy: string, expires: string) => void;
}) {
  const [givenBy, setGivenBy] = useState('');
  const [expires, setExpires] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setGivenBy(guest.guardian?.name || '');
      setExpires('');
      setConfirmed(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!givenBy.trim()) { setError('Enter the name of the parent or guardian who agreed.'); return; }
    if (expires && expires < toLocalDateInput()) { setError('The end date has already passed.'); return; }
    if (!confirmed) { setError('Tick the box to confirm they agreed.'); return; }
    onSave(givenBy.trim(), expires);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Permission to send notes to the school</DialogTitle>
          <DialogDescription>
            School notes will be emailed to <span className="font-medium text-foreground">{guest.schoolEmail}</span>.
            A change of school email needs permission again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="consent-given-by">Who gave permission</Label>
            <Input id="consent-given-by" value={givenBy} onChange={(e) => setGivenBy(e.target.value)} maxLength={120} placeholder="Parent or guardian's name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="consent-expires">Valid until (optional)</Label>
            <Input id="consent-expires" type="date" min={toLocalDateInput()} value={expires} onChange={(e) => setExpires(e.target.value)} />
            <p className="text-xs text-muted-foreground">For example, the end of the school year. Empty means until withdrawn.</p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5" />
            <span>They agreed that school excuse notes for {guest.name || 'this patient'} may be emailed to the school.</span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>Save permission</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
