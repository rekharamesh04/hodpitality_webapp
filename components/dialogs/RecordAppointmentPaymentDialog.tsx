'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useUpdateAppointmentPayment } from '@/hooks/useAppointments';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { Appointment, PaymentMethodType } from '@/types';

const PAYMENT_METHODS: PaymentMethodType[] = ['cash', 'card', 'credit_card', 'upi', 'bank_transfer', 'online', 'other'];
const METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'Cash', card: 'Card', credit_card: 'Credit Card', upi: 'UPI', bank_transfer: 'Bank Transfer', online: 'Online', other: 'Other',
};

interface RecordAppointmentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

/**
 * Notifies the backend ledger that the consultation fee has been received.
 * Calls POST /appointments/{id}/payment with payload: { paymentStatus: "paid", amount: <number> }.
 */
export function RecordAppointmentPaymentDialog({ open, onOpenChange, appointment }: RecordAppointmentPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const updateAppointmentPayment = useUpdateAppointmentPayment();

  useEffect(() => {
    if (open && appointment) {
      setAmount(appointment.amount ? String(appointment.amount) : '');
      setMethod('cash');
      setTransactionId('');
      setFieldError(null);
    }
  }, [open, appointment?.id]);

  if (!appointment) return null;

  const id = appointment.id ?? appointment.PK ?? '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (updateAppointmentPayment.isPending) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setFieldError('Enter a valid amount greater than 0');
      return;
    }
    setFieldError(null);
    updateAppointmentPayment.mutate(
      {
        id,
        paymentStatus: 'paid',
        amount: value,
        method,
        transactionId: transactionId.trim() || undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const submitError = updateAppointmentPayment.error
    ? getFriendlyErrorMessage(updateAppointmentPayment.error, 'Unable to record payment.')
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !updateAppointmentPayment.isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {appointment.customerName ?? appointment.guestName ?? 'Guest'} — {appointment.serviceName ?? appointment.service ?? 'Consultation'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {(submitError || fieldError) && (
              <Alert variant="destructive">
                <AlertDescription>{submitError || fieldError}</AlertDescription>
              </Alert>
            )}
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
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateAppointmentPayment.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={updateAppointmentPayment.isPending}>
              {updateAppointmentPayment.isPending ? 'Recording…' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
