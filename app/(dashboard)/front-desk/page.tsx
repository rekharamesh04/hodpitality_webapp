'use client';

import { useMemo, useState } from 'react';
import {
  ConciergeBell, LogIn, LogOut, BedDouble, AlertTriangle, Crown, Plus, RefreshCw,
  Sparkles, KeyRound, Clock, CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { popup } from '@/lib/popup';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import { useTerminology } from '@/hooks';
import {
  ROOMS, ROOM_STATE_CLASS, ROOM_STATE_LABEL, STAYS,
  arrivalsAtRisk, readyRoomsFor, staysIn,
  type RoomState, type Stay,
} from '@/lib/mock/hotel';

/**
 * The front desk board.
 *
 * A desk works in three piles — who is arriving, who is here, who is leaving —
 * and the question that decides the day is whether a clean room of the right
 * type exists for each arrival. That pairing is the point of this screen: an
 * arrivals list that does not know about housekeeping is a list that cannot
 * tell you which check-in is about to go wrong.
 *
 * Static for now, like the pharmacy and spa screens: it renders
 * lib/mock/hotel.ts and calls no API. The `frontdesk` module gates it.
 */

export default function FrontDeskPage() {
  const t = useTerminology();
  const [selected, setSelected] = useState<Stay | null>(null);
  const [floor, setFloor] = useState<number | null>(null);

  const arrivals = staysIn('arriving');
  const inHouse = staysIn('in_house');
  const departures = [...staysIn('departing'), ...staysIn('departed')];
  const atRisk = arrivalsAtRisk();

  const roomsReady = ROOMS.filter((r) => r.state === 'ready').length;
  const openRequests = STAYS.reduce((n, s) => n + s.openRequests.length, 0);
  const outstanding = STAYS.reduce((sum, s) => sum + s.balance, 0);

  const visibleRooms = useMemo(
    () => (floor === null ? ROOMS : ROOMS.filter((r) => r.floor === floor)),
    [floor],
  );
  const floors = useMemo(() => Array.from(new Set(ROOMS.map((r) => r.floor))).sort(), []);

  function notWired(what: string) {
    popup.info(`${what} is not wired up yet`, {
      description: 'This board is a static prototype — it renders local data and calls no API.',
    });
  }

  const STATS = [
    { label: 'Arrivals',            value: arrivals.length,   tone: 'text-primary' },
    { label: 'Departures',          value: staysIn('departing').length, tone: 'text-amber-700 dark:text-amber-400' },
    { label: 'In house',            value: inHouse.length,    tone: 'text-foreground' },
    { label: `${t.place.many} ready`, value: roomsReady,      tone: 'text-green-700 dark:text-green-400' },
    { label: 'Open requests',       value: openRequests,      tone: 'text-cyan-700 dark:text-cyan-400' },
    { label: 'Outstanding',         value: formatCurrency(outstanding), tone: 'text-foreground' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Front Desk</h1>
            <p className="text-muted-foreground">
              Today&rsquo;s arrivals, departures and {t.place.one.toLowerCase()} readiness
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => notWired('Refresh')} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => notWired('Walk-in booking')}>
              <Plus className="mr-2 h-4 w-4" /> Walk-in
            </Button>
            <Button size="sm" onClick={() => notWired('Check-in')}>
              <LogIn className="mr-2 h-4 w-4" /> Check in
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="px-4 pb-3 pt-4">
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className={cn('mt-1 text-2xl font-bold tabular-nums', s.tone)}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* The thing that ruins a check-in */}
        {atRisk.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {atRisk.length} arrival{atRisk.length === 1 ? '' : 's'} with no clean {t.place.one.toLowerCase()} of the booked type
              </p>
              <p className="text-xs text-amber-900/80 dark:text-amber-400/80">
                {atRisk.map((s) => `${s.guestName} (${s.roomType}, ${s.time})`).join(' · ')} — chase housekeeping or move the booking.
              </p>
            </div>
          </div>
        )}

        {/* Three piles */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StayColumn
            title="Arriving"
            icon={LogIn}
            tone="text-primary"
            stays={arrivals}
            emptyText="No more arrivals today."
            onSelect={setSelected}
            selectedId={selected?.id}
            roomHint={(s) => {
              const ready = readyRoomsFor(s.roomType);
              return ready.length
                ? { text: `${ready.length} ${s.roomType.toLowerCase()} ready`, ok: true }
                : { text: `No ${s.roomType.toLowerCase()} ready`, ok: false };
            }}
          />
          <StayColumn
            title="In house"
            icon={BedDouble}
            tone="text-foreground"
            stays={inHouse}
            emptyText={`No ${t.person.many.toLowerCase()} in house.`}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
          <StayColumn
            title="Departing"
            icon={LogOut}
            tone="text-amber-700 dark:text-amber-400"
            stays={departures}
            emptyText="No departures today."
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        </div>

        {/* Housekeeping */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{t.place.many}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  An arrival can only be let in when a {t.place.one.toLowerCase()} of its type is clean.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant={floor === null ? 'default' : 'outline'} onClick={() => setFloor(null)}>
                  All floors
                </Button>
                {floors.map((f) => (
                  <Button key={f} size="sm" variant={floor === f ? 'default' : 'outline'} onClick={() => setFloor(f)}>
                    Floor {f}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {visibleRooms.map((r) => (
                <Tooltip key={r.number}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => notWired(`Updating ${t.place.one.toLowerCase()} ${r.number}`)}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-all hover:shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        ROOM_STATE_CLASS[r.state],
                      )}
                    >
                      <p className="text-sm font-bold tabular-nums">{r.number}</p>
                      <p className="truncate text-[11px] opacity-90">{r.type}</p>
                      <p className="mt-1 truncate text-[10px] font-medium opacity-80">
                        {ROOM_STATE_LABEL[r.state]}
                      </p>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {r.type} · floor {r.floor} · {ROOM_STATE_LABEL[r.state]}
                    {r.note ? ` — ${r.note}` : ''}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
              {(Object.keys(ROOM_STATE_LABEL) as RoomState[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span className={cn('h-2.5 w-2.5 rounded-sm border', ROOM_STATE_CLASS[k])} aria-hidden="true" />
                  {ROOM_STATE_LABEL[k]}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail */}
        {selected && (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {selected.guestName}
                    {selected.tier && selected.tier !== 'Standard' && (
                      <Badge variant="warning" className="gap-1">
                        <Crown className="h-3 w-3" /> {selected.tier}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {selected.roomType} · {selected.nights} night{selected.nights === 1 ? '' : 's'} ·{' '}
                    {selected.adults} adult{selected.adults === 1 ? '' : 's'}
                    {selected.roomNumber ? ` · ${t.place.one} ${selected.roomNumber}` : ''}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected.flag && (
                <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold">Say this at the desk</p>
                    <p className="text-xs text-muted-foreground">{selected.flag}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label={selected.state === 'departing' ? 'Check out by' : 'Expected'} value={selected.eta ?? selected.time} />
                <Field label={`${t.place.one} type`} value={selected.roomType} />
                <Field label="Balance" value={formatCurrency(selected.balance)} />
                <Field
                  label="Availability"
                  value={
                    selected.state === 'arriving'
                      ? `${readyRoomsFor(selected.roomType).length} ready`
                      : '—'
                  }
                />
              </div>

              {selected.openRequests.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Open requests</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selected.openRequests.map((r) => (
                      <Badge key={r} variant="outline" className="gap-1">
                        <ConciergeBell className="h-3 w-3" /> {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-2">
                {selected.state === 'arriving' && (
                  <Button size="sm" onClick={() => notWired('Check-in')}>
                    <KeyRound className="mr-2 h-4 w-4" /> Check in &amp; assign {t.place.one.toLowerCase()}
                  </Button>
                )}
                {selected.state === 'departing' && (
                  <Button size="sm" onClick={() => notWired('Check-out')}>
                    <LogOut className="mr-2 h-4 w-4" /> Check out
                  </Button>
                )}
                {selected.balance > 0 && (
                  <Button size="sm" variant="outline" onClick={() => notWired('Taking payment')}>
                    <CreditCard className="mr-2 h-4 w-4" /> Settle {formatCurrency(selected.balance)}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => notWired('Late checkout')}>
                  <Clock className="mr-2 h-4 w-4" /> Late checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}

function StayColumn({
  title, icon: Icon, tone, stays, emptyText, onSelect, selectedId, roomHint,
}: {
  title: string;
  icon: typeof LogIn;
  tone: string;
  stays: Stay[];
  emptyText: string;
  onSelect: (s: Stay) => void;
  selectedId?: string;
  roomHint?: (s: Stay) => { text: string; ok: boolean };
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-4 w-4', tone)} aria-hidden="true" />
          {title}
          <span className="ml-auto text-sm font-normal text-muted-foreground tabular-nums">{stays.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stays.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          stays.map((s) => {
            const hint = roomHint?.(s);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selectedId === s.id && 'border-primary bg-primary/5',
                  s.state === 'departed' && 'opacity-60',
                )}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {getInitials(s.guestName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{s.guestName}</p>
                    {s.tier && s.tier !== 'Standard' && (
                      <Crown className="h-3 w-3 shrink-0 text-amber-500" aria-label={s.tier} />
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.roomNumber ? `Room ${s.roomNumber}` : s.roomType} · {s.time}
                    {s.openRequests.length > 0 && ` · ${s.openRequests.length} request${s.openRequests.length === 1 ? '' : 's'}`}
                  </p>
                  {hint && (
                    <p className={cn(
                      'mt-1 truncate text-[11px] font-medium',
                      hint.ok ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400',
                    )}>
                      {hint.text}
                    </p>
                  )}
                </div>
                {s.balance > 0 && (
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                    {formatCurrency(s.balance)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
