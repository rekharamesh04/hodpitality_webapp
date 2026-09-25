'use client';

import { useEffect, useState } from 'react';
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
import { useStaff } from '@/hooks/useStaff';
import { useServices } from '@/hooks/useCalendar';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';
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

  const { data: staffData, isLoading: staffLoading } = useStaff({ limit: 50 });
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const createAppointment = useCreateAppointment();

  const staff = staffData ?? [];
  const services = servicesData ?? [];
  const selectedService = services.find((s) => s.id === serviceId);

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
    if (!isValid || createAppointment.isPending) return;
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
              <Select value={staffId} onValueChange={setStaffId} disabled={createAppointment.isPending}>
                <SelectTrigger id="appt-staff">
                  <SelectValue placeholder={staffLoading ? 'Loading…' : 'Select staff'} />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}{s.department ? ` · ${s.department}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <Button onClick={handleSubmit} loading={createAppointment.isPending}>
            {createAppointment.isPending ? 'Creating…' : 'Create Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
