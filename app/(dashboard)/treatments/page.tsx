'use client';

import { useMemo, useState } from 'react';
import {
  Sparkles, Clock, AlertTriangle, CircleDot, Wrench, UserCheck, Plus, RefreshCw, Repeat,
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
  BOOKINGS, SPA_CLOSES, SPA_NOW, SPA_OPENS, SUITES, THERAPISTS,
  bookingsFor, endOf, gapBefore, hhmm, minutesRemaining,
  type Booking, type TreatmentState,
} from '@/lib/mock/spa';

/**
 * The treatment board.
 *
 * A spa sells time in a room, so the thing worth putting on one screen is the
 * day laid out per suite: what is running, what is late, and where the unsold
 * gaps are. A list of bookings sorted by time cannot show a gap — the absence
 * of a booking has no row — which is why this is a timeline rather than a
 * table.
 *
 * Static for now, like the pharmacy screens: it renders lib/mock/spa.ts and
 * calls no API. The `treatments` module gates it, so only an industry that
 * lists that module is offered the page.
 */

const STATE_STYLE: Record<TreatmentState, { bar: string; label: string; badge: string }> = {
  booked:       { bar: 'bg-slate-200 dark:bg-slate-700',                    label: 'Booked',       badge: 'muted' },
  arrived:      { bar: 'bg-amber-300 dark:bg-amber-600',                    label: 'Arrived',      badge: 'warning' },
  in_treatment: { bar: 'bg-primary',                                        label: 'In treatment', badge: 'default' },
  turnaround:   { bar: 'bg-cyan-300 dark:bg-cyan-700',                      label: 'Turnaround',   badge: 'info' },
  complete:     { bar: 'bg-green-300 dark:bg-green-800',                    label: 'Complete',     badge: 'success' },
  no_show:      { bar: 'bg-red-200 dark:bg-red-900',                        label: 'No show',      badge: 'destructive' },
};

const DAY_MINUTES = SPA_CLOSES - SPA_OPENS;

/** A booking's position on the day, as percentages of the working day. */
function geometry(b: Booking) {
  const from = b.start + (b.startedLateBy ?? 0);
  return {
    left: ((from - SPA_OPENS) / DAY_MINUTES) * 100,
    width: (b.durationMin / DAY_MINUTES) * 100,
  };
}

export default function TreatmentBoardPage() {
  const t = useTerminology();
  const [therapist, setTherapist] = useState<string>('');
  const [selected, setSelected] = useState<Booking | null>(null);

  const visible = useMemo(
    () => (therapist ? BOOKINGS.filter((b) => b.therapist.includes(therapist)) : BOOKINGS),
    [therapist],
  );

  const running = BOOKINGS.filter((b) => b.state === 'in_treatment');
  const arriving = BOOKINGS.filter((b) => b.state === 'arrived');
  const overrunning = running.filter((b) => minutesRemaining(b) < 0);
  const lateStarts = BOOKINGS.filter((b) => (b.startedLateBy ?? 0) > 0);
  const freeSuites = SUITES.filter(
    (s) => !s.outOfService && !BOOKINGS.some((b) => b.suiteId === s.id && b.state === 'in_treatment'),
  );
  const dayRevenue = BOOKINGS.filter((b) => b.state !== 'no_show').reduce((sum, b) => sum + b.price, 0);

  // Unsold minutes between bookings — the number a spa manager is hunting for.
  const idleMinutes = BOOKINGS.reduce((sum, b) => {
    const gap = gapBefore(b);
    return sum + (gap && gap > 0 ? gap : 0);
  }, 0);

  function notWired(what: string) {
    popup.info(`${what} is not wired up yet`, {
      description: 'This board is a static prototype — it renders local data and calls no API.',
    });
  }

  const nowLeft = ((SPA_NOW - SPA_OPENS) / DAY_MINUTES) * 100;
  const hourMarks = Array.from(
    { length: Math.floor(DAY_MINUTES / 60) + 1 },
    (_, i) => SPA_OPENS + i * 60,
  );

  const STATS = [
    { label: 'In treatment', value: running.length,    tone: 'text-primary' },
    { label: 'In the lounge', value: arriving.length,  tone: 'text-amber-700 dark:text-amber-400' },
    { label: `${t.place.many} free`, value: freeSuites.length, tone: 'text-green-700 dark:text-green-400' },
    { label: 'Running late', value: lateStarts.length + overrunning.length, tone: 'text-red-700 dark:text-red-400' },
    { label: 'Idle suite time', value: `${idleMinutes}m`, tone: 'text-muted-foreground' },
    { label: 'Booked today', value: formatCurrency(dayRevenue), tone: 'text-foreground' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{t.visit.one} Board</h1>
            <p className="text-muted-foreground">
              {SUITES.length} {t.place.many.toLowerCase()} · {hhmm(SPA_OPENS)}–{hhmm(SPA_CLOSES)} · now {hhmm(SPA_NOW)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => notWired('Refresh')} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => notWired(`New ${t.visit.one.toLowerCase()}`)}>
              <Plus className="mr-2 h-4 w-4" /> New {t.visit.one}
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

        {/* Therapist filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{t.practitioner}:</span>
          <Button size="sm" variant={!therapist ? 'default' : 'outline'} onClick={() => setTherapist('')}>
            Everyone
          </Button>
          {THERAPISTS.map((name) => (
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Timeline */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today</CardTitle>
              <p className="text-xs text-muted-foreground">
                Gaps between blocks are unsold {t.place.one.toLowerCase()} time.
              </p>
            </CardHeader>
            <CardContent className="space-y-1 overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Hour ruler */}
                <div className="relative mb-2 ml-[86px] h-5 border-b">
                  {hourMarks.map((m) => (
                    <span
                      key={m}
                      className="absolute -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground"
                      style={{ left: `${((m - SPA_OPENS) / DAY_MINUTES) * 100}%` }}
                    >
                      {hhmm(m)}
                    </span>
                  ))}
                </div>

                {SUITES.map((suite) => {
                  const rows = bookingsFor(suite.id).filter((b) => visible.includes(b));
                  return (
                    <div key={suite.id} className="flex items-center gap-2 py-1.5">
                      <div className="w-[78px] shrink-0">
                        <p className="truncate text-xs font-semibold">{suite.name}</p>
                        <p className="truncate text-[10px] capitalize text-muted-foreground">{suite.capability}</p>
                      </div>

                      <div className="relative h-11 flex-1 rounded-md border bg-muted/30">
                        {/* Now marker */}
                        <span
                          className="absolute inset-y-0 z-20 w-px bg-red-500"
                          style={{ left: `${nowLeft}%` }}
                          aria-hidden="true"
                        />

                        {suite.outOfService ? (
                          <div className="absolute inset-0 flex items-center gap-2 rounded-md bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(148,163,184,0.25)_6px,rgba(148,163,184,0.25)_12px)] px-3">
                            <Wrench className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <span className="truncate text-[11px] text-muted-foreground">{suite.outOfService}</span>
                          </div>
                        ) : (
                          rows.map((b) => {
                            const g = geometry(b);
                            const style = STATE_STYLE[b.state];
                            const remaining = minutesRemaining(b);
                            const overrun = b.state === 'in_treatment' && remaining < 0;
                            return (
                              <Tooltip key={b.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => setSelected(b)}
                                    style={{ left: `${g.left}%`, width: `${g.width}%` }}
                                    className={cn(
                                      'absolute inset-y-1 z-10 overflow-hidden rounded px-1.5 text-left transition-all',
                                      'hover:z-30 hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                      style.bar,
                                      b.state === 'in_treatment' && 'text-primary-foreground',
                                      overrun && 'ring-2 ring-red-500',
                                      b.state === 'no_show' && 'opacity-60 line-through',
                                    )}
                                  >
                                    <span className="block truncate text-[10px] font-semibold leading-tight">
                                      {b.clientName}
                                    </span>
                                    <span className="block truncate text-[9px] leading-tight opacity-80">
                                      {b.treatment}
                                    </span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="font-semibold">{b.clientName} — {b.treatment}</p>
                                  <p className="text-xs">
                                    {hhmm(b.start)}–{hhmm(endOf(b))} · {b.therapist} · {style.label}
                                  </p>
                                  {b.startedLateBy ? (
                                    <p className="text-xs text-amber-400">Started {b.startedLateBy}m late</p>
                                  ) : null}
                                  {overrun && <p className="text-xs text-red-400">Overrunning by {-remaining}m</p>}
                                </TooltipContent>
                              </Tooltip>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 text-[11px] text-muted-foreground">
                {(Object.keys(STATE_STYLE) as TreatmentState[]).map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <span className={cn('h-2.5 w-2.5 rounded-sm', STATE_STYLE[k].bar)} aria-hidden="true" />
                    {STATE_STYLE[k].label}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-px bg-red-500" aria-hidden="true" /> now
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Right rail */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Happening now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {running.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No {t.visit.many.toLowerCase()} in progress.</p>
                ) : (
                  running.map((b) => {
                    const remaining = minutesRemaining(b);
                    const suite = SUITES.find((s) => s.id === b.suiteId);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelected(b)}
                        className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {getInitials(b.clientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{b.clientName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {suite?.name} · {b.therapist}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 text-xs font-semibold tabular-nums',
                            remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
                          )}
                        >
                          {remaining < 0 ? `+${-remaining}m` : `${remaining}m`}
                        </span>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {arriving.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Waiting in the lounge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {arriving.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{b.clientName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {b.treatment} · {hhmm(b.start)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => notWired('Starting the treatment')}>
                        Start
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {(overrunning.length > 0 || lateStarts.length > 0) && (
              <Card className="border-amber-300 dark:border-amber-900">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    Running late
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    A late finish pushes the next client, so this is the queue to fix first.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[...overrunning, ...lateStarts.filter((b) => !overrunning.includes(b))].map((b) => {
                    const remaining = minutesRemaining(b);
                    return (
                      <div key={b.id} className="flex items-start gap-2 text-sm">
                        <CircleDot className="mt-1 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="font-medium">{b.clientName}</span>{' '}
                          <span className="text-muted-foreground">
                            {b.state === 'in_treatment' && remaining < 0
                              ? `overrunning by ${-remaining}m`
                              : `started ${b.startedLateBy}m late`}
                          </span>
                        </span>
                      </div>
                    );
                  })}
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
                  <CardTitle className="flex items-center gap-2 text-base">
                    {selected.clientName}
                    {selected.returning && (
                      <Badge variant="secondary" className="gap-1">
                        <Repeat className="h-3 w-3" /> Returning
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {selected.treatment} · {hhmm(selected.start)}–{hhmm(endOf(selected))} · {selected.therapist}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected.careNote && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Read before starting</p>
                    <p className="text-xs text-amber-900/80 dark:text-amber-400/80">{selected.careNote}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label={t.place.one} value={SUITES.find((s) => s.id === selected.suiteId)?.name ?? '—'} />
                <Field label="Duration" value={`${selected.durationMin} min`} />
                <Field label="Price" value={formatCurrency(selected.price)} />
                <Field label="Status" value={STATE_STYLE[selected.state].label} />
              </div>

              {selected.addOns?.length ? (
                <div>
                  <p className="text-xs text-muted-foreground">Add-ons</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selected.addOns.map((a) => <Badge key={a} variant="outline">{a}</Badge>)}
                  </div>
                </div>
              ) : null}

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => notWired('Checking the client in')}>
                  <UserCheck className="mr-2 h-4 w-4" /> Check in
                </Button>
                <Button size="sm" variant="outline" onClick={() => notWired('Extending the treatment')}>
                  <Clock className="mr-2 h-4 w-4" /> Extend 15m
                </Button>
                <Button size="sm" variant="outline" onClick={() => notWired(`Moving ${t.place.one.toLowerCase()}`)}>
                  <Sparkles className="mr-2 h-4 w-4" /> Move {t.place.one.toLowerCase()}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
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
