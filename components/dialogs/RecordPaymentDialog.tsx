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
import { useCreatePayment } from '@/hooks/usePayments';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { PaymentMethodType } from '@/types';
import type { Registration } from '@/types';

const PAYMENT_METHODS: PaymentMethodType[] = ['cash', 'card', 'upi', 'bank_transfer', 'online', 'other'];
const METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'Cash', card: 'Card', upi: 'UPI', bank_transfer: 'Bank Transfer', online: 'Online', other: 'Other',
};

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: Registration | null;
}

/** Payment recording lives here, at the point of the registration it belongs to —
 * not as a separate Payments module. Uses the same POST /payments the backend patch
 * adds (see hodpitality_backend_patch/payments_patch.py); until that's deployed this
 * will fail like any other unavailable endpoint (ErrorState/toast), not silently. */
export function RecordPaymentDialog({ open, onOpenChange, registration }: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const createPayment = useCreatePayment();

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
    if (createPayment.isPending) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setFieldError('Enter a valid amount greater than 0');
      return;
    }
    setFieldError(null);
    createPayment.mutate(
      {
        registrationId: registration!.id,
        amount: value,
        currency,
        paymentMethod: method,
        transactionId: transactionId || undefined,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const submitError = createPayment.error ? getFriendlyErrorMessage(createPayment.error, 'Unable to record payment.') : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !createPayment.isPending && onOpenChange(v)}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createPayment.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={createPayment.isPending}>
              {createPayment.isPending ? 'Recording…' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
