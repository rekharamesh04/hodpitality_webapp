'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockCustomers, mockCalendarStaff, mockSpaServices } from '@/constants/mock-data';
import type { SpaAppointment, AppointmentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface NewAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onBook: (appt: Omit<SpaAppointment, 'id'>) => void;
  defaultDate?: string;
  preselectedCustomerId?: string;
}

// Half-hour slots from 8:00 to 17:00
const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const totalMin = 8 * 60 + i * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

// Slots that are already booked (mock busy times)
const MOCK_BUSY: Record<string, string[]> = {
  st1: ['08:00', '09:00', '12:00'],
  st2: ['08:00', '10:30', '14:00'],
  st3: ['08:00', '16:00', '17:00'],
  st4: ['08:30', '15:30'],
};

export default function NewAppointmentDialog({
  open,
  onClose,
  onBook,
  defaultDate,
  preselectedCustomerId,
}: NewAppointmentDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId ?? '');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  function reset() {
    setStep(1);
    setSelectedCustomerId(preselectedCustomerId ?? '');
    setSelectedServiceId('');
    setSelectedStaffId('');
    setSelectedTime('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleBook() {
    const customer = mockCustomers.find((c) => c.id === selectedCustomerId)!;
    const service = mockSpaServices.find((s) => s.id === selectedServiceId)!;
    const staff = mockCalendarStaff.find((s) => s.id === selectedStaffId)!;
    const appt: Omit<SpaAppointment, 'id'> = {
      customerId: customer.id,
      customerName: customer.name,
      customerInitials: customer.initials,
      customerTier: customer.tier,
      customerPhone: customer.phone,
      staffId: staff.id,
      staffName: staff.shortName,
      service: service.name,
      duration: service.duration,
      room: service.room,
      date: defaultDate ?? new Date().toISOString().split('T')[0],
      startTime: selectedTime,
      status: 'scheduled' as AppointmentStatus,
    };
    onBook(appt);
    handleClose();
  }

  const canProceedStep1 = !!selectedCustomerId && !!selectedServiceId;
  const canProceedStep2 = !!selectedStaffId && !!selectedTime;

  const selectedCustomer = mockCustomers.find((c) => c.id === selectedCustomerId);
  const selectedService = mockSpaServices.find((s) => s.id === selectedServiceId);
  const selectedStaff = mockCalendarStaff.find((s) => s.id === selectedStaffId);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
        </DialogHeader>

        {step === 1 && (
          <Step1
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
            selectedServiceId={selectedServiceId}
            onSelectService={setSelectedServiceId}
          />
        )}

        {step === 2 && (
          <Step2
            selectedStaffId={selectedStaffId}
            onSelectStaff={(id) => { setSelectedStaffId(id); setSelectedTime(''); }}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
          />
        )}

        {step === 3 && selectedCustomer && selectedService && selectedStaff && (
          <Step3
            customer={selectedCustomer}
            service={selectedService}
            staff={selectedStaff}
            time={selectedTime}
            date={defaultDate}
          />
        )}

        <DialogFooter className="flex justify-between gap-2">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleBook}>Book appointment</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Step 1: Customer + Service ──────────────────────────────────────────────

function Step1({
  selectedCustomerId,
  onSelectCustomer,
  selectedServiceId,
  onSelectService,
}: {
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  selectedServiceId: string;
  onSelectService: (id: string) => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-muted-foreground">Who is coming in, and what for.</p>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Customer</label>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          value={selectedCustomerId}
          onChange={(e) => onSelectCustomer(e.target.value)}
        >
          <option value="">Select a customer…</option>
          {mockCustomers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Service</label>
        <div className="grid grid-cols-1 gap-2">
          {mockSpaServices.map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                'flex items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors',
                selectedServiceId === s.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted'
              )}
              onClick={() => onSelectService(s.id)}
            >
              <span className="text-sm font-medium">{s.name}</span>
              <span className="text-xs text-muted-foreground">
                {s.duration} min · {s.room}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Staff + Time ─────────────────────────────────────────────────────

function Step2({
  selectedStaffId,
  onSelectStaff,
  selectedTime,
  onSelectTime,
}: {
  selectedStaffId: string;
  onSelectStaff: (id: string) => void;
  selectedTime: string;
  onSelectTime: (t: string) => void;
}) {
  const busySlots = selectedStaffId ? (MOCK_BUSY[selectedStaffId] ?? []) : [];

  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-muted-foreground">Choose a staff member, then an open time.</p>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Staff member</label>
        <div className="flex flex-wrap gap-2">
          {mockCalendarStaff.map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                selectedStaffId === s.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
              onClick={() => onSelectStaff(s.id)}
            >
              {s.shortName}
            </button>
          ))}
        </div>
      </div>

      {selectedStaffId && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Available times · Thursday</label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((t) => {
              const busy = busySlots.includes(t);
              const selected = selectedTime === t;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={busy}
                  className={cn(
                    'rounded-md border py-1.5 text-sm transition-colors',
                    busy
                      ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                      : selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => !busy && onSelectTime(t)}
                >
                  {formatSlotTime(t)}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">Greyed times are already booked for this staff member.</p>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────

function Step3({
  customer,
  service,
  staff,
  time,
  date,
}: {
  customer: (typeof mockCustomers)[0];
  service: (typeof mockSpaServices)[0];
  staff: (typeof mockCalendarStaff)[0];
  time: string;
  date?: string;
}) {
  const endMin = timeToMinutes(time) + service.duration;
  const dateLabel = date
    ? new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'Today';

  return (
    <div className="space-y-4 py-2">
      <p className="text-sm text-muted-foreground">Review and confirm the appointment details.</p>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {customer.initials}
          </div>
          <div>
            <p className="font-semibold">{customer.name}</p>
            <Badge variant="outline" className="text-xs">{customer.tier}</Badge>
          </div>
        </div>
        <hr />
        <ConfirmRow label="Service" value={`${service.name} · ${service.duration} min`} />
        <ConfirmRow label="Staff" value={staff.shortName} />
        <ConfirmRow label="Room" value={service.room} />
        <ConfirmRow label="Date" value={dateLabel} />
        <ConfirmRow
          label="Time"
          value={`${formatSlotTime(time)} – ${minutesToTime(endMin)}`}
        />
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatSlotTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'am' : 'pm';
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${String(m).padStart(2, '0')}${ampm === 'am' ? '' : 'pm'}`.replace(':00', ':00').replace('am', '');
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h < 12 ? 'am' : 'pm';
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${String(m).padStart(2, '0')} ${ampm}`;
}
