'use client';

import { useEffect, useState } from 'react';
import { Download, GraduationCap, Mail, Ban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { SchoolNoteDialog } from '@/components/school-notes/SchoolNoteDialog';
import { useGuest } from '@/hooks/use-guests';
import {
  RECIPIENT_LABEL, useDownloadSchoolNote, useSchoolNotes, useSendSchoolNote, useVoidSchoolNote,
} from '@/hooks/useSchoolNotes';
import { usePermissions } from '@/hooks';
import { schoolConsentState, time12h } from '@/constants/family';
import { formatDate, toLocalDateInput } from '@/lib/utils';
import type { SchoolNote, SchoolNoteRecipient } from '@/services/school-note.service';
import type { Appointment, Guest } from '@/types';

const day = (value?: string) => (value ? formatDate(`${value}T12:00:00`) : '—');

/**
 * A patient's school excuse notes: download, email again, and (administrators) void.
 *
 * With `appointment`, only that visit's notes are listed and a new one is written for it — the
 * consultation room. Without, every note for the person — their record page.
 */
export function SchoolNotesCard({
  personId, guest, appointment, compact = false,
}: {
  personId: string;
  guest?: Guest | null;
  appointment?: Appointment | null;
  /** Inside another card (the consultation room): no card chrome of its own. */
  compact?: boolean;
}) {
  const { canPrescribe } = usePermissions();
  const filters = appointment ? { appointmentId: appointment.id } : { personId };
  const { data: notes, isLoading } = useSchoolNotes(filters, { enabled: !!personId });
  // The record decides who a note can go to; the patient page already has it, the consultation room does not.
  const { data: fetched } = useGuest(guest ? '' : personId);
  const person = guest ?? fetched ?? null;
  const [issueOpen, setIssueOpen] = useState(false);
  const [voiding, setVoiding] = useState<SchoolNote | null>(null);

  const list = notes ?? [];
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" /> School excuse notes
      </p>
      {canPrescribe && (
        <Button size="sm" variant={list.length ? 'outline' : 'default'} onClick={() => setIssueOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> {appointment ? 'Write school note' : 'New school note'}
        </Button>
      )}
    </div>
  );

  const body = isLoading ? (
    <Skeleton className="h-12 w-full" />
  ) : list.length === 0 ? (
    <p className="text-sm text-muted-foreground">
      {appointment ? 'None for this visit.' : 'No school notes yet.'}
      {!canPrescribe && ' A doctor writes them in the consultation room.'}
    </p>
  ) : (
    <ul className="space-y-2">
      {list.map((note) => (
        <NoteRow key={note.id} note={note} person={person} onVoid={() => setVoiding(note)} />
      ))}
    </ul>
  );

  return (
    <>
      {compact ? (
        <section className="space-y-2 rounded-lg border p-3">{header}{body}</section>
      ) : (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{header}</CardTitle></CardHeader>
          <CardContent>{body}</CardContent>
        </Card>
      )}

      <SchoolNoteDialog open={issueOpen} onOpenChange={setIssueOpen} personId={personId} appointment={appointment} />
      <VoidDialog note={voiding} onClose={() => setVoiding(null)} />
    </>
  );
}

function NoteRow({ note, person, onVoid }: { note: SchoolNote; person: Guest | null; onVoid: () => void }) {
  const { isAdmin } = usePermissions();
  const send = useSendSchoolNote();
  const download = useDownloadSchoolNote();
  const isVoid = note.status === 'void';
  const today = toLocalDateInput();
  const school = schoolConsentState(person, today);
  const times = [time12h(note.timeIn), time12h(note.timeOut)].filter(Boolean).join(' – ');
  const delivered = (note.deliveries ?? []).filter((d) => d.ok);
  const lastFailed = [...(note.deliveries ?? [])].reverse().find((d) => !d.ok);

  const why: Record<SchoolNoteRecipient, string> = {
    guardian: !person ? 'Loading…' : !person.guardianId ? 'No parent or guardian linked' : !person.guardian?.email ? 'Guardian has no email' : '',
    patient: !person ? 'Loading…' : !person.email ? 'No email on file' : '',
    school: !person ? 'Loading…' : school.ok ? '' : school.reason,
  };
  const label: Record<SchoolNoteRecipient, string> = {
    guardian: person?.guardian ? `${person.guardian.name} (parent or guardian)` : 'Parent or guardian',
    patient: person?.name ? `${person.name} (patient)` : 'Patient',
    school: person?.schoolName ? `${person.schoolName} (school)` : 'School',
  };

  return (
    <li className={`rounded-md border px-3 py-2 text-sm ${isVoid ? 'bg-muted/40' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-medium ${isVoid ? 'line-through decoration-muted-foreground' : ''}`}>
            Visit {day(note.visitDate)}{times ? ` · ${times}` : ''} — back {day(note.returnDate)}
          </p>
          <p className="text-xs text-muted-foreground">
            {note.doctorName || 'Doctor'} · <span className="font-mono">{note.code}</span>
            {note.restrictions ? ` · ${note.restrictions}` : ''}
          </p>
          {isVoid ? (
            <p className="text-xs font-medium text-destructive">
              Void{note.voidReason ? ` — ${note.voidReason}` : ''}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {delivered.length
                ? `Emailed to ${delivered.map((d) => d.name || RECIPIENT_LABEL[d.to]).join(', ')}`
                : 'Not emailed yet'}
              {lastFailed && !delivered.some((d) => d.to === lastFailed.to) ? ` · last email to the ${RECIPIENT_LABEL[lastFailed.to]} failed` : ''}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <Button size="sm" variant="outline" onClick={() => download.mutate(note.id)} loading={download.isPending} aria-label="Download PDF">
            {!download.isPending && <Download className="h-4 w-4" />}
          </Button>
          {!isVoid && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" loading={send.isPending}>
                  {!send.isPending && <Mail className="mr-1.5 h-4 w-4" />} Email
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Email this note to</DropdownMenuLabel>
                {(['guardian', 'patient', 'school'] as SchoolNoteRecipient[]).map((to) => (
                  <DropdownMenuItem
                    key={to}
                    disabled={!!why[to]}
                    onSelect={() => send.mutate({ id: note.id, to })}
                    className="flex-col items-start"
                  >
                    <span>{label[to]}</span>
                    {why[to] && <span className="text-xs text-muted-foreground">{why[to]}</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!isVoid && isAdmin && (
            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={onVoid} aria-label="Void this note">
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function VoidDialog({ note, onClose }: { note: SchoolNote | null; onClose: () => void }) {
  const voidNote = useVoidSchoolNote();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (note) { setReason(''); setError(null); }
  }, [note]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note) return;
    if (!reason.trim()) { setError('Say why the note is being voided.'); return; }
    voidNote.mutate({ id: note.id, reason: reason.trim() }, { onSuccess: onClose });
  }

  return (
    <Dialog open={!!note} onOpenChange={(v) => !v && !voidNote.isPending && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Void school note {note?.code}?</DialogTitle>
          <DialogDescription>
            It stays on record, can no longer be emailed, and its PDF will say VOID. If it was wrong, write a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="void-reason">Reason</Label>
            <Textarea id="void-reason" rows={2} maxLength={200} value={reason} onChange={(e) => { setReason(e.target.value); setError(null); }} placeholder="Wrong return date" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={voidNote.isPending}>Cancel</Button>
            <Button type="submit" variant="destructive" loading={voidNote.isPending}>Void note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
