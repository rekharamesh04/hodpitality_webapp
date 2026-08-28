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
import { AlertCircle } from 'lucide-react';
import { isValidEmail, isValidPhone } from '@/lib/utils';
import type { CreateStaffPayload, UpdateStaffPayload } from '@/services/staff.service';
import type { Staff } from '@/types';

interface FormState {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: string;
}

function emptyForm(): FormState {
  return { name: '', email: '', phone: '', department: '', role: '', status: '' };
}

function toFormState(staff: Staff): FormState {
  return {
    name: staff.name ?? '',
    email: staff.email ?? '',
    phone: staff.phone ?? '',
    department: staff.department ?? '',
    role: typeof staff.role === 'string' ? staff.role : '',
    status: staff.status ?? '',
  };
}

/** `isEditing` mirrors the pattern proven necessary for Guest/Customer/Venue/Event edits: the
 * backend's UpdateItem call needs free-text fields present in the body even blank, or it can
 * 500 on a missing DynamoDB expression attribute value. Create omits blank optional fields so
 * the backend can default a brand-new item. Email is deliberately excluded from the edit
 * payload — see the "Email" field note below. */
function toCreatePayload(form: FormState): CreateStaffPayload {
  const payload: CreateStaffPayload = {
    name: form.name.trim(),
    email: form.email.trim(),
  };
  if (form.phone.trim())       payload.phone = form.phone.trim();
  if (form.department.trim()) payload.department = form.department.trim();
  if (form.role)               payload.role = form.role;
  if (form.status)             payload.status = form.status as Staff['status'];
  return payload;
}

function toUpdatePayload(form: FormState): UpdateStaffPayload {
  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    role: form.role || undefined,
    status: (form.status || undefined) as Staff['status'] | undefined,
  };
}

type FieldErrors = Partial<Record<'name' | 'email' | 'phone', string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(form.email.trim())) errors.email = 'Enter a valid email address';
  if (form.phone.trim() && !isValidPhone(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  return errors;
}

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  roleOptions: string[];
  departmentOptions: string[];
  onSubmit: (payload: CreateStaffPayload | UpdateStaffPayload) => void;
}

export function StaffFormDialog({
  open, onOpenChange, staff, isSubmitting, submitError, roleOptions, departmentOptions, onSubmit,
}: StaffFormDialogProps) {
  const isEditing = !!staff;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setForm(staff ? toFormState(staff) : emptyForm());
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff?.id]);

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
    onSubmit(isEditing ? toUpdatePayload(form) : toCreatePayload(form));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update this staff member’s details.'
              : 'Adds a staff record and sends an account invite to their email.'}
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
              <Label htmlFor="staff-name">Name *</Label>
              <Input
                id="staff-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Jane Smith"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'staff-name-error' : undefined}
              />
              {fieldErrors.name && <p id="staff-name-error" className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Email *</Label>
              <Input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="jane@example.com"
                disabled={isEditing}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'staff-email-error' : 'staff-email-hint'}
              />
              {fieldErrors.email && <p id="staff-email-error" className="text-xs text-destructive">{fieldErrors.email}</p>}
              {isEditing && !fieldErrors.email && (
                <p id="staff-email-hint" className="text-xs text-muted-foreground">Email is tied to their account and can’t be changed here.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1 234 567 8900"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'staff-phone-error' : undefined}
              />
              {fieldErrors.phone && <p id="staff-phone-error" className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-department">Department</Label>
              <Input
                id="staff-department"
                list="staff-department-options"
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                placeholder="Front Desk, Operations…"
              />
              <datalist id="staff-department-options">
                {departmentOptions.map((d) => <option key={d} value={d} />)}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-role">Role</Label>
              <Select value={form.role || undefined} onValueChange={(v) => update('role', v)}>
                <SelectTrigger id="staff-role"><SelectValue placeholder="Backend default" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="space-y-1.5">
                <Label htmlFor="staff-status">Status</Label>
                <Select value={form.status || undefined} onValueChange={(v) => update('status', v)}>
                  <SelectTrigger id="staff-status"><SelectValue placeholder="Backend default" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
