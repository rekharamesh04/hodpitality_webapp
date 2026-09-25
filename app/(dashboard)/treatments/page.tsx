'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, RefreshCw, Plus, AlertTriangle, Users, CalendarDays, CreditCard, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CreateAppointmentDialog } from '@/components/dialogs/CreateAppointmentDialog';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { AppointmentStatusMenu } from '@/components/appointments/AppointmentStatusMenu';
import { useAppointments } from '@/hooks/useAppointments';
import { useVenues } from '@/hooks/useVenues';
import { useStaff } from '@/hooks/useStaff';
import { useTerminology } from '@/hooks';
import { cn, formatCurrency, getFriendlyErrorMessage, getInitials, toLocalDateInput } from '@/lib/utils';
import type { Appointment } from '@/types';

/**
 * The treatment board.
 *
 * A spa sells time in a room, so the number worth surfacing is the unsold gap
 * between two bookings — and a list sorted by time cannot show a gap, because
 * the absence of a booking has no row. Hence a timeline per room.
 *
 * It is built from records that already exist rather than a parallel entity: a
 * booking IS an appointment (`service`, `staffId`, `room`, `duration`,
 * `status`, `amount`), and a room IS a venue. That means it is tenant-scoped
 * and writable through the existing endpoints on day one, with nothing new to
 * deploy.
 */

/** "HH:mm" as minutes from midnight. Returns null for anything unparseable. */
function toMinutes(time?: string): number | null {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function hhmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Where a booking has got to, in the words this board uses. */
function stateOf(a: Appointment): 'booked' | 'arrived' | 'in_progress' | 'complete' | 'off' {
  switch ((a.status ?? '').toLowerCase()) {
    case 'arrived': return 'arrived';
    case 'in-progress': case 'in_progress': return 'in_progress';
    case 'completed': return 'complete';
    case 'cancelled': case 'no-show': case 'no_show': return 'off';
    default: return 'booked';
  }
}

const STATE_BAR: Record<ReturnType<typeof stateOf>, string> = {
  booked:      'bg-slate-200 dark:bg-slate-700',
  arrived:     'bg-amber-300 dark:bg-amber-600',
  in_progress: 'bg-primary text-primary-foreground',
  complete:    'bg-green-300 dark:bg-green-800',
  off:         'bg-red-200 opacity-60 dark:bg-red-900',
};

const STATE_LABEL: Record<ReturnType<typeof stateOf>, string> = {
  booked: 'Booked', arrived: 'Arrived', in_progress: 'In progress', complete: 'Complete', off: 'Cancelled / no-show',
};

export default function TreatmentBoardPage() {
  const t = useTerminology();
  const router = useRouter();

  const [date, setDate] = useState(toLocalDateInput());
  const [therapist, setTherapist] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const { data: appointments, isLoading, isError, error, refetch, isFetching } = useAppointments({ date });
  const { data: venues } = useVenues();
  const { data: staff } = useStaff();

  const rows = useMemo(() => appointments ?? [], [appointments]);
  // Read from the live list so a status change or a payment shows here the moment it lands.
  const selected = rows.find((a) => a.id === selectedId) ?? null;
  const setSelected = (a: Appointment | null) => setSelectedId(a?.id ?? null);
  const unpaid = !!selected && selected.paymentStatus !== 'paid' && Number(selected.amount ?? 0) > 0;

  const therapists = useMemo(
    () => Array.from(new Set(rows.map((a) => a.staffName).filter((n): n is string => !!n))).sort(),
    [rows],
  );

  const visible = useMemo(
    () => (therapist ? rows.filter((a) => a.staffName === therapist) : rows),
    [rows, therapist],
  );

  /**
   * The rooms to draw, and the bookings in each.
   *
   * `room` on an appointment is free text, so it is matched to a venue by name
   * and anything unmatched keeps its own lane rather than being dropped —
   * losing a booking off the board would be worse than an untidy row.
   */
  const lanes = useMemo(() => {
    const byRoom = new Map<string, Appointment[]>();
    for (const a of visible) {
      const key = (a.room || '').trim() || 'Unassigned';
      if (!byRoom.has(key)) byRoom.set(key, []);
      byRoom.get(key)!.push(a);
    }
    const venueNames = (venues ?? []).map((v) => v.name).filter((n): n is string => !!n);
    for (const name of venueNames) if (!byRoom.has(name)) byRoom.set(name, []);
    return [...byRoom.entries()]
      .map(([room, list]) => ({
        room,
        isVenue: venueNames.includes(room),
        list: list.sort((x, y) => (toMinutes(x.startTime) ?? 0) - (toMinutes(y.startTime) ?? 0)),
      }))
      .sort((a, b) => a.room.localeCompare(b.room));
  }, [visible, venues]);

  // The working day, derived from the bookings rather than assumed, so an
  // early or late booking is never drawn off the edge of the board.
  const { open, close } = useMemo(() => {
    const starts = rows.map((a) => toMinutes(a.startTime)).filter((n): n is number => n !== null);
    const ends = rows.map((a) => {
      const s = toMinutes(a.startTime);
      return s === null ? null : s + (a.duration ?? 30);
    }).filter((n): n is number => n !== null);
    if (!starts.length) return { open: 9 * 60, close: 18 * 60 };
    return {
      open: Math.min(9 * 60, Math.floor(Math.min(...starts) / 60) * 60),
      close: Math.max(18 * 60, Math.ceil(Math.max(...ends) / 60) * 60),
    };
  }, [rows]);

  const span = Math.max(close - open, 60);
  const hourMarks = Array.from({ length: Math.floor(span / 60) + 1 }, (_, i) => open + i * 60);

  const inProgress = rows.filter((a) => stateOf(a) === 'in_progress');
  const arrived = rows.filter((a) => stateOf(a) === 'arrived');
  const revenue = rows
    .filter((a) => stateOf(a) !== 'off')
    .reduce((sum, a) => sum + Number(a.amount ?? 0), 0);

  // Unsold minutes between consecutive bookings in the same room.
  const idleMinutes = useMemo(() => {
    let total = 0;
    for (const lane of lanes) {
      const booked = lane.list.filter((a) => stateOf(a) !== 'off');
      for (let i = 1; i < booked.length; i += 1) {
        const prevStart = toMinutes(booked[i - 1].startTime);
        const thisStart = toMinutes(booked[i].startTime);
        if (prevStart === null || thisStart === null) continue;
        const gap = thisStart - (prevStart + (booked[i - 1].duration ?? 30));
        if (gap > 0) total += gap;
      }
    }
    return total;
  }, [lanes]);

  const STATS = [
    { label: 'In progress', value: inProgress.length, tone: 'text-primary' },
    { label: 'Waiting', value: arrived.length, tone: 'text-amber-700 dark:text-amber-400' },
    { label: `${t.place.many}`, value: (venues ?? []).length, tone: 'text-foreground' },
    { label: `${t.practitioner}s`, value: therapists.length, tone: 'text-foreground' },
    { label: 'Idle time', value: `${idleMinutes}m`, tone: 'text-muted-foreground' },
    { label: 'Booked', value: formatCurrency(revenue), tone: 'text-foreground' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{t.visit.one} Board</h1>
            <p className="text-muted-foreground">
              {t.place.many} and {t.practitioner.toLowerCase()}s across the day
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-[170px]"
              aria-label="Board date"
            />
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New {t.visit.one.toLowerCase()}
            </Button>
          </div>
        </div>

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

        {/* Therapist filter */}
        {therapists.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.practitioner}:</span>
            <Button size="sm" variant={!therapist ? 'default' : 'outline'} onClick={() => setTherapist('')}>
              Everyone
            </Button>
            {therapists.map((name) => (
              <Button
                key={name}
                size="sm"
                variant={therapist === name ? 'default' : 'outline'}
                onClick={() => setTherapist(therapist === name ? '' : name)}
              >
                {name}
              </Button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Board */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Gaps between blocks are unsold {t.place.one.toLowerCase()} time.
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={6} />
              ) : isError ? (
                <ErrorState
                  title={`Unable to load ${t.visit.many.toLowerCase()}`}
                  message={getFriendlyErrorMessage(error)}
                  onRetry={() => refetch()}
                />
              ) : rows.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title={`No ${t.visit.many.toLowerCase()} on this day`}
                  description="Pick another date, or book one."
                  action={{ label: `New ${t.visit.one.toLowerCase()}`, onClick: () => setCreateOpen(true) }}
                />
              ) : (
                <div className="space-y-1 overflow-x-auto">
                  <div className="min-w-[640px]">
                    <div className="relative mb-2 ml-[86px] h-5 border-b">
                      {hourMarks.map((m) => (
                        <span
                          key={m}
                          className="absolute -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground"
                          style={{ left: `${((m - open) / span) * 100}%` }}
                        >
                          {hhmm(m)}
                        </span>
                      ))}
                    </div>

                    {lanes.map((lane) => (
                      <div key={lane.room} className="flex items-center gap-2 py-1.5">
                        <div className="w-[78px] shrink-0">
                          <p className="truncate text-xs font-semibold">{lane.room}</p>
                          {!lane.isVenue && lane.room !== 'Unassigned' && (
                            <p className="truncate text-[10px] text-muted-foreground">not a {t.place.one.toLowerCase()}</p>
                          )}
                        </div>
                        <div className="relative h-11 flex-1 rounded-md border bg-muted/30">
                          {lane.list.map((a) => {
                            const start = toMinutes(a.startTime);
                            if (start === null) return null;
                            const dur = a.duration ?? 30;
                            const st = stateOf(a);
                            return (
                              <Tooltip key={a.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => setSelected(a)}
                                    style={{
                                      left: `${((start - open) / span) * 100}%`,
                                      width: `${(dur / span) * 100}%`,
                                    }}
                                    className={cn(
                                      'absolute inset-y-1 z-10 overflow-hidden rounded px-1.5 text-left transition-all',
                                      'hover:z-30 hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                      STATE_BAR[st],
                                    )}
                                  >
                                    <span className="block truncate text-[10px] font-semibold leading-tight">
                                      {a.customerName || a.guestName || 'Booking'}
                                    </span>
                                    <span className="block truncate text-[9px] leading-tight opacity-80">
                                      {a.service || a.serviceName || ''}
                                    </span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-semibold">
                                    {a.customerName || a.guestName} — {a.service || a.serviceName}
                                  </p>
                                  <p className="text-xs">
                                    {hhmm(start)}–{hhmm(start + dur)} · {a.staffName ?? '—'} · {STATE_LABEL[st]}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 text-[11px] text-muted-foreground">
                    {(Object.keys(STATE_LABEL) as (keyof typeof STATE_LABEL)[]).map((k) => (
                      <span key={k} className="inline-flex items-center gap-1.5">
                        <span className={cn('h-2.5 w-2.5 rounded-sm', STATE_BAR[k])} aria-hidden="true" />
                        {STATE_LABEL[k]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right rail */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">In progress</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <TableSkeleton rows={2} />
                ) : inProgress.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No {t.visit.many.toLowerCase()} running right now.
                  </p>
                ) : (
                  inProgress.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelected(a)}
                      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {getInitials(a.customerName || a.guestName || '?')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{a.customerName || a.guestName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.room || '—'} · {a.staffName ?? '—'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {arrived.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    Waiting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {arrived.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.customerName || a.guestName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.service || a.serviceName} · {a.startTime}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelected(a)}>Open</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {lanes.some((l) => l.room === 'Unassigned' && l.list.length > 0) && (
              <Card className="border-amber-300 dark:border-amber-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    No {t.place.one.toLowerCase()} assigned
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    These cannot be given a slot on the board until a {t.place.one.toLowerCase()} is set.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lanes.find((l) => l.room === 'Unassigned')!.list.map((a) => (
                    <p key={a.id} className="truncate text-sm">
                      {a.customerName || a.guestName}{' '}
                      <span className="text-muted-foreground">· {a.startTime}</span>
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Detail */}
        {selected && (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {selected.customerName || selected.guestName}
                    <StatusBadge status={selected.status} />
                  </CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {selected.service || selected.serviceName} · {selected.startTime} ·{' '}
                    {selected.duration ?? 30} min · {selected.staffName ?? '—'}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected.allergyNotes && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Read before starting</p>
                    <p className="text-xs text-amber-900/80 dark:text-amber-400/80">{selected.allergyNotes}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label={t.place.one} value={selected.room || 'Unassigned'} />
                <Field label="Duration" value={`${selected.duration ?? 30} min`} />
                <Field label="Amount" value={formatCurrency(Number(selected.amount ?? 0))} />
                <Field label="Payment" value={selected.paymentStatus ?? '—'} />
              </div>

              {selected.notes && <p className="rounded bg-muted px-3 py-2 text-sm">{selected.notes}</p>}

              <div className="flex flex-wrap items-center gap-2">
                <AppointmentStatusMenu appointmentId={selected.id} currentStatus={selected.status} />
                {unpaid && (
                  <Button
                    size="sm"
                    variant={stateOf(selected) === 'complete' ? 'default' : 'outline'}
                    onClick={() => setPayOpen(true)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Record payment
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const name = selected.customerName || selected.guestName;
                    router.push(name ? `/payments?search=${encodeURIComponent(name)}` : '/payments');
                  }}
                >
                  <Receipt className="mr-2 h-4 w-4" /> Payment records
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push('/calendar')}>
                  <Sparkles className="mr-2 h-4 w-4" /> Manage in the calendar
                </Button>
              </div>
              {stateOf(selected) === 'complete' && unpaid && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {t.visit.one} complete — {formatCurrency(Number(selected.amount ?? 0))} still to take.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <CreateAppointmentDialog open={createOpen} onOpenChange={setCreateOpen} />
        <RecordAppointmentPaymentDialog open={payOpen} onOpenChange={setPayOpen} appointment={selected} />
      </div>
    </TooltipProvider>
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
