'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, Activity, Clock, CreditCard, HeartPulse, LogIn, LogOut, Megaphone, MonitorPlay, NotebookPen, Pill, Plus,
  Receipt, RefreshCw, ScanFace, Stethoscope, UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { AppointmentStatusMenu } from '@/components/appointments/AppointmentStatusMenu';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { CreateAppointmentDialog } from '@/components/dialogs/CreateAppointmentDialog';
import { PrescriptionFormDialog } from '@/components/dialogs/PrescriptionFormDialog';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { PriorityBadge } from '@/components/opd/PriorityPicker';
import { TriageDialog } from '@/components/opd/TriageDialog';
import { WaitingRoomDisplay } from '@/components/opd/WaitingRoomDisplay';
import { WalkInDialog, type WalkInPatient } from '@/components/opd/WalkInDialog';
import { useAppointments } from '@/hooks/useAppointments';
import { useCheckIns, useFacialCheckIn } from '@/hooks/useCheckins';
import { useCallIn, useDeskCheckOut, useOpdCheckIn } from '@/hooks/useOpd';
import { useBillingSettings } from '@/hooks/usePharmacies';
import { visitFee } from '@/constants/kiosk';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useStaff } from '@/hooks/useStaff';
import { useTerminology } from '@/hooks';
import { useAuthStore } from '@/store';
import {
  OPD_STAGE_LABEL, WAIT_TONE_TEXT, assignTokens, buildLanes, isOpenCheckIn, opdStageOf, unassignedArrivals,
  visitPriorityOf, vitalsSummary, waitTone, waitingMinutes, type OpdLane,
} from '@/constants/opd';
import { cn, formatCurrency, formatDate, getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';
import type { Appointment, Guest } from '@/types';
import { medicinesOf, type Prescription } from '@/types/prescription';

/**
 * The OPD queue — a hospital's flagship screen.
 *
 * An outpatient desk runs on one question: who does each doctor see next? A
 * calendar answers "who is booked", which is a different question — the
 * patient booked for 10:00 who arrived at 10:40 is behind the walk-in who
 * arrived at 10:05, and an emergency is ahead of both. So the board is one
 * lane per doctor, in calling order: emergencies first, then by token.
 *
 * Built from records that already exist, like the hotel's front desk and the
 * spa's treatment board: a visit IS an appointment, arrival IS a check-in
 * (which stamps the time the token is built on), and "with the doctor" IS the
 * in-progress status. Rules live in constants/opd.ts, where they are tested.
 */

/** How often a live board refreshes. Entrance face scans and other desks' actions appear within this. */
const LIVE_REFRESH_MS = 15_000;
const CLINICAL_ROLES = ['doctor', 'practitioner'];

export default function OpdQueuePage() {
  const t = useTerminology();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [date, setDate] = useState(toLocalDateInput());
  const [doctorFilter, setDoctorFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [walkIn, setWalkIn] = useState<{ open: boolean; preset: WalkInPatient | null }>({ open: false, preset: null });
  const [triageId, setTriageId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [faceOpen, setFaceOpen] = useState(false);

  const isToday = date === toLocalDateInput();
  const live = isToday ? LIVE_REFRESH_MS : undefined;
  const { data: appointments, isLoading, isError, error, refetch, isFetching } = useAppointments({ date }, { refetchInterval: live });
  const { data: checkIns } = useCheckIns({}, { enabled: isToday, refetchInterval: live });
  const { data: staff } = useStaff({ limit: 50 });
  const opdCheckIn = useOpdCheckIn();
  const callIn = useCallIn();
  const deskCheckOut = useDeskCheckOut();
  // A face check-in marks the person's next booking today as arrived — their token —
  // or, with no booking, lists them under "Checked in, no doctor yet".
  const facialCheckIn = useFacialCheckIn();

  // Wait times tick without a refetch.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  /** The signed-in doctor's own staff row, matched by email — a login and a staff row are different records. */
  const myStaffId = useMemo(() => {
    if (!user?.email || !CLINICAL_ROLES.includes(user.role)) return '';
    const me = (staff ?? []).find((s) => (s.email ?? '').toLowerCase() === user.email.toLowerCase());
    return me?.id ?? '';
  }, [staff, user]);

  // A doctor opens the page on their own queue; they can still look at everyone's.
  const [defaultApplied, setDefaultApplied] = useState(false);
  useEffect(() => {
    if (defaultApplied || !myStaffId) return;
    setDoctorFilter(myStaffId);
    setDefaultApplied(true);
  }, [myStaffId, defaultApplied]);

  const rows = useMemo(() => appointments ?? [], [appointments]);
  const tokens = useMemo(() => assignTokens(rows), [rows]);
  const lanes = useMemo(() => buildLanes(rows, tokens), [rows, tokens]);
  const visibleLanes = doctorFilter ? lanes.filter((l) => l.staffId === doctorFilter) : lanes;

  const unassigned = useMemo(
    () => (isToday ? unassignedArrivals(checkIns ?? [], rows, date) : []),
    [checkIns, rows, date, isToday],
  );
  const onSiteIds = useMemo(
    () => new Set((checkIns ?? []).filter(isOpenCheckIn).map((c) => c.guestId).filter(Boolean)),
    [checkIns],
  );

  // Read from the live list so a call-in or a payment shows the moment it lands.
  const selected = rows.find((a) => a.id === selectedId) ?? null;
  // What was prescribed in the selected consultation. Same query as the prescriptions
  // worklist, so the two share one cached list; fetched only once there can be any.
  const selectedStage = selected ? opdStageOf(selected) : null;
  const { data: prescriptions } = usePrescriptions({}, {
    enabled: t.has('prescriptions') && (selectedStage === 'with_doctor' || selectedStage === 'done'),
  });
  const visitPrescriptions = useMemo(
    () => (selected ? (prescriptions ?? []).filter((rx) => rx.appointmentId === selected.id) : []),
    [prescriptions, selected],
  );
  const triageFor = rows.find((a) => a.id === triageId) ?? null;

  // The detail card sits under the lanes; bring it into view when a patient is picked.
  useEffect(() => {
    if (selectedId) document.getElementById('opd-visit-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedId]);

  const scoped = visibleLanes.flatMap((l) => [...l.withDoctor, ...l.waiting, ...l.booked, ...l.done]);
  const waiting = visibleLanes.flatMap((l) => l.waiting);
  const withDoctor = visibleLanes.flatMap((l) => l.withDoctor);
  const seen = visibleLanes.flatMap((l) => l.done);
  const notArrived = visibleLanes.flatMap((l) => l.booked);
  const emergencies = waiting.filter((a) => visitPriorityOf(a) === 'emergency');

  const currentWaits = waiting.map((a) => waitingMinutes(a, now)).filter((m): m is number => m !== null);
  const servedWaits = [...withDoctor, ...seen]
    .filter((a) => a.consultStartedAt)
    .map((a) => waitingMinutes(a, now))
    .filter((m): m is number => m !== null);
  const avgWait = servedWaits.length ? Math.round(servedWaits.reduce((s, m) => s + m, 0) / servedWaits.length) : null;
  const longestWait = currentWaits.length ? Math.max(...currentWaits) : null;

  const STATS = [
    { label: 'Waiting', value: waiting.length, tone: 'text-primary' },
    { label: `With ${t.practitioner.toLowerCase()}`, value: withDoctor.length, tone: 'text-foreground' },
    { label: 'Seen', value: seen.length, tone: 'text-green-700 dark:text-green-400' },
    { label: 'Not arrived', value: notArrived.length, tone: 'text-muted-foreground' },
    { label: 'Average wait', value: avgWait === null ? '—' : `${avgWait}m`, tone: 'text-foreground' },
    {
      label: 'Longest wait now',
      value: longestWait === null ? '—' : `${longestWait}m`,
      tone: longestWait === null ? 'text-foreground' : WAIT_TONE_TEXT[waitTone(longestWait)],
    },
  ];

  function callNext(lane: OpdLane) {
    const next = lane.waiting[0];
    if (next) callIn.mutate({ appointment: next, token: tokens.get(next.id) });
  }

  const busy = opdCheckIn.isPending || callIn.isPending;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">OPD Queue</h1>
            <p className="text-muted-foreground">
              Tokens, triage and each {t.practitioner.toLowerCase()}&rsquo;s queue{isToday ? ' — live' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSelectedId(null); }}
              className="w-full sm:w-[170px]"
              aria-label="Queue date"
            />
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDisplayOpen(true)} disabled={!isToday}>
              <MonitorPlay className="mr-2 h-4 w-4" /> Waiting-room display
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Book {t.visit.one.toLowerCase()}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setFaceOpen(true)} disabled={!isToday}>
              <ScanFace className="mr-2 h-4 w-4" /> Check in by face
            </Button>
            <Button size="sm" onClick={() => setWalkIn({ open: true, preset: null })} disabled={!isToday}>
              <UserRound className="mr-2 h-4 w-4" /> Walk-in
            </Button>
          </div>
        </div>

        {/* Doctor filter */}
        {lanes.some((l) => l.staffId) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.practitioner}:</span>
            <Button size="sm" variant={!doctorFilter ? 'default' : 'outline'} onClick={() => setDoctorFilter('')}>
              Everyone
            </Button>
            {lanes.filter((l) => l.staffId).map((l) => (
              <Button
                key={l.staffId}
                size="sm"
                variant={doctorFilter === l.staffId ? 'default' : 'outline'}
                onClick={() => setDoctorFilter(doctorFilter === l.staffId ? '' : l.staffId)}
              >
                {l.staffId === myStaffId ? `${l.doctorName} (me)` : l.doctorName}
              </Button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="px-4 pb-3 pt-4">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className={cn('mt-1 text-2xl font-bold tabular-nums', s.tone)}>{isLoading ? '—' : s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isToday && (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Viewing {formatDate(date, 'EEEE, MMM dd')}. Checking in, calling in and walk-ins are for today&rsquo;s queue only.
          </p>
        )}

        {/* Emergencies waiting */}
        {emergencies.length > 0 && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-red-700 dark:text-red-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-300">
                {emergencies.length} emergency {emergencies.length === 1 ? t.person.one.toLowerCase() : t.person.many.toLowerCase()} waiting
              </p>
              <p className="text-xs text-red-900/80 dark:text-red-400/80">
                {emergencies.map((a) => `Token ${tokens.get(a.id) ?? '—'} · ${a.customerName || a.guestName} for ${a.staffName ?? 'no doctor'}`).join('  ·  ')}
              </p>
            </div>
          </div>
        )}

        {/* On site, on nobody's list */}
        {unassigned.length > 0 && (
          <Card className="border-amber-300 dark:border-amber-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                Checked in, no {t.practitioner.toLowerCase()} yet
                <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">{unassigned.length}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Arrived at the entrance with no {t.visit.one.toLowerCase()} today. No queue shows them until someone is assigned.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {unassigned.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.guestName || t.person.one}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(c.timestamp ?? c.checkInTime, 'HH:mm')} · {c.method || c.checkInMethod || 'Check-in'}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setWalkIn({ open: true, preset: { id: c.guestId, name: c.guestName } })}>
                    Assign
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Lanes */}
        {isError ? (
          <ErrorState
            title={`Unable to load ${t.visit.many.toLowerCase()}`}
            message={getFriendlyErrorMessage(error)}
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <TableSkeleton rows={6} />
        ) : scoped.length === 0 && !visibleLanes.some((l) => l.off.length) ? (
          <EmptyState
            icon={Stethoscope}
            title={`No ${t.visit.many.toLowerCase()} ${isToday ? 'today' : 'on this day'}`}
            description={isToday ? `Book a ${t.visit.one.toLowerCase()}, or add a walk-in straight to a queue.` : 'Pick another date.'}
            action={isToday ? { label: 'Add a walk-in', onClick: () => setWalkIn({ open: true, preset: null }) } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {visibleLanes.map((lane) => (
              <LaneCard
                key={lane.staffId || 'none'}
                lane={lane}
                tokens={tokens}
                now={now}
                selectedId={selected?.id}
                onSelect={(a) => setSelectedId(a.id)}
                onCallNext={() => callNext(lane)}
                onOpenRoom={() => router.push(`/consultation?doctor=${lane.staffId}`)}
                canAct={isToday && !busy}
                practitioner={t.practitioner}
              />
            ))}
          </div>
        )}

        {/* Detail */}
        {selected && (
          <VisitDetail
            appointment={selected}
            token={tokens.get(selected.id)}
            now={now}
            isToday={isToday}
            busy={busy}
            canPrescribe={t.has('prescriptions')}
            prescriptions={visitPrescriptions}
            onOpenPrescription={(id) => router.push(`/prescriptions/${id}`)}
            placeLabel={t.place.one}
            onClose={() => setSelectedId(null)}
            onCheckIn={() => opdCheckIn.mutate(selected)}
            onCallIn={() => callIn.mutate({ appointment: selected, token: tokens.get(selected.id) })}
            onTriage={() => setTriageId(selected.id)}
            onPay={() => setPayOpen(true)}
            onPrescribe={() => setRxOpen(true)}
            onOpenRoom={selected.staffId ? () => router.push(`/consultation?doctor=${selected.staffId}`) : undefined}
            onSite={onSiteIds.has(selected.customerId || selected.guestId || '')}
            checkingOut={deskCheckOut.isPending}
            onCheckOut={() => deskCheckOut.mutate({
              personId: selected.customerId || selected.guestId || '',
              name: selected.customerName || selected.guestName,
            })}
            onOpenRecord={() => router.push(`/guests/${selected.customerId || selected.guestId}`)}
            onPaymentRecords={() => {
              const name = selected.customerName || selected.guestName;
              router.push(name ? `/payments?search=${encodeURIComponent(name)}` : '/payments');
            }}
          />
        )}

        <WalkInDialog
          open={walkIn.open}
          onOpenChange={(open) => setWalkIn((w) => ({ ...w, open }))}
          presetPatient={walkIn.preset}
          onSiteIds={onSiteIds}
        />
        <TriageDialog
          open={!!triageFor}
          onOpenChange={(open) => !open && setTriageId(null)}
          appointment={triageFor}
          token={triageFor ? tokens.get(triageFor.id) : undefined}
        />
        <CameraCaptureDialog
          open={faceOpen}
          onOpenChange={setFaceOpen}
          title="Check in by face"
          description={`A ${t.person.one.toLowerCase()} with a ${t.visit.one.toLowerCase()} today joins their ${t.practitioner.toLowerCase()}'s queue with a token.`}
          submitLabel="Check in"
          isSubmitting={facialCheckIn.isPending}
          onSubmit={(image) => facialCheckIn.mutate({ image, venue: 'OPD' }, { onSuccess: () => setFaceOpen(false) })}
          glasses={{ purpose: 'identify' }}
        />
        <CreateAppointmentDialog open={createOpen} onOpenChange={setCreateOpen} />
        <RecordAppointmentPaymentDialog open={payOpen} onOpenChange={setPayOpen} appointment={selected} />
        <PrescriptionFormDialog
          open={rxOpen}
          onOpenChange={setRxOpen}
          defaultGuest={selected ? ({ id: selected.customerId || selected.guestId || '', name: selected.customerName || selected.guestName || '' } as Guest) : null}
          defaultStaffId={selected?.staffId}
          appointmentId={selected?.id}
        />
        {displayOpen && (
          <WaitingRoomDisplay lanes={lanes} tokens={tokens} orgLabel={t.org} onClose={() => setDisplayOpen(false)} />
        )}
      </div>
    </TooltipProvider>
  );
}

// ── One doctor's lane ────────────────────────────────────────────────────────

function LaneCard({
  lane, tokens, now, selectedId, onSelect, onCallNext, onOpenRoom, canAct, practitioner,
}: {
  lane: OpdLane;
  tokens: Map<string, number>;
  now: number;
  selectedId?: string;
  onSelect: (a: Appointment) => void;
  onCallNext: () => void;
  /** The doctor's Consultation room: the patient in front of them, notes and prescription. */
  onOpenRoom: () => void;
  canAct: boolean;
  practitioner: string;
}) {
  const [showSeen, setShowSeen] = useState(false);
  const serving = lane.withDoctor[0];
  const callBlocked = !lane.staffId
    ? 'Assign a doctor first'
    : lane.waiting.length === 0
    ? 'Nobody is waiting'
    : serving
    ? `Still with token ${tokens.get(serving.id) ?? '—'} — end that consultation first`
    : '';

  return (
    <Card className={cn(!lane.staffId && 'border-amber-300 dark:border-amber-900')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{lane.doctorName}</CardTitle>
            <p className="truncate text-xs text-muted-foreground">
              {lane.room || `No room set`} · {lane.waiting.length} waiting · {lane.done.length} seen
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* The span keeps the tooltip working while the button is disabled. */}
              <span>
                <Button size="sm" onClick={onCallNext} disabled={!canAct || !!callBlocked}>
                  <Megaphone className="mr-2 h-4 w-4" /> Call next
                </Button>
              </span>
            </TooltipTrigger>
            {callBlocked && <TooltipContent>{callBlocked}</TooltipContent>}
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">With {practitioner.toLowerCase()}</p>
            {lane.staffId && (
              <Button size="sm" variant="ghost" className="-my-1 h-7 px-2 text-xs text-primary" onClick={onOpenRoom}>
                <NotebookPen className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Consultation room
              </Button>
            )}
          </div>
          {lane.withDoctor.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">Nobody right now.</p>
          ) : (
            <div className="mt-1 space-y-1.5">
              {lane.withDoctor.map((a) => (
                <QueueRow key={a.id} a={a} token={tokens.get(a.id)} now={now} selected={selectedId === a.id} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Waiting · in calling order
          </p>
          {lane.waiting.length === 0 ? (
            <p className="text-sm text-muted-foreground">Queue is clear.</p>
          ) : (
            <div className="space-y-1.5">
              {lane.waiting.map((a) => (
                <QueueRow key={a.id} a={a} token={tokens.get(a.id)} now={now} selected={selectedId === a.id} onSelect={onSelect} showWait />
              ))}
            </div>
          )}
        </div>

        {lane.booked.length > 0 && (
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Booked, not arrived
            </p>
            <div className="space-y-1.5">
              {lane.booked.map((a) => (
                <QueueRow key={a.id} a={a} now={now} selected={selectedId === a.id} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}

        {(lane.done.length > 0 || lane.off.length > 0) && (
          <div>
            <button
              type="button"
              onClick={() => setShowSeen((v) => !v)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-expanded={showSeen}
            >
              {showSeen ? 'Hide' : 'Show'} {lane.done.length} seen{lane.off.length ? ` · ${lane.off.length} cancelled or no-show` : ''}
            </button>
            {showSeen && (
              <div className="mt-1.5 space-y-1.5">
                {[...lane.done, ...lane.off].map((a) => (
                  <QueueRow key={a.id} a={a} token={tokens.get(a.id)} now={now} selected={selectedId === a.id} onSelect={onSelect} muted />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QueueRow({
  a, token, now, selected, onSelect, showWait, muted,
}: {
  a: Appointment;
  token?: number;
  now: number;
  selected: boolean;
  onSelect: (a: Appointment) => void;
  showWait?: boolean;
  muted?: boolean;
}) {
  const priority = visitPriorityOf(a);
  const wait = showWait ? waitingMinutes(a, now) : null;
  const stage = opdStageOf(a);
  const unpaid = a.paymentStatus !== 'paid' && a.paymentStatus !== 'waived' && Number(a.amount ?? 0) > 0;
  return (
    <button
      type="button"
      onClick={() => onSelect(a)}
      className={cn(
        'flex w-full items-center gap-3 rounded-md border bg-background p-2.5 text-left transition-colors hover:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'border-primary bg-primary/5',
        muted && 'opacity-70',
      )}
    >
      <span
        className={cn(
          'flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md px-1.5 text-sm font-bold tabular-nums',
          token ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}
        aria-label={token ? `Token ${token}` : `Booked for ${a.startTime}`}
      >
        {token ?? a.startTime ?? '—'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
          <span className="truncate">{a.customerName || a.guestName || 'Unnamed'}</span>
          <PriorityBadge priority={priority} />
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {muted ? OPD_STAGE_LABEL[stage] : a.service || a.serviceName || 'Consultation'}
          {a.triage ? ' · triaged' : ''}
          {a.allergyNotes ? ' · allergy' : ''}
        </p>
      </div>
      {wait !== null && (
        <span className={cn('flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums', WAIT_TONE_TEXT[waitTone(wait)])}>
          <Clock className="h-3 w-3" aria-hidden="true" />{wait}m
        </span>
      )}
      {muted && unpaid && (
        <span className="shrink-0 text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-400">
          {formatCurrency(Number(a.amount))}
        </span>
      )}
    </button>
  );
}

// ── The selected visit ───────────────────────────────────────────────────────

function VisitDetail({
  appointment: a, token, now, isToday, busy, canPrescribe, prescriptions, onOpenPrescription, placeLabel,
  onClose, onCheckIn, onCallIn, onTriage, onPay, onPrescribe, onOpenRoom, onSite, checkingOut, onCheckOut,
  onOpenRecord, onPaymentRecords,
}: {
  appointment: Appointment;
  token?: number;
  now: number;
  isToday: boolean;
  busy: boolean;
  canPrescribe: boolean;
  /** Prescriptions written in this consultation. */
  prescriptions: Prescription[];
  onOpenPrescription: (id: string) => void;
  placeLabel: string;
  onClose: () => void;
  onCheckIn: () => void;
  onCallIn: () => void;
  onTriage: () => void;
  onPay: () => void;
  onPrescribe: () => void;
  /** Open this doctor's Consultation room, where the visit is run. */
  onOpenRoom?: () => void;
  /** The patient still has an open visit (on site). */
  onSite: boolean;
  checkingOut: boolean;
  /** Close their visit at the desk — they have left. */
  onCheckOut: () => void;
  onOpenRecord: () => void;
  onPaymentRecords: () => void;
}) {
  const stage = opdStageOf(a);
  const priority = visitPriorityOf(a);
  const wait = waitingMinutes(a, now);
  const vitals = vitalsSummary(a.triage);
  // Its own fee, or the hospital's standard visit fee for a visit booked without one (a walk-in).
  const { data: billing } = useBillingSettings();
  const fee = visitFee(a, billing?.standardVisitFee ?? 0);
  const unpaid = a.paymentStatus !== 'paid' && a.paymentStatus !== 'waived' && fee.amount > 0;
  const arrived = stage === 'waiting' || stage === 'with_doctor' || stage === 'done';

  return (
    <Card id="opd-visit-detail" className="scroll-mt-24 border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {token && <span className="rounded bg-primary/10 px-2 py-0.5 text-sm tabular-nums text-primary">Token {token}</span>}
              {a.customerName || a.guestName}
              <PriorityBadge priority={priority} />
              <span className="text-xs font-normal text-muted-foreground">{OPD_STAGE_LABEL[stage]}</span>
            </CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {a.service || a.serviceName || 'Consultation'} · {a.staffName ?? 'No doctor'} · booked {a.startTime ?? '—'}
              {a.customerCategory ? ` · ${a.customerCategory}` : ''}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {a.allergyNotes && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Allergies — read before treating</p>
              <p className="text-xs text-amber-900/80 dark:text-amber-400/80">{a.allergyNotes}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-primary" aria-hidden="true" /> Triage
          </p>
          {a.triage ? (
            <div className="mt-1 space-y-0.5 text-sm">
              {vitals && <p className="tabular-nums">{vitals}</p>}
              {a.triage.complaint && <p className="text-muted-foreground">{a.triage.complaint}</p>}
              {a.triage.recordedAt && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(a.triage.recordedAt, 'HH:mm')}{a.triage.recordedBy ? ` · ${a.triage.recordedBy}` : ''}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Not triaged yet.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Arrived" value={a.arrivedAt ? formatDate(a.arrivedAt, 'HH:mm') : '—'} />
          <Field label={stage === 'waiting' ? 'Waiting' : 'Waited'} value={wait === null ? '—' : `${wait} min`} />
          <Field label={placeLabel} value={a.room || '—'} />
          <Field
            label={fee.usesStandardFee ? 'Fee (standard)' : 'Fee'}
            value={`${formatCurrency(fee.amount)} · ${a.paymentStatus ?? '—'}`}
          />
        </div>

        {a.notes && <p className="rounded bg-muted px-3 py-2 text-sm">{a.notes}</p>}

        {canPrescribe && prescriptions.length > 0 && (
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Pill className="h-4 w-4 text-primary" aria-hidden="true" /> Prescribed this visit
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {prescriptions.map((rx) => {
                const count = medicinesOf(rx).length;
                return (
                  <Button key={rx.id} size="sm" variant="outline" onClick={() => onOpenPrescription(rx.id)}>
                    {count ? `${count} medicine${count === 1 ? '' : 's'}` : 'Photo only — to type up'}
                    {rx.createdAt ? ` · ${formatDate(rx.createdAt, 'HH:mm')}` : ''}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap items-center gap-2">
          {stage === 'booked' && isToday && (
            <Button size="sm" onClick={onCheckIn} loading={busy}>
              <LogIn className="mr-2 h-4 w-4" /> Check in
            </Button>
          )}
          {stage === 'waiting' && isToday && (
            <Button size="sm" onClick={onCallIn} loading={busy}>
              <Megaphone className="mr-2 h-4 w-4" /> Call in
            </Button>
          )}
          {arrived && stage !== 'done' && (
            <Button size="sm" variant={stage === 'waiting' && !a.triage ? 'default' : 'outline'} onClick={onTriage}>
              <HeartPulse className="mr-2 h-4 w-4" /> {a.triage ? 'Update triage' : 'Triage'}
            </Button>
          )}
          {stage === 'with_doctor' && onOpenRoom && (
            <Button size="sm" onClick={onOpenRoom}>
              <NotebookPen className="mr-2 h-4 w-4" /> Open consultation room
            </Button>
          )}
          {canPrescribe && (stage === 'with_doctor' || stage === 'done') && (
            <Button size="sm" variant="outline" onClick={onPrescribe}>
              <Pill className="mr-2 h-4 w-4" /> Write prescription
            </Button>
          )}
          {/* End consultation (with the fee), cancel and no-show — the shared status menu and its rules. */}
          <AppointmentStatusMenu appointmentId={a.id} currentStatus={a.status} appointment={a} />
          {unpaid && arrived && (
            <Button size="sm" variant={stage === 'done' ? 'default' : 'outline'} onClick={onPay}>
              <CreditCard className="mr-2 h-4 w-4" /> Record payment
            </Button>
          )}
          {/* Seen and still here: the last step is letting them go. Paid first, as a rule. */}
          {stage === 'done' && onSite && isToday && (
            <Button size="sm" variant={unpaid ? 'outline' : 'default'} onClick={onCheckOut} loading={checkingOut}>
              <LogOut className="mr-2 h-4 w-4" /> Check out
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onOpenRecord}>
            <UserRound className="mr-2 h-4 w-4" /> Patient record
          </Button>
          <Button size="sm" variant="outline" onClick={onPaymentRecords}>
            <Receipt className="mr-2 h-4 w-4" /> Payment records
          </Button>
        </div>
        {stage === 'done' && unpaid && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Consultation over — {formatCurrency(fee.amount)} still to collect{onSite ? ', then check them out' : ''}.
          </p>
        )}
        {stage === 'done' && !unpaid && !onSite && (
          <p className="text-xs text-green-700 dark:text-green-400">Visit complete — paid and checked out.</p>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium capitalize">{value}</p>
    </div>
  );
}
