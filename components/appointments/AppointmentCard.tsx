'use client';

import { Clock, AlertTriangle, User } from 'lucide-react';
import { cn, formatTimeLabel, addMinutesToTime } from '@/lib/utils';
import { APPOINTMENT_STATUS_STYLES, APPOINTMENT_STATUS_LABELS } from '@/constants/appointment';
import { TIER_BADGE_CLASSES } from '@/constants/customer';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  className?: string;
  showStaff?: boolean;
}

export function AppointmentCard({ appointment: a, onClick, className, showStaff = false }: AppointmentCardProps) {
  const status = a.status ?? 'scheduled';
  const endTime = a.endTime ?? (a.startTime && a.duration ? addMinutesToTime(a.startTime, a.duration) : undefined);
  const customerLabel = a.customerName ?? a.guestName ?? 'Guest';
  const serviceLabel = a.serviceName ?? a.service ?? 'Appointment';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-0.5 overflow-hidden rounded-lg border bg-card p-1.5 text-left text-xs shadow-sm transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-1">
        <span className="truncate font-semibold leading-tight">{customerLabel}</span>
        {a.customerTier && (
          <span className={cn('shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-semibold leading-tight', TIER_BADGE_CLASSES[a.customerTier] ?? '')}>
            {a.customerTier}
          </span>
        )}
      </div>
      <span className="shrink-0 truncate leading-tight text-muted-foreground">{serviceLabel}</span>
      {showStaff && a.staffName && (
        <span className="flex shrink-0 items-center gap-1 truncate leading-tight text-muted-foreground">
          <User className="h-3 w-3 shrink-0" aria-hidden="true" />
          {a.staffName}
        </span>
      )}
      <div className="flex shrink-0 items-center justify-between gap-1">
        <span className="flex items-center gap-1 leading-tight text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          {formatTimeLabel(a.startTime)}{endTime ? `–${formatTimeLabel(endTime)}` : ''}
        </span>
        <span className={cn('shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-semibold leading-tight', APPOINTMENT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border-gray-300')}>
          {APPOINTMENT_STATUS_LABELS[status] ?? status}
        </span>
      </div>
      {a.allergyNotes && (
        <span className="flex shrink-0 items-center gap-1 truncate text-[10px] font-medium leading-tight text-destructive">
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
          Allergy on file
        </span>
      )}
    </button>
  );
}
