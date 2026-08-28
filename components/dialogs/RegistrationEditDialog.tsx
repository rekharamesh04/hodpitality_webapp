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
import { useUpdateRegistration } from '@/hooks/useRegistrations';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { Registration } from '@/types';

interface RegistrationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: Registration | null;
}

interface FormState {
  guestName: string;
  guestEmail: string;
  phone: string;
  category: string;
  amount: string;
  status: string;
  notes: string;
}

function toFormState(r: Registration): FormState {
  return {
    guestName: r.guestName ?? '',
    guestEmail: r.guestEmail ?? '',
    phone: r.phone ?? '',
    category: r.category ?? '',
    amount: r.amount != null ? String(r.amount) : '',
    status: r.status ?? '',
    notes: r.notes ?? '',
  };
}

export function RegistrationEditDialog({ open, onOpenChange, registration }: RegistrationEditDialogProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const updateMutation = useUpdateRegistration();

  useEffect(() => {
    if (open && registration) setForm(toFormState(registration));
  }, [open, registration?.id]);

  if (!registration || !form) return null;

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (updateMutation.isPending || !form) return;
    updateMutation.mutate(
      {
        id: registration!.id,
        data: {
          guestName: form.guestName,
          guestEmail: form.guestEmail,
          phone: form.phone,
          category: form.category,
          amount: form.amount ? Number(form.amount) : undefined,
          status: form.status as Registration['status'],
          notes: form.notes,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  const submitError = updateMutation.error ? getFriendlyErrorMessage(updateMutation.error, 'Unable to save registration.') : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !updateMutation.isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Registration</DialogTitle>
          <DialogDescription>{registration.event}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {submitError && (
              <Alert variant="destructive" className="sm:col-span-2">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reg-name">Guest Name</Label>
              <Input id="reg-name" value={form.guestName} onChange={(e) => update('guestName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" value={form.guestEmail} onChange={(e) => update('guestEmail', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-phone">Phone</Label>
              <Input id="reg-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-category">Category</Label>
              <Input id="reg-category" value={form.category} onChange={(e) => update('category', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-amount">Amount</Label>
              <Input id="reg-amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reg-status">Status</Label>
              <Select value={form.status || undefined} onValueChange={(v) => update('status', v)}>
                <SelectTrigger id="reg-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reg-notes">Notes</Label>
              <Input id="reg-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending}>Cancel</Button>
            <Button type="submit" loading={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
