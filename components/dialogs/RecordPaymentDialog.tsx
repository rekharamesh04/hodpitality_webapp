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
import { useUpdateRegistrationPayment } from '@/hooks/useRegistrations';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { PaymentMethodType } from '@/types';
import type { Registration } from '@/types';

const PAYMENT_METHODS: PaymentMethodType[] = ['cash', 'card', 'credit_card', 'upi', 'bank_transfer', 'online', 'other'];
const METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'Cash', card: 'Card', credit_card: 'Credit Card', upi: 'UPI', bank_transfer: 'Bank Transfer', online: 'Online', other: 'Other',
};

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: Registration | null;
}

/**
 * Notifies the backend ledger that payment has been received for an event registration.
 * Calls POST /registrations/{id}/payment with payload: { paymentStatus: "paid", amount: <number> }.
 */
export function RecordPaymentDialog({ open, onOpenChange, registration }: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const updateRegistrationPayment = useUpdateRegistrationPayment();

  useEffect(() => {
    if (open && registration) {
      setAmount(registration.amount ? String(registration.amount) : '');
      setCurrency('INR');
      setMethod('cash');
      setTransactionId('');
      setFieldError(null);
    }
  }, [open, registration?.id]);

  if (!registration) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (updateRegistrationPayment.isPending) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setFieldError('Enter a valid amount greater than 0');
      return;
    }
    setFieldError(null);
    updateRegistrationPayment.mutate(
      {
        id: registration!.id,
        status: 'paid',
        amount: value,
        currency: currency || 'INR',
        paymentMethod: method === 'card' ? 'credit_card' : method,
        transactionId: transactionId.trim() || undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const submitError = updateRegistrationPayment.error
    ? getFriendlyErrorMessage(updateRegistrationPayment.error, 'Unable to record payment.')
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !updateRegistrationPayment.isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {registration.guestName} — {registration.event}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {(submitError || fieldError) && (
              <Alert variant="destructive">
                <AlertDescription>{submitError || fieldError}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rp-amount">Amount *</Label>
                <Input
                  id="rp-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rp-currency">Currency</Label>
                <Input
                  id="rp-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rp-method">Payment Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethodType)}>
                <SelectTrigger id="rp-method"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rp-txn">Transaction ID (optional)</Label>
              <Input
                id="rp-txn"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Bank reference / receipt number"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateRegistrationPayment.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={updateRegistrationPayment.isPending}>
              {updateRegistrationPayment.isPending ? 'Recording…' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
