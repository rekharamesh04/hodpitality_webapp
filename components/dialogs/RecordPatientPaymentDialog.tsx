'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Pill, CalendarClock, Receipt } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { GuestCombobox } from '@/components/common/GuestCombobox';
import { useAppointments, useUpdateAppointmentPayment } from '@/hooks/useAppointments';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useCreatePayment } from '@/hooks/usePayments';
import { useTerminology } from '@/hooks';
import { QUERY_KEYS } from '@/constants';
import { cn, formatCurrency, formatDate, getFriendlyErrorMessage } from '@/lib/utils';
import { medicineLabel, medicinesOf, prescriptionsFor } from '@/types/prescription';
import type { Guest, PaymentMethodType } from '@/types';

const METHODS: { value: PaymentMethodType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online' },
  { value: 'other', label: 'Other' },
];

type PaidFor = 'appointment' | 'prescription' | 'other';

export interface PaymentPerson {
  id: string;
  name: string;
}

interface RecordPatientPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Start with this person chosen (from their profile, or the collection counter). */
  defaultPerson?: PaymentPerson | null;
  /** Start with these prescriptions ticked — the ones just handed over at the counter. */
  defaultPrescriptionIds?: string[];
  /** Called once the payment is saved, before the dialog closes. */
  onRecorded?: () => void;
}

function guestId(g: Guest): string {
  return g.id ?? (g.PK ? g.PK.replace('GUEST#', '') : '');
}

/**
 * Record a payment, always against a person.
 *
 * 1. Who is paying — the patient.
 * 2. What it is for — one of their unpaid appointments, the prescriptions they collected, or
 *    something else (with a description).
 * 3. How much and how.
 *
 * The payment then shows on the Payments page and in the patient's own Payments tab, and what it
 * covered is marked paid so it stops showing as owed.
 */
export function RecordPatientPaymentDialog({
  open, onOpenChange, defaultPerson, defaultPrescriptionIds, onRecorded,
}: RecordPatientPaymentDialogProps) {
  const t = useTerminology();
  const qc = useQueryClient();
  const person = t.person.one.toLowerCase();

  const [payer, setPayer] = useState<PaymentPerson | null>(null);
  const [picked, setPicked] = useState<Guest | null>(null);
  const [paidFor, setPaidFor] = useState<PaidFor>('prescription');
  const [appointmentId, setAppointmentId] = useState('');
  const [rxIds, setRxIds] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const createPayment = useCreatePayment();
  const payAppointment = useUpdateAppointmentPayment();
  const isPending = createPayment.isPending || payAppointment.isPending;

  const hasAppointments = t.has('appointments');
  const hasPrescriptions = t.has('prescriptions');

  const { data: appointments, isLoading: apptsLoading } = useAppointments(
    { guestId: payer?.id }, { enabled: open && !!payer && hasAppointments },
  );
  const { data: allRx, isLoading: rxLoading } = usePrescriptions({}, { enabled: open && !!payer && hasPrescriptions });

  const unpaidAppointments = useMemo(() => (appointments ?? []).filter((a) => {
    const status = String(a.status ?? '').toLowerCase();
    const pay = String(a.paymentStatus ?? '').toLowerCase();
    return !['cancelled', 'no-show', 'no_show'].includes(status) && pay !== 'paid' && pay !== 'waived';
  }).sort((a, b) => `${b.date ?? ''}${b.startTime ?? ''}`.localeCompare(`${a.date ?? ''}${a.startTime ?? ''}`)),
  [appointments]);

  const unpaidRx = useMemo(
    () => (payer ? prescriptionsFor(allRx ?? [], payer.id) : [])
      .filter((p) => p.paymentStatus !== 'paid' && p.status !== 'cancelled'),
    [allRx, payer],
  );

  // Reset whenever the dialog opens, starting from whatever the caller already knows.
  useEffect(() => {
    if (!open) return;
    setPayer(defaultPerson ?? null);
    setPicked(null);
    setPaidFor(defaultPrescriptionIds?.length || hasPrescriptions ? 'prescription' : hasAppointments ? 'appointment' : 'other');
    setAppointmentId('');
    setRxIds(new Set(defaultPrescriptionIds ?? []));
    setAmount('');
    setMethod('cash');
    setTransactionId('');
    setDescription('');
    setFieldError(null);
    createPayment.reset();
    payAppointment.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function choosePayer(g: Guest) {
    setPicked(g);
    setPayer({ id: guestId(g), name: g.name });
    setAppointmentId('');
    setRxIds(new Set());
    setFieldError(null);
  }

  function chooseAppointment(id: string) {
    setAppointmentId(id);
    const appt = unpaidAppointments.find((a) => a.id === id);
    if (appt?.amount && !amount) setAmount(String(appt.amount));
  }

  function toggleRx(id: string, on: boolean) {
    setRxIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    if (!payer) return setFieldError(`Choose the ${person} who is paying.`);
    if (paidFor === 'appointment' && !appointmentId) return setFieldError(`Choose which ${t.visit.one.toLowerCase()} this pays for.`);
    if (paidFor === 'prescription' && rxIds.size === 0) return setFieldError('Tick the prescriptions this pays for.');
    if (paidFor === 'other' && !description.trim()) return setFieldError('Say what this payment is for.');
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setFieldError('Enter a valid amount greater than 0');
    setFieldError(null);

    const done = () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTIONS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      onRecorded?.();
      onOpenChange(false);
    };

    if (paidFor === 'appointment') {
      // Same endpoint as the appointment's own Record Payment: marks it paid and writes the payment.
      payAppointment.mutate(
        { id: appointmentId, paymentStatus: 'paid', amount: value, method, transactionId: transactionId.trim() || undefined },
        { onSuccess: done },
      );
      return;
    }
    createPayment.mutate(
      {
        guestId: payer.id,
        amount: value,
        method,
        paymentMethod: method,
        status: 'paid',
        transactionId: transactionId.trim() || undefined,
        description: description.trim() || undefined,
        ...(paidFor === 'prescription' ? { type: 'prescription' as const, prescriptionIds: Array.from(rxIds) } : { type: 'other' as const }),
      },
      { onSuccess: done },
    );
  }

  const mutationError = createPayment.error ?? payAppointment.error;
  const submitError = mutationError ? getFriendlyErrorMessage(mutationError, 'Unable to record payment.') : null;

  const options: { value: PaidFor; label: string; icon: typeof Pill; show: boolean }[] = [
    { value: 'prescription', label: 'Prescription', icon: Pill, show: hasPrescriptions },
    { value: 'appointment', label: t.visit.one, icon: CalendarClock, show: hasAppointments },
    { value: 'other', label: 'Something else', icon: Receipt, show: true },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Every payment belongs to a {person}. It shows here and on their profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {(submitError || fieldError) && (
              <Alert variant="destructive">
                <AlertDescription>{submitError || fieldError}</AlertDescription>
              </Alert>
            )}

            {/* 1 · who */}
            <div className="space-y-1.5">
              <Label>1. Who is paying? *</Label>
              {payer && !picked && defaultPerson ? (
                <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{payer.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPayer(null)} disabled={isPending}>
                    Change
                  </Button>
                </div>
              ) : (
                <GuestCombobox
                  selected={picked}
                  onSelectGuest={choosePayer}
                  disabled={isPending}
                  placeholder={`Search ${t.person.many.toLowerCase()}…`}
                />
              )}
            </div>

            {/* 2 · what for */}
            {payer && (
              <div className="space-y-2">
                <Label>2. What is it for? *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {options.filter((o) => o.show).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setPaidFor(value); setFieldError(null); }}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors',
                        paidFor === value ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-accent',
                      )}
                      aria-pressed={paidFor === value}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>

                {paidFor === 'prescription' && (
                  rxLoading ? <p className="text-xs text-muted-foreground">Loading prescriptions…</p>
                  : unpaidRx.length === 0 ? (
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {payer.name} has no unpaid prescriptions. Choose “Something else” for other items.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {unpaidRx.map((p) => {
                        const meds = medicinesOf(p);
                        return (
                          <label key={p.id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm hover:bg-accent">
                            <Checkbox checked={rxIds.has(p.id)} onCheckedChange={(v) => toggleRx(p.id, v === true)} className="mt-0.5" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">
                                {meds.length ? medicineLabel(meds[0]) : 'Prescription'}
                                {meds.length > 1 ? ` +${meds.length - 1} more` : ''}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {formatDate(p.created_at ?? p.createdAt)} · {p.status === 'completed' ? 'collected' : p.status}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )
                )}

                {paidFor === 'appointment' && (
                  apptsLoading ? <p className="text-xs text-muted-foreground">Loading {t.visit.many.toLowerCase()}…</p>
                  : unpaidAppointments.length === 0 ? (
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {payer.name} has no unpaid {t.visit.many.toLowerCase()}.
                    </p>
                  ) : (
                    <Select value={appointmentId || undefined} onValueChange={chooseAppointment}>
                      <SelectTrigger aria-label={`Choose a ${t.visit.one.toLowerCase()}`}>
                        <SelectValue placeholder={`Choose a ${t.visit.one.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {unpaidAppointments.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {formatDate(a.date)} {a.startTime ?? ''} · {a.serviceName ?? a.service ?? t.visit.one}
                            {a.amount ? ` · ${formatCurrency(Number(a.amount))}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                )}
              </div>
            )}

            {/* 3 · how much */}
            {payer && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="rpp-amount">3. Amount *</Label>
                    <Input id="rpp-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rpp-method">Method</Label>
                    <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethodType)}>
                      <SelectTrigger id="rpp-method"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {paidFor !== 'appointment' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="rpp-desc">{paidFor === 'other' ? 'What is it for? *' : 'Note (optional)'}</Label>
                    <Input
                      id="rpp-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={paidFor === 'other' ? 'e.g. Dressing kit, BP monitor' : 'Optional'}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="rpp-txn">Transaction / receipt no. (optional)</Label>
                  <Input id="rpp-txn" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="UPI ref, card slip no." />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={!payer}>
              {isPending ? 'Recording…' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
