'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { DayScheduleGrid } from '@/components/appointments/DayScheduleGrid';
import { MonthCalendarGrid } from '@/components/appointments/MonthCalendarGrid';
import { AppointmentListTable } from '@/components/appointments/AppointmentListTable';
import { AppointmentDetailDialog } from '@/components/appointments/AppointmentDetailDialog';
import { CreateAppointmentDialog } from '@/components/dialogs/CreateAppointmentDialog';
import { useCalendar, useCalendarEvents } from '@/hooks/useCalendar';
import { useAppointments } from '@/hooks/useAppointments';
import { cn, getFriendlyErrorMessage } from '@/lib/utils';
import type { Appointment } from '@/types';

type ViewMode = 'day' | 'month';

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Shifts a "YYYY-MM-DD" string by whole days using UTC arithmetic, so this never drifts across a local timezone/DST midnight boundary. */
function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function formatDayHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatMonthHeading(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  if (!y || !m) return monthStr;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [selectedMonth, setSelectedMonth] = useState(todayIso().slice(0, 7));
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null);

  const dayQuery = useCalendar(selectedDate, { enabled: view === 'day' });
  const monthQuery = useCalendarEvents(selectedMonth, { enabled: view === 'month' });
  const listQuery = useAppointments({ date: selectedDate }, { enabled: view === 'day' });

  function goToday() {
    const t = todayIso();
    setSelectedDate(t);
    setSelectedMonth(t.slice(0, 7));
  }

  function goPrevDay() {
    setSelectedDate((d) => shiftDate(d, -1));
  }

  function goNextDay() {
    setSelectedDate((d) => shiftDate(d, 1));
  }

  function handleDateInputChange(value: string) {
    if (!value) return;
    setSelectedDate(value);
    setSelectedMonth(value.slice(0, 7));
  }

  function handleMonthInputChange(value: string) {
    if (!value) return;
    setSelectedMonth(value);
  }

  function handleSelectDateFromMonth(date: string) {
    setSelectedDate(date);
    setView('day');
  }

  const staffColumns = dayQuery.data?.staffColumns ?? [];
  const totalToday = dayQuery.data?.totalAppointments;
  const onSiteToday = dayQuery.data?.onSite;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            {view === 'day' ? formatDayHeading(selectedDate) : formatMonthHeading(selectedMonth)}
            {view === 'day' && typeof totalToday === 'number' && (
              <span> · {totalToday} appointment{totalToday === 1 ? '' : 's'}{typeof onSiteToday === 'number' ? ` · ${onSiteToday} on site` : ''}</span>
            )}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          New Appointment
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border p-1">
          {([
            { key: 'day', label: 'Day', Icon: CalendarDays },
            { key: 'month', label: 'Month', Icon: CalendarIcon },
          ] as { key: ViewMode; label: string; Icon: typeof CalendarDays }[]).map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                view === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          {view === 'day' && (
            <>
              <Button variant="outline" size="icon-sm" onClick={goPrevDay} aria-label="Previous day">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateInputChange(e.target.value)}
                className="h-8 w-[150px]"
                aria-label="Select date"
              />
              <Button variant="outline" size="icon-sm" onClick={goNextDay} aria-label="Next day">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          {view === 'month' && (
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthInputChange(e.target.value)}
              className="h-8 w-[150px]"
              aria-label="Select month"
            />
          )}
        </div>
      </div>

      {/* Day view */}
      {view === 'day' && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Staff Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {dayQuery.isLoading ? (
                <Skeleton className="h-[420px] w-full rounded-lg" />
              ) : dayQuery.isError ? (
                <ErrorState
                  title="Unable to load the day schedule"
                  message={getFriendlyErrorMessage(dayQuery.error)}
                  onRetry={() => dayQuery.refetch()}
                />
              ) : (
                <DayScheduleGrid staffColumns={staffColumns} onSelectAppointment={setDetailAppt} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <AppointmentListTable
                appointments={listQuery.data ?? []}
                isLoading={listQuery.isLoading}
                isError={listQuery.isError}
                error={listQuery.error}
                onRetry={() => listQuery.refetch()}
                onSelect={setDetailAppt}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Month view */}
      {view === 'month' && (
        <Card>
          <CardContent className="p-4">
            {monthQuery.isLoading ? (
              <Skeleton className="h-[500px] w-full rounded-lg" />
            ) : monthQuery.isError ? (
              <ErrorState
                title="Unable to load the month calendar"
                message={getFriendlyErrorMessage(monthQuery.error)}
                onRetry={() => monthQuery.refetch()}
              />
            ) : (monthQuery.data?.entries.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Users className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium">No appointments or events</p>
                <p className="text-xs text-muted-foreground">Nothing is scheduled for {formatMonthHeading(selectedMonth)}.</p>
              </div>
            ) : (
              <MonthCalendarGrid
                month={selectedMonth}
                entries={monthQuery.data?.entries ?? []}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDateFromMonth}
              />
            )}
          </CardContent>
        </Card>
      )}

      <CreateAppointmentDialog open={createOpen} onOpenChange={setCreateOpen} defaultDate={selectedDate} />
      <AppointmentDetailDialog
        appointment={detailAppt}
        open={!!detailAppt}
        onOpenChange={(v) => !v && setDetailAppt(null)}
      />
    </div>
  );
}
