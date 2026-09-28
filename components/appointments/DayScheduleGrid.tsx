'use client';

import { Users2 } from 'lucide-react';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { assignLanes, computeTimeRange, formatHourLabel, toMinutes } from '@/lib/calendar-range';
import type { CalendarDayView, Appointment } from '@/types';

const PX_PER_MIN = 2.2;

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

  // Only the hours that matter: an hour before the first appointment to an hour after the last.
  const range = computeTimeRange(staffColumns.flatMap((c) => c.appointments ?? []));
  if (!range) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-sm font-medium">No appointments scheduled</p>
        <p className="text-xs text-muted-foreground">There are no appointments for this day.</p>
      </div>
    );
  }
  const { start, end } = range;
  const heightPx = (end - start) * PX_PER_MIN;
  const hourMarks: number[] = [];
  for (let t = start; t <= end; t += 60) hourMarks.push(t);

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
                {(() => {
                  const appts = col.appointments ?? [];
                  const lanes = assignLanes(appts);
                  return appts.map((a, i) => {
                  if (!a.startTime) return null;
                  const s = toMinutes(a.startTime);
                  const dur = a.duration ?? 30;
                  const top = Math.max(0, (s - start) * PX_PER_MIN);
                  const height = Math.max(68, dur * PX_PER_MIN - 2);
                  const { lane, lanes: laneCount } = lanes[i];
                  return (
                    <div
                      key={a.id}
                      className="absolute z-[1] px-1"
                      style={{ top, height, left: `${(lane / laneCount) * 100}%`, width: `${100 / laneCount}%` }}
                    >
                      <AppointmentCard appointment={a} onClick={() => onSelectAppointment(a)} className="h-full" />
                    </div>
                  );
                  });
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
