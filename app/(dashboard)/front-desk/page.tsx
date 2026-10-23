'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogIn, LogOut, BedDouble, AlertTriangle, Plus, RefreshCw, KeyRound, CalendarDays, Crown, CreditCard, Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CreateAppointmentDialog } from '@/components/dialogs/CreateAppointmentDialog';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { useVenues } from '@/hooks/useVenues';
import { useTerminology } from '@/hooks';
import { cn, formatCurrency, getFriendlyErrorMessage, getInitials, toLocalDateInput } from '@/lib/utils';
import type { Appointment, Venue } from '@/types';

/**
 * The front desk board.
 *
 * A desk works in three piles — arriving, here, leaving — but the question
 * that decides the day is whether a room is free for each arrival. An
 * arrivals list that does not know about room state cannot tell you which
 * check-in is about to go wrong, so the two are shown together and the
 * mismatch is called out at the top.
 *
 * Built from records that already exist: a stay IS an appointment (the
 * hospitality industry already calls a visit a Booking and routes it through
 * /appointments), and a room IS a venue. Nothing new to deploy, and both are
 * tenant-scoped already.
 *
 * What a venue does NOT carry is housekeeping state — there is no
 * clean/dirty flag in the API — so occupancy here is derived from whether a
 * booking is actually in the room today, and nothing is invented beyond that.
 */

type Pile = 'arriving' | 'in_house' | 'departing';

function pileOf(a: Appointment): Pile | null {
  switch ((a.status ?? '').toLowerCase()) {
    case 'scheduled': case 'confirmed': case 'pending': return 'arriving';
    case 'arrived': case 'in-progress': case 'in_progress': return 'in_house';
    case 'completed': return 'departing';
    default: return null; // cancelled / no-show never reach the desk
  }
}

export default function FrontDeskPage() {
  const t = useTerminology();
  const router = useRouter();

  const [date, setDate] = useState(toLocalDateInput());
  const [floorFilter, setFloorFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const { data: appointments, isLoading, isError, error, refetch, isFetching } = useAppointments({ date });
  const { data: venues, isLoading: venuesLoading } = useVenues();
  const updateStatus = useUpdateAppointmentStatus();

  const rows = useMemo(() => appointments ?? [], [appointments]);
  // Read from the live list so a check-in or a payment shows here the moment it lands.
  const selected = rows.find((a) => a.id === selectedId) ?? null;
  const setSelected = (a: Appointment | null) => setSelectedId(a?.id ?? null);
  const unpaid = !!selected && selected.paymentStatus !== 'paid' && Number(selected.amount ?? 0) > 0;
  const payerName = selected ? selected.customerName || selected.guestName || '' : '';
  const arriving = rows.filter((a) => pileOf(a) === 'arriving');
  const inHouse = rows.filter((a) => pileOf(a) === 'in_house');
  const departing = rows.filter((a) => pileOf(a) === 'departing');

  /** Which rooms are actually in use today, from the bookings themselves. */
  const occupiedRooms = useMemo(
    () => new Set(inHouse.map((a) => (a.room || '').trim()).filter(Boolean)),
    [inHouse],
  );

  const roomList: Venue[] = useMemo(() => venues ?? [], [venues]);

  const locations = useMemo(
    () => Array.from(new Set(roomList.map((v) => v.location).filter((l): l is string => !!l))).sort(),
    [roomList],
  );

  const visibleRooms = useMemo(
    () => (floorFilter ? roomList.filter((v) => v.location === floorFilter) : roomList),
    [roomList, floorFilter],
  );

  const freeRooms = roomList.filter(
    (v) => (v.status ?? 'active') === 'active' && !occupiedRooms.has(v.name ?? ''),
  );

  /** Arrivals with no free room left — the check-in that is about to fail. */
  const atRisk = arriving.length > freeRooms.length
    ? arriving.slice(freeRooms.length)
    : [];

  const outstanding = rows.reduce(
    (sum, a) => sum + (a.paymentStatus === 'paid' ? 0 : Number(a.amount ?? 0)),
    0,
  );

  const STATS = [
    { label: 'Arriving', value: arriving.length, tone: 'text-primary' },
    { label: 'In house', value: inHouse.length, tone: 'text-foreground' },
    { label: 'Departing', value: departing.length, tone: 'text-amber-700 dark:text-amber-400' },
    { label: `${t.place.many} free`, value: freeRooms.length, tone: 'text-green-700 dark:text-green-400' },
    { label: `${t.place.many} total`, value: roomList.length, tone: 'text-foreground' },
    { label: 'Outstanding', value: formatCurrency(outstanding), tone: 'text-foreground' },
  ];

  function checkIn(a: Appointment) {
    updateStatus.mutate({ id: a.id, status: 'arrived' });
  }
  function checkOut(a: Appointment) {
    updateStatus.mutate({ id: a.id, status: 'completed' });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Front Desk</h1>
            <p className="text-muted-foreground">
              Arrivals, departures and {t.place.one.toLowerCase()} availability
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
                <p className={cn('mt-1 text-2xl font-bold tabular-nums', s.tone)}>
                  {isLoading || venuesLoading ? '—' : s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* The check-in about to fail */}
        {atRisk.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {arriving.length} arrivals but only {freeRooms.length} {t.place.many.toLowerCase()} free
              </p>
              <p className="text-xs text-amber-900/80 dark:text-amber-400/80">
                {atRisk.map((a) => a.customerName || a.guestName).filter(Boolean).join(' · ')} may have nowhere to go.
              </p>
            </div>
          </div>
        )}

        {isError ? (
          <ErrorState
            title={`Unable to load ${t.visit.many.toLowerCase()}`}
            message={getFriendlyErrorMessage(error)}
            onRetry={() => refetch()}
          />
        ) : (
          <>
            {/* Three piles */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Pile
                title="Arriving" icon={LogIn} tone="text-primary"
                rows={arriving} loading={isLoading}
                emptyText="No arrivals on this date."
                onSelect={setSelected} selectedId={selected?.id}
                t={t}
              />
              <Pile
                title="In house" icon={BedDouble} tone="text-foreground"
                rows={inHouse} loading={isLoading}
                emptyText={`No ${t.person.many.toLowerCase()} in house.`}
                onSelect={setSelected} selectedId={selected?.id}
                t={t}
              />
              <Pile
                title="Departing" icon={LogOut} tone="text-amber-700 dark:text-amber-400"
                rows={departing} loading={isLoading}
                emptyText="No departures on this date."
                onSelect={setSelected} selectedId={selected?.id}
                t={t}
              />
            </div>

            {/* Rooms */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{t.place.many}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      In use is derived from today&rsquo;s bookings — the API stores no housekeeping state.
                    </p>
                  </div>
                  {locations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant={!floorFilter ? 'default' : 'outline'} onClick={() => setFloorFilter('')}>
                        All
                      </Button>
                      {locations.map((l) => (
                        <Button
                          key={l}
                          size="sm"
                          variant={floorFilter === l ? 'default' : 'outline'}
                          onClick={() => setFloorFilter(floorFilter === l ? '' : l)}
                        >
                          {l}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {venuesLoading ? (
                  <TableSkeleton rows={3} />
                ) : visibleRooms.length === 0 ? (
                  <EmptyState
                    icon={BedDouble}
                    title={`No ${t.place.many.toLowerCase()} yet`}
                    description={`Add ${t.place.many.toLowerCase()} so arrivals can be assigned to one.`}
                    action={{ label: `Manage ${t.place.many.toLowerCase()}`, onClick: () => router.push('/venues') }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                    {visibleRooms.map((v) => {
                      const inUse = occupiedRooms.has(v.name ?? '');
                      const offline = (v.status ?? 'active') !== 'active';
                      return (
                        <Tooltip key={v.id}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => router.push('/venues')}
                              className={cn(
                                'rounded-lg border p-3 text-left transition-all hover:shadow-sm',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                offline
                                  ? 'border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                                  : inUse
                                  ? 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                                  : 'border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400',
                              )}
                            >
                              <p className="truncate text-sm font-bold">{v.name}</p>
                              <p className="truncate text-[11px] opacity-90">{v.type ?? '—'}</p>
                              <p className="mt-1 truncate text-[10px] font-medium opacity-80">
                                {offline ? 'Unavailable' : inUse ? 'In use' : 'Free'}
                              </p>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {v.name} · {v.type ?? '—'}
                            {v.location ? ` · ${v.location}` : ''} ·{' '}
                            {offline ? 'unavailable' : inUse ? 'in use today' : 'free'}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Detail */}
        {selected && (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {selected.customerName || selected.guestName}
                    {selected.customerTier && selected.customerTier !== 'Standard' && (
                      <Badge variant="warning" className="gap-1">
                        <Crown className="h-3 w-3" /> {selected.customerTier}
                      </Badge>
                    )}
                    <StatusBadge status={selected.status} />
                  </CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {selected.service || selected.serviceName || t.visit.one} · {selected.startTime}
                    {selected.room ? ` · ${t.place.one} ${selected.room}` : ` · no ${t.place.one.toLowerCase()} assigned`}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Time" value={selected.startTime ?? '—'} />
                <Field label={t.place.one} value={selected.room || 'Unassigned'} />
                <Field label="Amount" value={formatCurrency(Number(selected.amount ?? 0))} />
                <Field label="Payment" value={selected.paymentStatus ?? '—'} />
              </div>

              {selected.notes && <p className="rounded bg-muted px-3 py-2 text-sm">{selected.notes}</p>}

              <Separator />

              <div className="flex flex-wrap gap-2">
                {pileOf(selected) === 'arriving' && (
                  <Button size="sm" onClick={() => checkIn(selected)} loading={updateStatus.isPending}>
                    <KeyRound className="mr-2 h-4 w-4" /> Check in
                  </Button>
                )}
                {pileOf(selected) === 'in_house' && (
                  <Button size="sm" onClick={() => checkOut(selected)} loading={updateStatus.isPending}>
                    <LogOut className="mr-2 h-4 w-4" /> Check out
                  </Button>
                )}
                {unpaid && (
                  <Button
                    size="sm"
                    variant={pileOf(selected) === 'departing' ? 'default' : 'outline'}
                    onClick={() => setPayOpen(true)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Record payment
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(payerName ? `/payments?search=${encodeURIComponent(payerName)}` : '/payments')}
                >
                  <Receipt className="mr-2 h-4 w-4" /> Payment records
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push('/calendar')}>
                  <CalendarDays className="mr-2 h-4 w-4" /> Manage in the calendar
                </Button>
              </div>
              {pileOf(selected) === 'departing' && unpaid && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Checked out with {formatCurrency(Number(selected.amount ?? 0))} still to settle.
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

function Pile({
  title, icon: Icon, tone, rows, loading, emptyText, onSelect, selectedId, t,
}: {
  title: string;
  icon: typeof LogIn;
  tone: string;
  rows: Appointment[];
  loading: boolean;
  emptyText: string;
  onSelect: (a: Appointment) => void;
  selectedId?: string;
  t: ReturnType<typeof useTerminology>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-4 w-4', tone)} aria-hidden="true" />
          {title}
          <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">{rows.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <TableSkeleton rows={3} />
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          rows.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selectedId === a.id && 'border-primary bg-primary/5',
              )}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {getInitials(a.customerName || a.guestName || '?')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.customerName || a.guestName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.room ? `${t.place.one} ${a.room}` : `No ${t.place.one.toLowerCase()}`} · {a.startTime}
                </p>
              </div>
              {a.paymentStatus && a.paymentStatus !== 'paid' && Number(a.amount ?? 0) > 0 && (
                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                  {formatCurrency(Number(a.amount))}
                </span>
              )}
            </button>
          ))
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
