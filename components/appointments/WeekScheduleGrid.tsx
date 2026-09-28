'use client';

import { useMemo } from 'react';
import { CalendarX2 } from 'lucide-react';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { assignLanes, computeTimeRange, formatHourLabel, toMinutes, weekDates } from '@/lib/calendar-range';
import type { Appointment } from '@/types';

const PX_PER_MIN = 1.6;
const MIN_CARD_PX = 56;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeekScheduleGridProps {
  /** Monday, YYYY-MM-DD. */
  weekStart: string;
  appointments: Appointment[];
  today: string;
  onSelectAppointment: (appt: Appointment) => void;
  /** Open that day in the day view. */
  onSelectDay?: (date: string) => void;
}

/**
 * A week at a glance, one column per day, trimmed to the hours in use: an hour before the
 * week's first appointment to an hour after its last. Every staff member shares a day column,
 * so overlapping bookings sit side by side.
 */
export function WeekScheduleGrid({ weekStart, appointments, today, onSelectAppointment, onSelectDay }: WeekScheduleGridProps) {
  const days = weekDates(weekStart);

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const d of days) map.set(d, []);
    for (const a of appointments) {
      if (a.date && map.has(a.date)) map.get(a.date)!.push(a);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, weekStart]);

  const range = computeTimeRange(appointments.filter((a) => a.date && byDay.has(a.date)));
  if (!range) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="No appointments this week"
        description="Nothing is booked between these dates."
      />
    );
  }

  const { start, end } = range;
  const heightPx = (end - start) * PX_PER_MIN;
  const hourMarks: number[] = [];
  for (let t = start; t <= end; t += 60) hourMarks.push(t);

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <div className="flex" style={{ minWidth: `${56 + days.length * 140}px` }}>
          {/* Time gutter */}
          <div className="w-14 shrink-0 border-r bg-muted/20">
            <div className="flex h-12 items-center justify-center border-b bg-muted/40 text-[10px] font-medium uppercase text-muted-foreground">
              Time
            </div>
            <div className="relative" style={{ height: heightPx }}>
              {hourMarks.map((t, idx) => (
                <div
                  key={t}
                  className={cn(
                    'absolute right-1.5 text-[10px] text-muted-foreground',
                    idx === hourMarks.length - 1 ? '-translate-y-full' : 'translate-y-0.5'
                  )}
                  style={{ top: (t - start) * PX_PER_MIN }}
                >
                  {formatHourLabel(t)}
                </div>
              ))}
            </div>
          </div>

          {days.map((date, i) => {
            const dayAppts = byDay.get(date) ?? [];
            const lanes = assignLanes(dayAppts);
            const isToday = date === today;
            return (
              <div key={date} className={cn('relative min-w-[140px] flex-1 border-r last:border-r-0', isToday && 'bg-primary/[0.03]')}>
                <button
                  type="button"
                  onClick={() => onSelectDay?.(date)}
                  className={cn(
                    'flex h-12 w-full flex-col items-center justify-center border-b bg-muted/40 px-2 text-center transition-colors hover:bg-accent',
                    isToday && 'bg-primary/10'
                  )}
                  aria-label={`Open ${date} in day view`}
                >
                  <span className={cn('text-xs font-semibold leading-tight', isToday && 'text-primary')}>
                    {WEEKDAYS[i]} {Number(date.slice(8, 10))}
                  </span>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {dayAppts.length} {dayAppts.length === 1 ? 'appointment' : 'appointments'}
                  </span>
                </button>
                <div className="relative" style={{ height: heightPx }}>
                  {hourMarks.map((t) => (
                    <div
                      key={t}
                      className="absolute left-0 right-0 border-t border-dashed border-border/70"
                      style={{ top: (t - start) * PX_PER_MIN }}
                    />
                  ))}
                  {dayAppts.map((a, idx) => {
                    if (!a.startTime) return null;
                    const top = Math.max(0, (toMinutes(a.startTime) - start) * PX_PER_MIN);
                    const height = Math.max(MIN_CARD_PX, (a.duration ?? 30) * PX_PER_MIN - 2);
                    const { lane, lanes: laneCount } = lanes[idx];
                    return (
                      <div
                        key={a.id}
                        className="absolute z-[1] px-0.5"
                        style={{ top, height, left: `${(lane / laneCount) * 100}%`, width: `${100 / laneCount}%` }}
                      >
                        <AppointmentCard appointment={a} onClick={() => onSelectAppointment(a)} className="h-full" showStaff />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
