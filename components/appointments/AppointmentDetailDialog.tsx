'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { AppointmentStatusMenu } from '@/components/appointments/AppointmentStatusMenu';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { cn, formatDate, formatTimeLabel, addMinutesToTime, getRelativeTime, formatCurrency } from '@/lib/utils';
import { APPOINTMENT_STATUS_STYLES, APPOINTMENT_STATUS_LABELS } from '@/constants/appointment';
import { TIER_BADGE_CLASSES } from '@/constants/customer';
import { debugLog } from '@/utils/debugLog';
import type { Appointment } from '@/types';

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-purple-100 text-purple-700 border-purple-200',
};

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailDialog({ appointment, open, onOpenChange }: AppointmentDetailDialogProps) {
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  useEffect(() => {
    if (!open || !appointment) return;
    debugLog('[ADMIN][APPOINTMENT][DETAIL]', {
      appointmentId: appointment.id ?? null,
      customerId: appointment.customerId ?? null,
      tenantId: (appointment as unknown as Record<string, unknown>).tenantId ?? null,
      status: appointment.status ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id]);

  if (!appointment) return null;

  const a = appointment;
  const status = a.status ?? 'scheduled';
  const paymentStatus = a.paymentStatus ?? 'pending';
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
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', PAYMENT_STATUS_STYLES[paymentStatus] ?? 'bg-gray-100 text-gray-700 border-gray-300')}>
              {paymentStatus}
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
          <DetailRow label="Fee" value={a.amount != null ? formatCurrency(a.amount) : undefined} />
          <DetailRow label="Notes" value={a.notes} />
          {a.allergyNotes && <DetailRow label="Allergy Notes" value={a.allergyNotes} destructive />}
          <DetailRow label="Created" value={a.createdAt ? getRelativeTime(a.createdAt) : undefined} />
          <DetailRow label="Arrived At" value={a.arrivedAt ? formatDate(a.arrivedAt, 'MMM dd, yyyy HH:mm') : undefined} />
          <DetailRow label="Checked Out" value={a.checkoutAt ? formatDate(a.checkoutAt, 'MMM dd, yyyy HH:mm') : undefined} />
        </div>

        {id && (
          <div className="flex items-center justify-between gap-2 pt-2">
            {paymentStatus !== 'paid' ? (
              <Button variant="outline" size="sm" onClick={() => setPayDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            ) : <span />}
            <AppointmentStatusMenu appointmentId={id} currentStatus={a.status} />
          </div>
        )}
      </DialogContent>
      <RecordAppointmentPaymentDialog open={payDialogOpen} onOpenChange={setPayDialogOpen} appointment={a} />
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
