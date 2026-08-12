'use client';

import { useState } from 'react';
import { Calendar, CalendarDays, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCalendar, useCalendarEvents } from '@/hooks/useCalendar';

type Tab = 'events' | 'schedule';

const EVENT_TYPE_BADGE: Record<string, string> = {
  event:       'bg-blue-100 text-blue-800',
  appointment: 'bg-green-100 text-green-800',
  staff_shift: 'bg-purple-100 text-purple-800',
};

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-green-100 text-green-800',
  upcoming:  'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

function fmtDT(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export default function CalendarPage() {
  const [tab, setTab] = useState<Tab>('events');

  const { data: eventsData, isLoading: eventsLoading } = useCalendarEvents();
  const { data: dayData,    isLoading: dayLoading }     = useCalendar();

  const month    = eventsData?.month ?? '';
  const entries  = eventsData?.entries ?? [];
  const dayDate  = dayData?.date ?? '';
  const staffCols = dayData?.staffColumns ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          {tab === 'events'
            ? (month ? `Month: ${month}` : 'Monthly events')
            : (dayDate ? `Day view: ${dayDate}` : 'Staff schedule')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: 'events',   label: 'Month Events',  Icon: Calendar },
          { key: 'schedule', label: 'Day Schedule',  Icon: CalendarDays },
        ] as { key: Tab; label: string; Icon: any }[]).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Month Events ── */}
      {tab === 'events' && (
        <div className="space-y-3">
          {eventsLoading && <p className="text-muted-foreground py-10 text-center">Loading events…</p>}
          {!eventsLoading && entries.length === 0 && (
            <p className="text-muted-foreground py-10 text-center">No events this month.</p>
          )}
          {entries.map((entry) => (
            <Card key={entry.id} className="card-hover">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.date ? fmtDT(entry.date) : ''}
                    {entry.endDate ? ` → ${fmtDT(entry.endDate)}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  {entry.type && (
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', EVENT_TYPE_BADGE[entry.type] ?? 'bg-gray-100 text-gray-700')}>
                      {entry.type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {entry.status && (
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[entry.status] ?? 'bg-gray-100 text-gray-700')}>
                      {entry.status}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Day Schedule ── */}
      {tab === 'schedule' && (
        <div className="space-y-4">
          {dayLoading && <p className="text-muted-foreground py-10 text-center">Loading schedule…</p>}
          {!dayLoading && staffCols.length === 0 && (
            <p className="text-muted-foreground py-10 text-center">No staff schedule for today.</p>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staffCols.map((col) => (
              <Card key={col.staff.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {col.staff.shortName ?? col.staff.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate">{col.staff.name}</p>
                      {col.staff.rooms && (
                        <p className="text-xs font-normal text-muted-foreground">{col.staff.rooms}</p>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(!col.appointments || col.appointments.length === 0) && (
                    <p className="text-xs text-muted-foreground">No appointments today</p>
                  )}
                  {col.appointments?.map((appt, i) => (
                    <div key={appt.id ?? i} className="flex items-center gap-2 rounded-md border px-3 py-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{appt.title ?? appt.guestName ?? '—'}</p>
                        {appt.startTime && (
                          <p className="text-xs text-muted-foreground">
                            {appt.startTime}{appt.endTime ? ` – ${appt.endTime}` : ''}
                          </p>
                        )}
                      </div>
                      {appt.status && (
                        <Badge variant="outline" className="text-xs shrink-0">{appt.status}</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}