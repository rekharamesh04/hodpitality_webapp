'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CreditCard } from 'lucide-react';
import { AppointmentStatusMenu } from '@/components/appointments/AppointmentStatusMenu';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { cn, formatDate, formatTimeLabel, addMinutesToTime, getRelativeTime, formatCurrency, getStatusColor } from '@/lib/utils';
import { APPOINTMENT_STATUS_STYLES, APPOINTMENT_STATUS_LABELS, TERMINAL_APPOINTMENT_STATUSES } from '@/constants/appointment';
import { tierBadgeClass } from '@/constants/customer';
import { useIndustry, useTerminology } from '@/hooks';
import { debugLog } from '@/utils/debugLog';
import type { Appointment } from '@/types';

interface AppointmentDetailDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailDialog({ appointment, open, onOpenChange }: AppointmentDetailDialogProps) {
  const t = useTerminology();
  const industry = useIndustry();
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [endSession, setEndSession] = useState(false);

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
  const customerLabel = a.customerName ?? a.guestName ?? t.person.one;
  const serviceLabel = a.serviceName ?? a.service;
  const id = a.id ?? a.PK ?? '';
  const sessionOpen = !TERMINAL_APPOINTMENT_STATUSES.has(status);
  // A closed session can still be owed; a cancelled, missed or no-charge one cannot.
  const canTakePayment = (status === 'completed' || status === 'incomplete')
    && paymentStatus !== 'paid' && paymentStatus !== 'waived';

  function openPayment(asEndSession: boolean) {
    setEndSession(asEndSession);
    setPayDialogOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{customerLabel}</DialogTitle>
            {a.customerTier && (
              <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', tierBadgeClass(a.customerTier, industry))}>
                {a.customerTier}
              </span>
            )}
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', APPOINTMENT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700')}>
              {APPOINTMENT_STATUS_LABELS[status] ?? status}
            </span>
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', getStatusColor(paymentStatus))}>
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
          <DetailRow label="Session Ended" value={a.sessionClosedAt ? `${formatDate(a.sessionClosedAt, 'MMM dd, yyyy HH:mm')}${a.sessionClosedBy ? ` · ${a.sessionClosedBy}` : ''}` : undefined} />
          <DetailRow label={status === 'incomplete' ? 'Reason' : 'Session Note'} value={a.sessionNote} destructive={status === 'incomplete'} />
        </div>

        {id && (
          <div className="flex items-center justify-between gap-2 pt-2">
            {sessionOpen ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => openPayment(true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> End session
                </Button>
                {/* Some desks take the fee up front; the session is still ended afterwards. */}
                {paymentStatus !== 'paid' && paymentStatus !== 'waived' && status !== 'cancelled' && (
                  <Button variant="ghost" size="sm" onClick={() => openPayment(false)}>
                    <CreditCard className="mr-2 h-4 w-4" /> Advance payment
                  </Button>
                )}
              </div>
            ) : canTakePayment ? (
              <Button variant="outline" size="sm" onClick={() => openPayment(false)}>
                <CreditCard className="mr-2 h-4 w-4" /> Record Payment
              </Button>
            ) : <span />}
            <AppointmentStatusMenu appointmentId={id} currentStatus={a.status} appointment={a} />
          </div>
        )}
      </DialogContent>
      <RecordAppointmentPaymentDialog open={payDialogOpen} onOpenChange={setPayDialogOpen} appointment={a} endSession={endSession} />
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
