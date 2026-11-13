'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, GraduationCap } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StaffSelect } from '@/components/common/StaffSelect';
import { useGuest } from '@/hooks/use-guests';
import { useCreateSchoolNote } from '@/hooks/useSchoolNotes';
import { usePermissions } from '@/hooks';
import { isMinor, localTimeOf, nextSchoolDay, schoolConsentState } from '@/constants/family';
import { toLocalDateInput } from '@/lib/utils';
import type { SchoolNoteRecipient } from '@/services/school-note.service';
import type { Appointment } from '@/types';

const PRESCRIBER_ROLES = ['doctor', 'practitioner'];

interface FormState {
  visitDate: string;
  timeIn: string;
  timeOut: string;
  returnDate: string;
  restrictions: string;
  restrictionsUntil: string;
  comment: string;
  doctorStaffId: string;
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function initialForm(appointment?: Appointment | null): FormState {
  const visitDate = appointment?.date || toLocalDateInput();
  const isToday = visitDate === toLocalDateInput();
  return {
    visitDate,
    timeIn: localTimeOf(appointment?.arrivedAt),
    // The note is usually written as the visit ends, so "now" is the time out — but only for today.
    timeOut: localTimeOf(appointment?.checkoutAt) || (appointment && isToday ? nowHHMM() : ''),
    returnDate: nextSchoolDay(visitDate),
    restrictions: '',
    restrictionsUntil: '',
    comment: '',
    doctorStaffId: appointment?.staffId ?? '',
  };
}

/** The same checks the API makes, so the doctor hears about a slip before pressing Issue. */
function validate(form: FormState, needsDoctor: boolean): string | null {
  const today = toLocalDateInput();
  if (!form.visitDate) return 'Enter the date of the visit.';
  if (form.visitDate > today) return 'The visit date cannot be in the future.';
  if (!form.returnDate) return 'Enter when the student may return to school.';
  if (form.returnDate < form.visitDate) return 'The return date cannot be before the visit.';
  if (form.timeIn && form.timeOut && form.timeOut < form.timeIn) return 'The time out cannot be before the time in.';
  if (form.restrictionsUntil && !form.restrictions.trim()) return 'Say what the restriction is, or clear its end date.';
  if (form.restrictionsUntil && form.restrictionsUntil < form.visitDate) return 'The restriction end date must be after the visit.';
  if (needsDoctor && !form.doctorStaffId) return 'Choose the doctor this note is issued by.';
  return null;
}

/**
 * Issue a school excuse note: confirm the visit and when the student may return. The PDF carries
 * no diagnosis. It goes to the parent or guardian, and to the school only with their permission.
 */
export function SchoolNoteDialog({
  open, onOpenChange, personId, appointment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  /** The visit the note is for. Without one, the doctor enters the date. */
  appointment?: Appointment | null;
}) {
  const { role } = usePermissions();
  const { data: person, isLoading: personLoading } = useGuest(open ? personId : '');
  const create = useCreateSchoolNote();
  const [form, setForm] = useState<FormState>(() => initialForm(appointment));
  const [recipients, setRecipients] = useState<SchoolNoteRecipient[]>([]);
  const [error, setError] = useState<string | null>(null);

  const today = toLocalDateInput();
  const school = useMemo(() => schoolConsentState(person, today), [person, today]);
  const guardianEmail = person?.guardian?.email ?? '';
  const ownEmail = person?.email ?? '';
  const minor = isMinor(person?.dateOfBirth, today);
  // A doctor's own name is used when no visit names one; anyone else must choose.
  const needsDoctor = !appointment?.staffId && !PRESCRIBER_ROLES.includes(role ?? '');

  useEffect(() => {
    if (open) {
      setForm(initialForm(appointment));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id]);

  // Who it goes to by default: the guardian when there is one with an email, else the patient.
  // The school is never ticked for the doctor: it is a choice made each time.
  useEffect(() => {
    if (!open || !person) return;
    if (guardianEmail) setRecipients(['guardian']);
    else if (ownEmail) setRecipients(['patient']);
    else setRecipients([]);
  }, [open, person, guardianEmail, ownEmail]);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Moving the visit moves the default return day with it, unless the doctor changed it.
      if (key === 'visitDate' && f.returnDate === nextSchoolDay(f.visitDate)) next.returnDate = nextSchoolDay(value);
      return next;
    });
    setError(null);
  }

  function toggle(target: SchoolNoteRecipient, on: boolean) {
    setRecipients((r) => (on ? [...r.filter((x) => x !== target), target] : r.filter((x) => x !== target)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (create.isPending) return;
    const problem = validate(form, needsDoctor);
    if (problem) { setError(problem); return; }
    // Only recipients that are available now: a tick left over from before the record changed
    // must not be sent (the API would refuse it anyway, but the doctor should not see that).
    const available: Record<SchoolNoteRecipient, boolean> = {
      guardian: !!guardianEmail, patient: !!ownEmail, school: school.ok,
    };
    const sendTo = recipients.filter((r) => available[r]);
    create.mutate({
      personId,
      appointmentId: appointment?.id || undefined,
      visitDate: form.visitDate,
      timeIn: form.timeIn || undefined,
      timeOut: form.timeOut || undefined,
      returnDate: form.returnDate,
      restrictions: form.restrictions.trim() || undefined,
      restrictionsUntil: form.restrictionsUntil || undefined,
      comment: form.comment.trim() || undefined,
      doctorStaffId: (!appointment?.staffId && form.doctorStaffId) ? form.doctorStaffId : undefined,
      sendTo,
    }, { onSuccess: () => onOpenChange(false) });
  }

  const name = person?.name || appointment?.customerName || appointment?.guestName || 'this patient';

  return (
    <Dialog open={open} onOpenChange={(v) => !create.isPending && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" /> School excuse note
          </DialogTitle>
          <DialogDescription>
            Confirms that {name} was seen here and when they may return to school. It does not include a diagnosis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="sn-visit">Date of visit</Label>
              <Input
                id="sn-visit" type="date" max={today} value={form.visitDate}
                onChange={(e) => set('visitDate', e.target.value)}
                disabled={!!appointment?.date}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sn-in">Time in</Label>
              <Input id="sn-in" type="time" value={form.timeIn} onChange={(e) => set('timeIn', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sn-out">Time out</Label>
              <Input id="sn-out" type="time" value={form.timeOut} onChange={(e) => set('timeOut', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sn-return">May return to school on</Label>
            <Input id="sn-return" type="date" min={form.visitDate} value={form.returnDate} onChange={(e) => set('returnDate', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sn-restrictions">Activity restrictions (optional)</Label>
              <Input
                id="sn-restrictions" value={form.restrictions} maxLength={300}
                onChange={(e) => set('restrictions', e.target.value)}
                placeholder="No PE or recess"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sn-until">Until</Label>
              <Input
                id="sn-until" type="date" min={form.visitDate} value={form.restrictionsUntil}
                onChange={(e) => set('restrictionsUntil', e.target.value)}
                disabled={!form.restrictions.trim()}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sn-comment">Additional note (optional)</Label>
            <Textarea
              id="sn-comment" rows={2} maxLength={600} value={form.comment}
              onChange={(e) => set('comment', e.target.value)}
              placeholder="May keep a water bottle at their desk"
            />
            <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Leave the diagnosis out unless the family asks for it — the school only needs to excuse the absence.
            </p>
          </div>

          {!appointment?.staffId && (
            <div className="space-y-1.5">
              <Label htmlFor="sn-doctor">Doctor{needsDoctor ? '' : ' (default: you)'}</Label>
              <StaffSelect id="sn-doctor" value={form.doctorStaffId} onChange={(v) => set('doctorStaffId', v)} placeholder="Choose the doctor" noun="doctor" />
            </div>
          )}

          <fieldset className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Email the note to</legend>
            {personLoading ? (
              <p className="text-xs text-muted-foreground">Loading contacts…</p>
            ) : (
              <>
                <Recipient
                  checked={recipients.includes('guardian')}
                  onChange={(on) => toggle('guardian', on)}
                  disabledReason={!person?.guardianId ? 'No parent or guardian is linked.' : !guardianEmail ? `${person.guardian?.name || 'The guardian'} has no email on file.` : ''}
                  label={person?.guardian ? `${person.guardian.name} (${guardianEmail || 'no email'})` : 'Parent or guardian'}
                />
                {(ownEmail || !minor) && (
                  <Recipient
                    checked={recipients.includes('patient')}
                    onChange={(on) => toggle('patient', on)}
                    disabledReason={!ownEmail ? 'No email on file.' : ''}
                    label={`${person?.name || 'The patient'}${ownEmail ? ` (${ownEmail})` : ''}`}
                  />
                )}
                <Recipient
                  checked={recipients.includes('school')}
                  onChange={(on) => toggle('school', on)}
                  disabledReason={school.ok ? '' : school.reason}
                  label={`The school${person?.schoolName ? ` — ${person.schoolName}` : ''}${person?.schoolEmail ? ` (${person.schoolEmail})` : ''}`}
                />
                {recipients.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nobody ticked: the note is issued and can be downloaded or printed.</p>
                )}
              </>
            )}
          </fieldset>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={create.isPending}>Cancel</Button>
            <Button type="submit" loading={create.isPending} disabled={personLoading}>
              {recipients.length ? 'Issue & email' : 'Issue note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Recipient({
  checked, onChange, disabledReason, label,
}: { checked: boolean; onChange: (on: boolean) => void; disabledReason: string; label: string }) {
  const disabled = !!disabledReason;
  return (
    <label className={`flex items-start gap-2 text-sm ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
      <Checkbox
        checked={checked && !disabled}
        disabled={disabled}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <span className="min-w-0">
        <span className="break-words">{label}</span>
        {disabledReason && <span className="block text-xs text-muted-foreground">{disabledReason}</span>}
      </span>
    </label>
  );
}
