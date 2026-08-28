'use client';

import { Users2 } from 'lucide-react';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import type { CalendarDayView, Appointment } from '@/types';

const PX_PER_MIN = 2.2;
const DEFAULT_START = 8 * 60;
const DEFAULT_END = 18 * 60;

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatHourLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const ampm = h < 12 ? 'AM' : 'PM';
  const dh = h % 12 === 0 ? 12 : h % 12;
  return `${dh} ${ampm}`;
}

function computeRange(staffColumns: CalendarDayView['staffColumns']): { start: number; end: number } {
  const all = staffColumns.flatMap((c) => c.appointments ?? []);
  const points = all.flatMap((a) => {
    if (!a.startTime) return [];
    const s = toMinutes(a.startTime);
    return [s, s + (a.duration ?? 30)];
  });
  let start = points.length ? Math.min(...points) : DEFAULT_START;
  let end = points.length ? Math.max(...points) : DEFAULT_END;
  start = Math.min(Math.floor(start / 60) * 60, DEFAULT_START);
  end = Math.max(Math.ceil(end / 60) * 60, DEFAULT_END);
  return { start, end };
}

interface DayScheduleGridProps {
  staffColumns: CalendarDayView['staffColumns'];
  onSelectAppointment: (appt: Appointment) => void;
}

export function DayScheduleGrid({ staffColumns, onSelectAppointment }: DayScheduleGridProps) {
  if (staffColumns.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title="No staff schedule"
        description="There is no staff roster configured for this day."
      />
    );
  }

  const { start, end } = computeRange(staffColumns);
  const heightPx = (end - start) * PX_PER_MIN;
  const hourMarks: number[] = [];
  for (let t = start; t <= end; t += 60) hourMarks.push(t);
  const hasAnyAppointments = staffColumns.some((c) => (c.appointments?.length ?? 0) > 0);

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <div className="flex" style={{ minWidth: `${64 + staffColumns.length * 180}px` }}>
          {/* Time gutter */}
          <div className="w-16 shrink-0 border-r bg-muted/20">
            <div className="flex h-9 items-center justify-center border-b bg-muted/40 text-[10px] font-medium uppercase text-muted-foreground">
              Time
            </div>
            <div className="relative" style={{ height: heightPx }}>
              {hourMarks.map((t, idx) => {
                const isLast = idx === hourMarks.length - 1;
                return (
                  <div
                    key={t}
                    className={cn(
                      'absolute right-1.5 text-[10px] text-muted-foreground',
                      isLast ? '-translate-y-full' : 'translate-y-0.5'
                    )}
                    style={{ top: (t - start) * PX_PER_MIN }}
                  >
                    {formatHourLabel(t)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staff columns */}
          {staffColumns.map((col) => (
            <div key={col.staff.id} className="relative min-w-[180px] flex-1 border-r last:border-r-0">
              <div className="flex h-9 flex-col items-center justify-center border-b bg-muted/40 px-2 text-center">
                <p className="truncate text-xs font-semibold leading-tight">{col.staff.name}</p>
                {(col.staff.department || col.staff.role) && (
                  <p className="truncate text-[10px] leading-tight text-muted-foreground">
                    {col.staff.department || col.staff.role}
                  </p>
                )}
              </div>
              <div className="relative" style={{ height: heightPx }}>
                {hourMarks.map((t) => (
                  <div
                    key={t}
                    className="absolute left-0 right-0 border-t border-dashed border-border/70"
                    style={{ top: (t - start) * PX_PER_MIN }}
                  />
                ))}
                {(col.appointments ?? []).map((a) => {
                  if (!a.startTime) return null;
                  const s = toMinutes(a.startTime);
                  const dur = a.duration ?? 30;
                  const top = Math.max(0, (s - start) * PX_PER_MIN);
                  const height = Math.max(68, dur * PX_PER_MIN - 2);
                  return (
                    <div key={a.id} className="absolute left-1 right-1 z-[1]" style={{ top, height }}>
                      <AppointmentCard appointment={a} onClick={() => onSelectAppointment(a)} className="h-full" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!hasAnyAppointments && (
        <div className="border-t p-6 text-center">
          <p className="text-sm font-medium">No appointments scheduled</p>
          <p className="text-xs text-muted-foreground">There are no appointments for this day.</p>
        </div>
      )}
    </div>
  );
}
