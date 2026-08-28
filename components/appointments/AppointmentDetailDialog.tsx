'use client';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { AppointmentStatusMenu } from '@/components/appointments/AppointmentStatusMenu';
import { cn, formatDate, formatTimeLabel, addMinutesToTime, getRelativeTime } from '@/lib/utils';
import { APPOINTMENT_STATUS_STYLES, APPOINTMENT_STATUS_LABELS } from '@/constants/appointment';
import { TIER_BADGE_CLASSES } from '@/constants/customer';
import type { Appointment } from '@/types';

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailDialog({ appointment, open, onOpenChange }: AppointmentDetailDialogProps) {
  if (!appointment) return null;

  const a = appointment;
  const status = a.status ?? 'scheduled';
  const endTime = a.endTime ?? (a.startTime && a.duration ? addMinutesToTime(a.startTime, a.duration) : undefined);
  const customerLabel = a.customerName ?? a.guestName ?? 'Guest';
  const serviceLabel = a.serviceName ?? a.service;
  const id = a.id ?? a.PK ?? '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{customerLabel}</DialogTitle>
            {a.customerTier && (
              <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', TIER_BADGE_CLASSES[a.customerTier] ?? '')}>
                {a.customerTier}
              </span>
            )}
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', APPOINTMENT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border-gray-300')}>
              {APPOINTMENT_STATUS_LABELS[status] ?? status}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-1 divide-y">
          <DetailRow label="Service" value={serviceLabel} />
          <DetailRow label="Staff" value={a.staffName} />
          <DetailRow label="Date" value={a.date ? formatDate(a.date, 'MMMM dd, yyyy') : undefined} />
          <DetailRow
            label="Time"
            value={a.startTime ? `${formatTimeLabel(a.startTime)}${endTime ? ` – ${formatTimeLabel(endTime)}` : ''}` : undefined}
          />
          <DetailRow label="Duration" value={a.duration ? `${a.duration} min` : undefined} />
          <DetailRow label="Room" value={a.room} />
          <DetailRow label="Notes" value={a.notes} />
          {a.allergyNotes && <DetailRow label="Allergy Notes" value={a.allergyNotes} destructive />}
          <DetailRow label="Created" value={a.createdAt ? getRelativeTime(a.createdAt) : undefined} />
          <DetailRow label="Arrived At" value={a.arrivedAt ? formatDate(a.arrivedAt, 'MMM dd, yyyy HH:mm') : undefined} />
          <DetailRow label="Checked Out" value={a.checkoutAt ? formatDate(a.checkoutAt, 'MMM dd, yyyy HH:mm') : undefined} />
        </div>

        {id && (
          <div className="flex justify-end pt-2">
            <AppointmentStatusMenu appointmentId={id} currentStatus={a.status} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value, destructive }: { label: string; value?: string; destructive?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm first:pt-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={cn('text-right font-medium', destructive && 'text-destructive')}>{value}</span>
    </div>
  );
}
