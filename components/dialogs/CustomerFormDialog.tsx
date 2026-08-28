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
import { CUSTOMER_TIERS, PREFERRED_CONTACT_OPTIONS } from '@/constants';
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from '@/services/customer.service';

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  tier: string;
  balance: string;
  visits: string;
  allergyNotes: string;
  preferredContact: string;
  nextAppointment: string;
}

const EMPTY_FORM: FormState = {
  name: '', email: '', phone: '', company: '', designation: '', tier: '',
  balance: '', visits: '', allergyNotes: '', preferredContact: '', nextAppointment: '',
};

function toFormState(customer: Customer): FormState {
  return {
    name: customer.name ?? '',
    email: customer.email ?? '',
    phone: customer.phone ?? '',
    company: customer.company ?? '',
    designation: customer.designation ?? '',
    tier: customer.tier ?? '',
    balance: customer.balance !== undefined ? String(customer.balance) : '',
    visits: customer.visits !== undefined ? String(customer.visits) : '',
    allergyNotes: customer.allergyNotes ?? '',
    preferredContact: customer.preferredContact ?? '',
    nextAppointment: customer.nextAppointment ? customer.nextAppointment.slice(0, 16) : '',
  };
}

/**
 * `isEditing` changes how blank free-text fields are sent: on create, they're omitted so the
 * backend can apply its own defaults for a brand-new item. On update, the sibling Guest edit
 * form proved the backend's UpdateItem call builds its DynamoDB UpdateExpression assuming every
 * free-text field it knows about is present in the body — omitting one crashes with "Invalid
 * UpdateExpression ... attribute value is not defined" — so edits always send
 * company/designation/allergyNotes, even as empty strings, to clear them safely. tier/
 * preferredContact/balance/visits/nextAppointment stay conditional: they're either a real enum
 * select or numeric/date fields where "send 0/blank" and "leave untouched" aren't the same
 * thing, and this hasn't been confirmed to hit the same crash — revisit if it does.
 */
function toPayload(form: FormState, isEditing: boolean): CreateCustomerPayload {
  const payload: CreateCustomerPayload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
  };
  if (isEditing || form.company.trim())      payload.company = form.company.trim();
  if (isEditing || form.designation.trim())  payload.designation = form.designation.trim();
  if (form.tier)                             payload.tier = form.tier;
  if (form.balance !== '')                   payload.balance = Number(form.balance);
  if (form.visits !== '')                    payload.visits = Number(form.visits);
  if (isEditing || form.allergyNotes.trim()) payload.allergyNotes = form.allergyNotes.trim();
  if (form.preferredContact)                 payload.preferredContact = form.preferredContact;
  if (form.nextAppointment)                  payload.nextAppointment = form.nextAppointment;
  return payload;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'phone', string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.phone.trim()) errors.phone = 'Phone is required';
  else if (!isValidPhone(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  return errors;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (payload: CreateCustomerPayload | UpdateCustomerPayload) => void;
}

export function CustomerFormDialog({
  open, onOpenChange, customer, isSubmitting, submitError, onSubmit,
}: CustomerFormDialogProps) {
  const isEditing = !!customer;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Reset the form only when the dialog transitions to open, so a failed submit doesn't wipe what the user typed.
  useEffect(() => {
    if (open) {
      setForm(customer ? toFormState(customer) : EMPTY_FORM);
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer?.id]);

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
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this customer’s information.' : 'Add a new customer record.'}
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
              <Label htmlFor="cust-name">Name *</Label>
              <Input
                id="cust-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Jane Doe"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'cust-name-error' : undefined}
              />
              {fieldErrors.name && <p id="cust-name-error" className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-email">Email *</Label>
              <Input
                id="cust-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="jane@example.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'cust-email-error' : undefined}
              />
              {fieldErrors.email && <p id="cust-email-error" className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">Phone *</Label>
              <Input
                id="cust-phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'cust-phone-error' : undefined}
              />
              {fieldErrors.phone && <p id="cust-phone-error" className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-company">Company</Label>
              <Input id="cust-company" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Acme Inc." />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-designation">Designation</Label>
              <Input id="cust-designation" value={form.designation} onChange={(e) => update('designation', e.target.value)} placeholder="Director" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-tier">Tier</Label>
              <Select value={form.tier || undefined} onValueChange={(v) => update('tier', v)}>
                <SelectTrigger id="cust-tier"><SelectValue placeholder="Select tier" /></SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-contact">Preferred Contact</Label>
              <Select value={form.preferredContact || undefined} onValueChange={(v) => update('preferredContact', v)}>
                <SelectTrigger id="cust-contact"><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {PREFERRED_CONTACT_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-balance">Balance</Label>
              <Input id="cust-balance" type="number" step="0.01" value={form.balance} onChange={(e) => update('balance', e.target.value)} placeholder="0.00" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust-visits">Visits</Label>
              <Input id="cust-visits" type="number" min="0" step="1" value={form.visits} onChange={(e) => update('visits', e.target.value)} placeholder="0" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cust-next-appt">Next Appointment</Label>
              <Input id="cust-next-appt" type="datetime-local" value={form.nextAppointment} onChange={(e) => update('nextAppointment', e.target.value)} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cust-allergy">Allergy Notes</Label>
              <Textarea id="cust-allergy" value={form.allergyNotes} onChange={(e) => update('allergyNotes', e.target.value)} placeholder="Optional" rows={2} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
