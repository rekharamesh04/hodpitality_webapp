'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity, AlertTriangle, CheckCircle2, Clock, CreditCard, Megaphone, NotebookPen, Pill, Stethoscope, UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { PrescriptionFormDialog } from '@/components/dialogs/PrescriptionFormDialog';
import { PriorityBadge } from '@/components/opd/PriorityPicker';
import { useAppointments } from '@/hooks/useAppointments';
import { useCallIn, useFinishConsultation, useSaveConsultNotes } from '@/hooks/useOpd';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useBillingSettings } from '@/hooks/usePharmacies';
import { useStaff } from '@/hooks/useStaff';
import { usePermissions, useTerminology } from '@/hooks';
import { useAuthStore } from '@/store';
import {
  WAIT_TONE_TEXT, assignTokens, buildLanes, visitPriorityOf, vitalsSummary, waitTone, waitingMinutes, type OpdLane,
} from '@/constants/opd';
import { visitFee } from '@/constants/kiosk';
import { cn, formatCurrency, formatDate, getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';
import type { Appointment, Guest } from '@/types';
import { medicinesOf } from '@/types/prescription';

/** A doctor's screen refreshes as often as the OPD board, so a patient checked in at the desk appears. */
const LIVE_REFRESH_MS = 15_000;
const CLINICAL_ROLES = ['doctor', 'practitioner'];

export default function ConsultationPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <ConsultationRoom />
    </Suspense>
  );
}

/**
 * The doctor's own screen: step 3 of the hospital's day, between the OPD queue and checkout.
 *
 * The OPD queue is the desk's board — check-ins, tokens, triage — with every doctor's lane on it.
 * A doctor needs one thing at a time: the patient in front of them. So this page shows exactly
 * that: "Call next" brings the next patient in (emergencies first), their allergies, vitals and
 * complaint from triage are on screen, the notes and the prescription are written right here,
 * and "Finish & call next" closes the visit (its fee stays owed, for the desk or the kiosk) and
 * brings in the next one. No hunting for a row, a detail card or a status menu.
 */
function ConsultationRoom() {
  const t = useTerminology();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { canPrescribe } = usePermissions();
  const today = toLocalDateInput();

  const { data: appointments, isLoading, isError, error, refetch } = useAppointments(
    { date: today }, { refetchInterval: LIVE_REFRESH_MS },
  );
  const { data: staff } = useStaff({ limit: 50 });
  const callIn = useCallIn();
  const finish = useFinishConsultation();
  const saveNotes = useSaveConsultNotes();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const rows = useMemo(() => appointments ?? [], [appointments]);
  const tokens = useMemo(() => assignTokens(rows), [rows]);
  const lanes = useMemo(() => buildLanes(rows, tokens).filter((l) => l.staffId), [rows, tokens]);

  // Whose room this is: ?doctor= from the OPD board, else the signed-in doctor, else the busiest lane.
  const myStaffId = useMemo(() => {
    if (!user?.email || !CLINICAL_ROLES.includes(user.role)) return '';
    return (staff ?? []).find((s) => (s.email ?? '').toLowerCase() === user.email.toLowerCase())?.id ?? '';
  }, [staff, user]);
  const [doctorId, setDoctorId] = useState(searchParams.get('doctor') ?? '');
  const busiest = [...lanes].sort((a, b) => (b.withDoctor.length + b.waiting.length) - (a.withDoctor.length + a.waiting.length))[0];
  const activeId = doctorId || myStaffId || busiest?.staffId || '';
  const lane: OpdLane | undefined = lanes.find((l) => l.staffId === activeId);
  const doctorName = lane?.doctorName
    ?? (staff ?? []).find((s) => s.id === activeId)?.name
    ?? t.practitioner;

  const current = lane?.withDoctor[0] ?? null;
  const next = lane?.waiting[0] ?? null;

  if (isError) {
    return <ErrorState title={`Unable to load today's ${t.visit.many.toLowerCase()}`} message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Consultation room</h1>
          <p className="text-muted-foreground">
            Call the next {t.person.one.toLowerCase()} in, write the notes and the prescription, then finish — the desk takes payment.
          </p>
        </div>
        {lanes.length > 0 && (
          <Select value={activeId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-full sm:w-[240px]" aria-label={`Whose consultation room`}>
              <SelectValue placeholder={`Choose a ${t.practitioner.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {lanes.map((l) => (
                <SelectItem key={l.staffId} value={l.staffId}>
                  {l.staffId === myStaffId ? `${l.doctorName} (me)` : l.doctorName} · {l.waiting.length} waiting
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : !lane ? (
        <EmptyState
          icon={Stethoscope}
          title={`No ${t.visit.many.toLowerCase()} for ${myStaffId && activeId === myStaffId ? 'you' : doctorName} today`}
          description={`Patients reach a ${t.practitioner.toLowerCase()}'s queue when the desk checks them in on the OPD queue.`}
          action={{ label: 'Go to the OPD queue', onClick: () => router.push('/opd') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {current ? (
              <CurrentPatient
                key={current.id}
                appointment={current}
                token={tokens.get(current.id)}
                now={now}
                nextUp={next}
                nextToken={next ? tokens.get(next.id) : undefined}
                canPrescribe={canPrescribe && t.has('prescriptions')}
                saving={saveNotes.isPending}
                finishing={finish.isPending || callIn.isPending}
                onSaveNotes={(consultNotes) => saveNotes.mutate({ id: current.id, consultNotes })}
                onFinish={async (consultNotes, callNext) => {
                  await finish.mutateAsync({ appointment: current, consultNotes });
                  if (callNext && next) callIn.mutate({ appointment: next, token: tokens.get(next.id) });
                }}
                onOpenRecord={() => router.push(`/guests/${current.customerId || current.guestId}`)}
              />
            ) : (
              <ReadyForNext
                next={next}
                token={next ? tokens.get(next.id) : undefined}
                now={now}
                calling={callIn.isPending}
                onCall={() => next && callIn.mutate({ appointment: next, token: tokens.get(next.id) })}
                person={t.person.one.toLowerCase()}
              />
            )}
          </div>

          <div className="space-y-6">
            <WaitingList lane={lane} tokens={tokens} now={now} />
            <SeenToday lane={lane} tokens={tokens} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── The patient in the room ─────────────────────────────────────────────────

function CurrentPatient({
  appointment: a, token, now, nextUp, nextToken, canPrescribe, saving, finishing, onSaveNotes, onFinish, onOpenRecord,
}: {
  appointment: Appointment;
  token?: number;
  now: number;
  nextUp: Appointment | null;
  nextToken?: number;
  canPrescribe: boolean;
  saving: boolean;
  finishing: boolean;
  onSaveNotes: (notes: string) => void;
  onFinish: (notes: string, callNext: boolean) => Promise<void>;
  onOpenRecord: () => void;
}) {
  const t = useTerminology();
  const [notes, setNotes] = useState(a.consultNotes ?? '');
  const [rxOpen, setRxOpen] = useState(false);
  const dirty = notes !== (a.consultNotes ?? '');
  const vitals = vitalsSummary(a.triage);
  const started = a.consultStartedAt ? Date.parse(a.consultStartedAt) : NaN;
  const minutesIn = Number.isNaN(started) ? null : Math.max(0, Math.floor((now - started) / 60000));
  const { data: billing } = useBillingSettings();
  const fee = visitFee(a, billing?.standardVisitFee ?? 0);
  const { data: prescriptions } = usePrescriptions({}, { enabled: canPrescribe });
  const written = (prescriptions ?? []).filter((rx) => rx.appointmentId === a.id);
  const name = a.customerName || a.guestName || t.person.one;

  async function finishVisit(callNext: boolean) {
    try {
      await onFinish(notes, callNext);
    } catch {
      // The hook already showed what went wrong; the patient stays in the room.
    }
  }

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">With you now</p>
            <CardTitle className="mt-1 flex flex-wrap items-center gap-2 text-xl">
              {token && <span className="rounded-md bg-primary/10 px-2 py-0.5 text-base tabular-nums text-primary">Token {token}</span>}
              {name}
              <PriorityBadge priority={visitPriorityOf(a)} />
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {a.service || a.serviceName || 'Consultation'}
              {a.customerCategory ? ` · ${a.customerCategory}` : ''}
              {minutesIn !== null ? ` · in the room ${minutesIn} min` : ''}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={onOpenRecord}>
            <UserRound className="mr-2 h-4 w-4" /> {t.person.one} record
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {a.allergyNotes && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Allergies — read before prescribing</p>
              <p className="text-xs text-amber-900/80 dark:text-amber-400/80">{a.allergyNotes}</p>
            </div>
          </div>
        )}

        {/* What the nurse found at triage. */}
        <section className="rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-primary" aria-hidden="true" /> Triage
          </p>
          {a.triage ? (
            <div className="mt-1 space-y-0.5 text-sm">
              {vitals && <p className="tabular-nums">{vitals}</p>}
              {a.triage.complaint && <p className="text-muted-foreground">Complaint: {a.triage.complaint}</p>}
              {a.triage.recordedBy && <p className="text-xs text-muted-foreground">By {a.triage.recordedBy}</p>}
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Not triaged — no vitals recorded.</p>
          )}
        </section>

        {/* 1. Notes */}
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="consult-notes" className="flex items-center gap-2 text-sm font-semibold">
              <NotebookPen className="h-4 w-4 text-primary" aria-hidden="true" /> Consultation notes
            </Label>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {saving ? 'Saving…' : dirty ? 'Not saved yet' : a.consultNotes ? 'Saved' : ''}
            </span>
          </div>
          <Textarea
            id="consult-notes"
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => dirty && onSaveNotes(notes)}
            placeholder="Findings, diagnosis and advice"
          />
        </section>

        {/* 2. Prescription */}
        {canPrescribe && (
          <section className="space-y-2 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Pill className="h-4 w-4 text-primary" aria-hidden="true" /> Prescription
              </p>
              <Button size="sm" variant={written.length ? 'outline' : 'default'} onClick={() => setRxOpen(true)}>
                <Pill className="mr-2 h-4 w-4" /> {written.length ? 'Add another' : 'Write prescription'}
              </Button>
            </div>
            {written.length === 0 ? (
              <p className="text-sm text-muted-foreground">None written in this consultation yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {written.map((rx) => {
                  const meds = medicinesOf(rx);
                  return (
                    <li key={rx.id} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                      {meds.length
                        ? meds.map((m) => (typeof m === 'string' ? m : [m.name, m.dosage, m.frequency].filter(Boolean).join(' '))).join(' · ')
                        : 'Photo only — to be typed up'}
                      {rx.pharmacyName && <span className="text-muted-foreground"> → sent to {rx.pharmacyName}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {/* 3. Finish */}
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 flex-1 text-xs text-muted-foreground">
            Finishing sends {name} to checkout{fee.amount > 0 ? ` — ${formatCurrency(fee.amount)} to pay at the desk or kiosk` : ''}.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap">
            <Button variant="outline" onClick={() => finishVisit(false)} disabled={finishing}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Finish
            </Button>
            {nextUp && (
              <Button onClick={() => finishVisit(true)} loading={finishing}>
                <Megaphone className="mr-2 h-4 w-4" /> Finish &amp; call {nextToken ? `token ${nextToken}` : 'next'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <PrescriptionFormDialog
        open={rxOpen}
        onOpenChange={setRxOpen}
        defaultGuest={{ id: a.customerId || a.guestId || '', name } as Guest}
        defaultStaffId={a.staffId}
        appointmentId={a.id}
      />
    </Card>
  );
}

// ── Nobody in the room ──────────────────────────────────────────────────────

function ReadyForNext({
  next, token, now, calling, onCall, person,
}: { next: Appointment | null; token?: number; now: number; calling: boolean; onCall: () => void; person: string }) {
  if (!next) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={CheckCircle2}
            title="Nobody waiting"
            description={`The next ${person} appears here as soon as the desk checks them in.`}
          />
        </CardContent>
      </Card>
    );
  }
  const wait = waitingMinutes(next, now);
  return (
    <Card className="border-primary/40">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Next {person}</p>
        <div>
          <p className="flex flex-wrap items-center justify-center gap-2 text-2xl font-bold">
            {token && <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xl tabular-nums text-primary">Token {token}</span>}
            {next.customerName || next.guestName}
            <PriorityBadge priority={visitPriorityOf(next)} />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {next.triage ? 'Triaged' : 'Not triaged'}{wait !== null ? ` · waiting ${wait} min` : ''}
            {next.allergyNotes ? ' · has allergies' : ''}
          </p>
        </div>
        <Button size="lg" onClick={onCall} loading={calling}>
          <Megaphone className="mr-2 h-5 w-5" /> Call {token ? `token ${token}` : 'next'} in
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Side lists ──────────────────────────────────────────────────────────────

function WaitingList({ lane, tokens, now }: { lane: OpdLane; tokens: Map<string, number>; now: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Waiting
          <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">{lane.waiting.length}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">In calling order — emergencies first.</p>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {lane.waiting.length === 0 ? (
          <p className="text-sm text-muted-foreground">Queue is clear.</p>
        ) : lane.waiting.map((a) => {
          const wait = waitingMinutes(a, now);
          return (
            <div key={a.id} className="flex items-center gap-3 rounded-md border p-2.5">
              <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-primary/10 px-1.5 text-sm font-bold tabular-nums text-primary">
                {tokens.get(a.id) ?? '—'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  <span className="truncate">{a.customerName || a.guestName}</span>
                  <PriorityBadge priority={visitPriorityOf(a)} />
                </p>
                <p className="text-xs text-muted-foreground">{a.triage ? 'Triaged' : 'Not triaged'}</p>
              </div>
              {wait !== null && (
                <span className={cn('text-xs font-semibold tabular-nums', WAIT_TONE_TEXT[waitTone(wait)])}>{wait}m</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SeenToday({ lane, tokens }: { lane: OpdLane; tokens: Map<string, number> }) {
  const { data: billing } = useBillingSettings();
  if (lane.done.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" /> Seen today
          <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">{lane.done.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {lane.done.map((a) => {
          const fee = visitFee(a, billing?.standardVisitFee ?? 0);
          const paid = a.paymentStatus === 'paid' || a.paymentStatus === 'waived' || fee.amount === 0;
          return (
            <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">
                <span className="tabular-nums text-muted-foreground">{tokens.get(a.id) ?? '—'} · </span>
                {a.customerName || a.guestName}
              </span>
              <span className={cn('flex shrink-0 items-center gap-1 text-xs', paid ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400')}>
                <CreditCard className="h-3 w-3" aria-hidden="true" />
                {paid ? 'Paid' : `${formatCurrency(fee.amount)} at checkout`}
              </span>
            </div>
          );
        })}
        <p className="pt-1 text-[11px] text-muted-foreground">
          {lane.done.at(-1)?.sessionClosedAt ? `Last finished ${formatDate(lane.done.at(-1)!.sessionClosedAt!, 'HH:mm')}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}
