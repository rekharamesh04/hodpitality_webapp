'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { CustomerCombobox } from '@/components/appointments/CustomerCombobox';
import { StaffSelect } from '@/components/common/StaffSelect';
import { useServices } from '@/hooks/useCalendar';
import { useAppointments, useCreateAppointment } from '@/hooks/useAppointments';
import { useStaffMember } from '@/hooks/useStaff';
import { useOrgTimezone } from '@/hooks/useSettings';
import { checkTime, clockInZone, openSlots, type Booking, type TimeCheck } from '@/lib/availability';
import { cn, getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';
import type { Customer } from '@/services/customer.service';

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  /**
   * Book for this person instead of asking which one.
   *
   * Set when the dialog is opened from somewhere that already knows who —
   * a visitor's row or their profile. The picker is then shown as a fixed
   * name rather than a combobox, because re-choosing someone you just
   * clicked on is a way to book the wrong person by accident.
   *
   * A visitor is accepted here as well as a customer: the API takes either
   * id for `customerId`, and for most tenants the visitor directory is the
   * only one with anybody in it.
   */
  defaultCustomer?: Pick<Customer, 'id' | 'name'> | null;
}

function todayIso() {
  return toLocalDateInput();
}

function conflictAwareMessage(err: unknown): string | null {
  if (!err) return null;
  const status = (err as { response?: { status?: number } })?.response?.status;
  const backendMsg = (err as { backendMessage?: string })?.backendMessage;
  if (status === 409) {
    return backendMsg ?? 'This staff member is already booked at this time. Please choose another time or staff member.';
  }
  return backendMsg ?? getFriendlyErrorMessage(err, 'Unable to create appointment.');
}

/** A gentle note under the time — never blocks the booking. */
/**
 * A note under the time. An overlap blocks the booking — the server refuses it (409
 * SLOT_OVERLAP) — so it is said up front. Outside hours or a day off is only a warning:
 * the desk may still book it.
 */
function timeWarning(check: TimeCheck): { text: string; blocking: boolean } | null {
  switch (check.kind) {
    case 'overlap':
      return { text: `Overlaps a booking at ${check.with} for this staff member. Choose another time.`, blocking: true };
    case 'day-off':
      return { text: 'This staff member is not scheduled to work on this day.', blocking: false };
    case 'outside-hours':
      return { text: `Outside this staff member's hours (${check.hours}).`, blocking: false };
    default:
      return null;
  }
}

export function CreateAppointmentDialog({
  open, onOpenChange, defaultDate, defaultCustomer,
}: CreateAppointmentDialogProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const locked = !!defaultCustomer;
  const [staffId, setStaffId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(defaultDate ?? todayIso());
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const createAppointment = useCreateAppointment();

  const services = servicesData ?? [];
  const selectedService = services.find((s) => s.id === serviceId);

  // Open times come from the staff member's weekly schedule minus what they
  // already hold that day. Advice only: the time box still takes any time,
  // and the backend still owns conflicts. No schedule → nothing extra shown.
  const lookupReady = open && !!staffId && !!date;
  const { data: staffMember } = useStaffMember(lookupReady ? staffId : '');
  const { data: dayBookings, isFetching: bookingsLoading } = useAppointments(
    { staffId, date },
    { enabled: lookupReady },
  );
  const bookings = useMemo(() => (dayBookings ?? []) as Booking[], [dayBookings]);
  // "Already past today" is judged by the clinic's clock, not this computer's: someone booking
  // for a clinic in another timezone would otherwise hide the wrong times. Until the clinic's
  // timezone has loaded (or if it can't be read) the computer's clock is used, as before.
  const { data: orgTimezone } = useOrgTimezone({ enabled: lookupReady });
  const slots = useMemo(() => {
    if (!lookupReady || bookingsLoading) return null;
    const clinicNow = clockInZone(orgTimezone?.timezone);
    return openSlots({
      schedule: staffMember?.schedule,
      date,
      duration: duration || selectedService?.duration || 30,
      bookings,
      notBefore: date === clinicNow.date ? clinicNow.minutes : undefined,
    });
  }, [lookupReady, bookingsLoading, staffMember?.schedule, date, duration, selectedService?.duration, bookings, orgTimezone?.timezone]);
  const warning = lookupReady && startTime && !bookingsLoading
    ? timeWarning(checkTime({
        schedule: staffMember?.schedule,
        date,
        startTime,
        duration: duration || selectedService?.duration || 30,
        bookings,
      }))
    : null;

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate ?? todayIso());
    // Re-applied on every open: the dialog is reused, and a stale person from
    // the last booking would be worse than an empty picker.
    if (defaultCustomer) setCustomer(defaultCustomer as Customer);
  }, [open, defaultDate, defaultCustomer]);

  function reset() {
    setCustomer(defaultCustomer ? (defaultCustomer as Customer) : null);
    setStaffId('');
    setServiceId('');
    setStartTime('');
    setDuration(30);
    setRoom('');
    setNotes('');
    setTouched(false);
  }

  function handleServiceChange(id: string) {
    setServiceId(id);
    const svc = services.find((s) => s.id === id);
    if (svc) {
      setDuration(svc.duration);
      if (svc.room && !room) setRoom(svc.room);
    }
  }

  const isValid = !!customer && !!staffId && !!serviceId && !!date && !!startTime;

  function handleSubmit() {
    setTouched(true);
    if (!isValid || createAppointment.isPending || warning?.blocking) return;
    createAppointment.mutate(
      {
        customerId: customer!.id,
        staffId,
        date,
        startTime,
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        service: selectedService?.name,
        duration: duration || selectedService?.duration,
        room: room || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  }

  const errorMessage = conflictAwareMessage(createAppointment.error);

  return (
    <Dialog open={open} onOpenChange={(v) => !createAppointment.isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>Book a new appointment for a customer.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label>Customer *</Label>
            {locked ? (
              <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                {customer?.name ?? defaultCustomer?.name}
              </div>
            ) : (
              <>
                <CustomerCombobox selected={customer} onSelectCustomer={setCustomer} disabled={createAppointment.isPending} />
                {touched && !customer && <p className="text-xs text-destructive">Select a customer</p>}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="appt-staff">Staff *</Label>
              <StaffSelect id="appt-staff" value={staffId} onChange={setStaffId} disabled={createAppointment.isPending} />
              {touched && !staffId && <p className="text-xs text-destructive">Select a staff member</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appt-service">Service *</Label>
              <Select value={serviceId} onValueChange={handleServiceChange} disabled={createAppointment.isPending}>
                <SelectTrigger id="appt-service">
                  <SelectValue placeholder={servicesLoading ? 'Loading…' : 'Select service'} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.duration} min)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched && !serviceId && <p className="text-xs text-destructive">Select a service</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="appt-date">Date *</Label>
              <Input id="appt-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={createAppointment.isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appt-time">Start Time *</Label>
              <Input id="appt-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={createAppointment.isPending} />
              {touched && !startTime && <p className="text-xs text-destructive">Select a start time</p>}
            </div>
          </div>

          {slots !== null && (
            <div className="space-y-1.5">
              <Label>Open times</Label>
              {slots.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No open times for this staff member on this day. You can still type a time above.
                </p>
              ) : (
                <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                  {slots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={createAppointment.isPending}
                      onClick={() => setStartTime(t)}
                      className={cn(
                        'rounded-md border px-2 py-1 text-xs tabular-nums transition-colors',
                        startTime === t
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'hover:bg-muted',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {warning && (
            <p
              role={warning.blocking ? 'alert' : undefined}
              className={cn(
                'flex items-start gap-1.5 text-xs',
                warning.blocking ? 'text-destructive' : 'text-amber-700 dark:text-amber-400',
              )}
            >
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {warning.text}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="appt-duration">Duration (min)</Label>
              <Input
                id="appt-duration"
                type="number"
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={createAppointment.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appt-room">Room</Label>
              <Input id="appt-room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Optional" disabled={createAppointment.isPending} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appt-notes">Notes</Label>
            <Textarea
              id="appt-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional"
              disabled={createAppointment.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createAppointment.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={createAppointment.isPending} disabled={!!warning?.blocking}>
            {createAppointment.isPending ? 'Creating…' : 'Create Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
