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
import { isValidEmail, isValidPhone } from '@/lib/utils';
import { GUEST_CATEGORIES } from '@/constants';
import type { CreateGuestPayload, UpdateGuestPayload } from '@/services/guest.service';
import type { Guest } from '@/types';

interface FormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: '', email: '', phone: '', address: '', category: '', notes: '',
};

function toFormState(guest: Guest): FormState {
  return {
    name: guest.name ?? '',
    email: guest.email ?? '',
    phone: guest.phone ?? '',
    address: guest.address ?? '',
    category: guest.category ?? '',
    notes: guest.notes ?? '',
  };
}

/**
 * `isEditing` changes how blank optional fields are sent: on create, they're omitted so the
 * backend can apply its own defaults for a brand-new item. On update, the backend's UpdateItem
 * call builds its DynamoDB UpdateExpression assuming every free-text field it knows about is
 * present in the body (confirmed by a live 500: "Invalid UpdateExpression ... attribute value
 * is not defined; attribute value: :notes" when `notes` was omitted from a PUT) — so edits
 * always send notes, even as an empty string, to clear it safely.
 * `category` stays conditional since it's a real enum select, not free text.
 */
function toPayload(form: FormState, isEditing: boolean): CreateGuestPayload {
  const payload: CreateGuestPayload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
  };
  if (form.category)                  payload.category = form.category as Guest['category'];
  if (isEditing || form.notes.trim()) payload.notes = form.notes.trim();
  return payload;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'address', string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.phone.trim()) errors.phone = 'Phone is required';
  else if (!isValidPhone(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  if (!form.address.trim()) errors.address = 'Address is required';
  return errors;
}

interface GuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (payload: CreateGuestPayload | UpdateGuestPayload) => void;
}

export function GuestFormDialog({
  open, onOpenChange, guest, isSubmitting, submitError, onSubmit,
}: GuestFormDialogProps) {
  const isEditing = !!guest;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Reset the form only when the dialog transitions to open, so a failed submit doesn't wipe what the user typed.
  useEffect(() => {
    if (open) {
      setForm(guest ? toFormState(guest) : EMPTY_FORM);
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guest?.id]);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key as keyof FieldErrors]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    onSubmit(toPayload(form, isEditing));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this guest’s information.' : 'Add a new guest record.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {submitError && (
              <Alert variant="destructive" className="sm:col-span-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="guest-name">Full name *</Label>
              <Input
                id="guest-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Jane Smith"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'guest-name-error' : undefined}
              />
              {fieldErrors.name && <p id="guest-name-error" className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guest-email">Email *</Label>
              <Input
                id="guest-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="jane@example.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'guest-email-error' : undefined}
              />
              {fieldErrors.email && <p id="guest-email-error" className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guest-phone">Phone *</Label>
              <Input
                id="guest-phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 234 567 8900"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'guest-phone-error' : undefined}
              />
              {fieldErrors.phone && <p id="guest-phone-error" className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="guest-address">Address *</Label>
              <Textarea
                id="guest-address"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="12 MG Road, Bengaluru"
                rows={2}
                aria-invalid={!!fieldErrors.address}
                aria-describedby={fieldErrors.address ? 'guest-address-error' : undefined}
              />
              {fieldErrors.address && <p id="guest-address-error" className="text-xs text-destructive">{fieldErrors.address}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="guest-category">Category</Label>
              <Select value={form.category || undefined} onValueChange={(v) => update('category', v)}>
                <SelectTrigger id="guest-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {GUEST_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="guest-notes">Notes</Label>
              <Textarea id="guest-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Optional" rows={2} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Guest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
