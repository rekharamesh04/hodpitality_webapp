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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useUpdateAppointmentPayment, useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { TERMINAL_APPOINTMENT_STATUSES, type SessionOutcome } from '@/constants/appointment';
import { cn, formatCurrency, getFriendlyErrorMessage } from '@/lib/utils';
import type { Appointment, PaymentMethodType } from '@/types';
import { useTerminology } from '@/hooks';

const PAYMENT_METHODS: PaymentMethodType[] = ['cash', 'card', 'credit_card', 'upi', 'bank_transfer', 'online', 'other'];
const METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'Cash', card: 'Card', credit_card: 'Credit Card', upi: 'UPI', bank_transfer: 'Bank Transfer', online: 'Online', other: 'Other',
};

/** What happens to the fee when a session is ended. */
type FeeChoice = 'collect' | 'later' | 'waive';

interface RecordAppointmentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  /**
   * Ask how the session went (completed / incomplete) before the payment, and close the
   * session in the same request. Only takes effect while the session is still open; a closed
   * or cancelled appointment gets the plain payment form.
   */
  endSession?: boolean;
}

/**
 * Ends a session and/or records its fee.
 *
 * With `endSession`, the desk first records the outcome — completed, or incomplete with a
 * reason — then decides the fee: collect now, collect later, or no charge. Collect-now and
 * no-charge go to POST /appointments/{id}/payment together with the outcome, so the status and
 * the payment are one write; collect-later only closes the session. The appointment screens then
 * show the session as completed without anyone updating the status separately.
 */
export function RecordAppointmentPaymentDialog({ open, onOpenChange, appointment, endSession }: RecordAppointmentPaymentDialogProps) {
  const t = useTerminology();
  const [outcome, setOutcome] = useState<SessionOutcome>('completed');
  const [sessionNote, setSessionNote] = useState('');
  const [fee, setFee] = useState<FeeChoice>('collect');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const updateAppointmentPayment = useUpdateAppointmentPayment();
  const updateStatus = useUpdateAppointmentStatus();
  const isPending = updateAppointmentPayment.isPending || updateStatus.isPending;

  useEffect(() => {
    if (open && appointment) {
      setOutcome('completed');
      setSessionNote('');
      setFee('collect');
      setAmount(appointment.amount ? String(appointment.amount) : '');
      setMethod('cash');
      setTransactionId('');
      setFieldError(null);
      updateAppointmentPayment.reset();
      updateStatus.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id]);

  if (!appointment) return null;

  const id = appointment.id ?? appointment.PK ?? '';
  const status = appointment.status ?? 'scheduled';
  const closingSession = !!endSession && !TERMINAL_APPOINTMENT_STATUSES.has(status);
  const alreadyPaid = appointment.paymentStatus === 'paid';
  const alreadySettled = alreadyPaid || appointment.paymentStatus === 'waived';
  // When ending a session whose fee is already settled there is nothing to decide about money.
  const askFee = !closingSession || !alreadySettled;
  const collecting = askFee && (!closingSession || fee === 'collect');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    const note = sessionNote.trim();
    if (closingSession && outcome === 'incomplete' && !note) {
      setFieldError('Say why the session was incomplete.');
      return;
    }

    let value = 0;
    if (collecting) {
      value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        setFieldError('Enter a valid amount greater than 0');
        return;
      }
    }
    setFieldError(null);
    const close = () => onOpenChange(false);
    const session = closingSession ? { sessionStatus: outcome, sessionNote: note || undefined } : {};

    if (closingSession && (!askFee || fee === 'later')) {
      updateStatus.mutate({ id, status: outcome, sessionNote: note || undefined }, { onSuccess: close });
      return;
    }
    if (closingSession && fee === 'waive') {
      updateAppointmentPayment.mutate({ id, paymentStatus: 'waived', ...session }, { onSuccess: close });
      return;
    }
    updateAppointmentPayment.mutate(
      {
        id,
        paymentStatus: 'paid',
        amount: value,
        method,
        transactionId: transactionId.trim() || undefined,
        ...session,
      },
      { onSuccess: close }
    );
  }

  const mutationError = updateAppointmentPayment.error ?? updateStatus.error;
  const submitError = mutationError
    ? getFriendlyErrorMessage(mutationError, closingSession ? 'Unable to end the session.' : 'Unable to record payment.')
    : null;

  let submitLabel = 'Record Payment';
  if (closingSession) {
    submitLabel = collecting ? 'End session & record payment' : 'End session';
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{closingSession ? 'End session' : 'Record Payment'}</DialogTitle>
          <DialogDescription>
            {appointment.customerName ?? appointment.guestName ?? t.person.one} — {appointment.serviceName ?? appointment.service ?? 'Consultation'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {(submitError || fieldError) && (
              <Alert variant="destructive">
                <AlertDescription>{submitError || fieldError}</AlertDescription>
              </Alert>
            )}

            {closingSession && (
              <fieldset className="space-y-2">
                <legend className="mb-1 text-sm font-medium">How did the session go?</legend>
                <RadioGroup
                  value={outcome}
                  onValueChange={(v) => { setOutcome(v as SessionOutcome); setFieldError(null); }}
                  className="grid-cols-2"
                >
                  <ChoiceTile id="outcome-completed" value="completed" label="Completed" selected={outcome === 'completed'} />
                  <ChoiceTile id="outcome-incomplete" value="incomplete" label="Incomplete" selected={outcome === 'incomplete'} />
                </RadioGroup>
                {outcome === 'incomplete' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="rap-note">Reason *</Label>
                    <Textarea
                      id="rap-note"
                      value={sessionNote}
                      onChange={(e) => setSessionNote(e.target.value)}
                      placeholder={`e.g. ${t.person.one} felt unwell and left early`}
                      rows={2}
                    />
                  </div>
                )}
              </fieldset>
            )}

            {closingSession && !askFee && (
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                {alreadyPaid ? 'The fee for this session is already paid.' : 'This session is marked as no charge.'}
              </p>
            )}

            {closingSession && askFee && (
              <fieldset className="space-y-2">
                <legend className="mb-1 text-sm font-medium">
                  Payment{appointment.amount ? ` · ${formatCurrency(appointment.amount)}` : ''}
                </legend>
                <RadioGroup value={fee} onValueChange={(v) => { setFee(v as FeeChoice); setFieldError(null); }} className="grid-cols-3">
                  <ChoiceTile id="fee-collect" value="collect" label="Collect now" selected={fee === 'collect'} />
                  <ChoiceTile id="fee-later" value="later" label="Collect later" selected={fee === 'later'} />
                  <ChoiceTile id="fee-waive" value="waive" label="No charge" selected={fee === 'waive'} />
                </RadioGroup>
              </fieldset>
            )}

            {collecting && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="rap-amount">Amount *</Label>
                  <Input
                    id="rap-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rap-method">Payment Method</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethodType)}>
                    <SelectTrigger id="rap-method"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rap-txn">Transaction ID (optional)</Label>
                  <Input
                    id="rap-txn"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Bank reference / receipt number"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isPending ? 'Saving…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChoiceTile({ id, value, label, selected }: { id: string; value: string; label: string; selected: boolean }) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal transition-colors',
        selected ? 'border-primary bg-primary/5' : 'hover:bg-accent'
      )}
    >
      <RadioGroupItem id={id} value={value} />
      {label}
    </Label>
  );
}
