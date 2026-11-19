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
import Link from 'next/link';
import { AlertCircle, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { FacePhotoField } from '@/components/faces/FacePhotoField';
import { FamilySection } from '@/components/people/FamilySection';
import { isValidEmail, isValidPhone, toLocalDateInput } from '@/lib/utils';
import { guestCategoryOptions } from '@/constants';
import {
  EMPTY_FAMILY_FIELDS, ageLabel, familyFieldsOf, familyPayload, hasFamilyDetails,
  type FamilyFormFields,
} from '@/constants/family';
import { useTerminology } from '@/hooks';
import {
  EMPTY_INSURANCE_FORM, INSURANCE_FIELD_MAX, hasInsurance, insuranceFormOf, insurancePayload,
  insuranceTooLong, isClinicalIndustry, sameInsurance, type InsuranceForm,
} from '@/lib/clinical';
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
  if (form.category)                  payload.category = form.category;
  if (isEditing || form.notes.trim()) payload.notes = form.notes.trim();
  return payload;
}

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'address' | 'dateOfBirth' | 'guardian' | 'schoolEmail' | 'insurance', string>>;

/**
 * With a parent or guardian chosen, email and phone are optional — the hospital writes to the
 * guardian, and a child has neither. Whatever is typed must still be valid.
 */
function validate(form: FormState, family: FamilyFormFields | null, selfId?: string): FieldErrors {
  const errors: FieldErrors = {};
  const hasGuardian = !!family?.guardianId;
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.trim()) { if (!hasGuardian) errors.email = 'Email is required'; }
  else if (!isValidEmail(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.phone.trim()) { if (!hasGuardian) errors.phone = 'Phone is required'; }
  else if (!isValidPhone(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  if (!form.address.trim()) errors.address = 'Address is required';
  if (family) {
    if (!family.guardianId) errors.guardian = 'Link the parent or guardian — or untick "child or dependant"';
    if (family.dateOfBirth && family.dateOfBirth > toLocalDateInput()) errors.dateOfBirth = 'Date of birth cannot be in the future';
    if (selfId && family.guardianId === selfId) errors.guardian = 'A person cannot be their own parent or guardian';
    if (family.schoolEmail.trim() && !isValidEmail(family.schoolEmail.trim())) errors.schoolEmail = 'Enter a valid email address';
  }
  return errors;
}

interface GuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  /** `photo` is only ever set when creating — an optional face photo to enrol once saved. */
  onSubmit: (payload: CreateGuestPayload | UpdateGuestPayload, photo?: string | null) => void;
  /** A problem with the photo reported by the caller (e.g. no face found in it). */
  photoError?: string | null;
}

export function GuestFormDialog({
  open, onOpenChange, guest, isSubmitting, submitError, onSubmit, photoError,
}: GuestFormDialogProps) {
  const t = useTerminology();
  const industry = t.slug;
  const isEditing = !!guest;
  // A hospital records a patient's family and school, for school excuse notes. Other industries
  // never see these fields, and their payloads are unchanged.
  const showFamily = t.has('opd');
  // Hospitals and pharmacies record insurance; other industries never see it and send nothing.
  const showInsurance = isClinicalIndustry(industry);
  // ...and a date of birth for every patient, not only children: an outside booking channel
  // (Zocdoc) finds the right patient by name and date of birth. It lives in `family.dateOfBirth`,
  // the one field the backend already validates, so the child section no longer asks for it.
  const showDateOfBirth = isClinicalIndustry(industry);
  const [insurance, setInsurance] = useState<InsuranceForm>(EMPTY_INSURANCE_FORM);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [family, setFamily] = useState<FamilyFormFields>(EMPTY_FAMILY_FIELDS);
  const [guardian, setGuardian] = useState<Guest | null>(null);
  // "This patient is a child or dependant": the family fields show only when it is ticked, so an
  // ordinary adult's form stays short. Unticked, they are ignored (and cleared on an edit).
  const [isChild, setIsChild] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  // Reset the form only when the dialog transitions to open, so a failed submit doesn't wipe what the user typed.
  useEffect(() => {
    if (open) {
      setForm(guest ? toFormState(guest) : EMPTY_FORM);
      setInsurance(insuranceFormOf(guest?.insurance));
      setFamily(familyFieldsOf(guest));
      setIsChild(hasFamilyDetails(guest));
      setGuardian(guest?.guardianId
        ? ({
          id: guest.guardianId,
          name: guest.guardian?.name || 'Linked parent or guardian',
          email: guest.guardian?.email ?? '',
          phone: guest.guardian?.phone ?? '',
        } as Guest)
        : null);
      setFieldErrors({});
      setPhoto(null);
      setConsent(false);
      setConsentError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guest?.id]);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key as keyof FieldErrors]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function updateFamily<K extends keyof FamilyFormFields>(key: K, value: string) {
    setFamily((f) => ({ ...f, [key]: value }));
    const errorKey = key === 'guardianId' ? 'guardian' : key;
    if (fieldErrors[errorKey as keyof FieldErrors]) setFieldErrors((e) => ({ ...e, [errorKey]: undefined }));
  }

  function chooseGuardian(g: Guest | null) {
    setGuardian(g);
    updateFamily('guardianId', g?.id ?? '');
    // A child usually lives with the parent: start from their address, never overwrite one typed.
    if (g?.address && !form.address.trim()) update('address', g.address);
    // Email and phone may now be optional, so their "required" errors no longer apply.
    if (g) setFieldErrors((e) => ({ ...e, email: undefined, phone: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validate(form, showFamily && isChild ? family : null, guest?.id);
    if (showInsurance && insuranceTooLong(insurance)) {
      errors.insurance = `Insurance details are limited to ${INSURANCE_FIELD_MAX} characters each.`;
    }
    // A child's date of birth is checked by validate(); an adult's is checked here.
    if (showDateOfBirth && !errors.dateOfBirth && family.dateOfBirth && family.dateOfBirth > toLocalDateInput()) {
      errors.dateOfBirth = 'Date of birth cannot be in the future';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (!isEditing && photo && !consent) {
      setConsentError('Tick the consent box, or remove the photo to save without one.');
      return;
    }
    // Unticking "child or dependant" clears the guardian and school, but no longer the date of
    // birth when every patient may have one. familyPayload sends only what changed, so an
    // untouched date of birth is never rewritten.
    const keptDateOfBirth = showDateOfBirth ? family.dateOfBirth : '';
    const payload: CreateGuestPayload = {
      ...toPayload(form, isEditing),
      ...(showFamily
        ? familyPayload(
          isChild ? family : { ...EMPTY_FAMILY_FIELDS, dateOfBirth: keptDateOfBirth },
          isEditing ? familyFieldsOf(guest) : null,
        )
        : showDateOfBirth
          ? familyPayload(
            { ...EMPTY_FAMILY_FIELDS, dateOfBirth: family.dateOfBirth },
            isEditing ? { ...EMPTY_FAMILY_FIELDS, dateOfBirth: guest?.dateOfBirth ?? '' } : null,
          )
          : {}),
    };
    // Sent only when there is something new: a new patient with details, or an edit that changed
    // them. An edit that empties every field sends {}, which clears it on the server.
    if (showInsurance) {
      const next = insurancePayload(insurance);
      if (isEditing ? !sameInsurance(guest?.insurance, next) : hasInsurance(next)) payload.insurance = next;
    }
    onSubmit(payload, isEditing ? null : photo);
  }

  const hasGuardian = showFamily && isChild && !!family.guardianId;
  const guardianFirstName = (guardian?.name ?? '').split(' ')[0] || 'the guardian';
  const dependants = isEditing ? guest?.dependants ?? [] : [];

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${t.person.one}` : `Add ${t.person.one}`}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update this ${t.person.one.toLowerCase()}’s information.` : `Add a new ${t.person.one.toLowerCase()} record.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            {submitError && (
              <Alert variant="destructive" className="sm:col-span-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {!isEditing && (
              <div className="sm:col-span-2">
                <FacePhotoField
                  photo={photo}
                  onPhotoChange={(p) => { setPhoto(p); setConsentError(null); }}
                  consent={consent}
                  onConsentChange={(c) => { setConsent(c); setConsentError(null); }}
                  personLabel={t.person.one.toLowerCase()}
                  error={consentError ?? (photo ? photoError : null)}
                  disabled={isSubmitting}
                />
              </div>
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

            {showFamily && dependants.length > 0 && (
              <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm sm:col-span-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <p>
                  Parent or guardian of{' '}
                  {dependants.map((d, i) => (
                    <span key={d.id}>
                      {i > 0 && ', '}
                      <Link href={`/guests/${d.id}`} className="font-medium text-primary hover:underline">{d.name || 'Unnamed'}</Link>
                    </span>
                  ))}
                  . Their notes and emails come to this {t.person.one.toLowerCase()}.
                </p>
              </div>
            )}

            {showFamily && (
              <div className="space-y-3 sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-2.5 rounded-md border p-3 text-sm">
                  <Checkbox
                    checked={isChild}
                    onCheckedChange={(v) => {
                      setIsChild(v === true);
                      setFieldErrors((e) => ({ ...e, guardian: undefined, dateOfBirth: undefined, schoolEmail: undefined }));
                    }}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">This {t.person.one.toLowerCase()} is a child or dependant</span>
                    <span className="block text-xs text-muted-foreground">
                      Link their parent or guardian — school notes and emails go to them, so the child needs no email or phone.
                    </span>
                  </span>
                </label>
                {isChild && (
                  <FamilySection
                    family={family}
                    onChange={updateFamily}
                    guardian={guardian}
                    onChooseGuardian={chooseGuardian}
                    errors={{ guardian: fieldErrors.guardian, dateOfBirth: fieldErrors.dateOfBirth, schoolEmail: fieldErrors.schoolEmail }}
                    childAddress={form.address}
                    selfId={guest?.id}
                    personNoun={t.person.one}
                    personsNoun={t.person.many}
                    hideDateOfBirth={showDateOfBirth}
                  />
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="guest-email">{hasGuardian ? 'Email (optional)' : 'Email *'}</Label>
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
              {hasGuardian && !fieldErrors.email && (
                <p className="text-xs text-muted-foreground">Leave empty for a child — emails go to {guardianFirstName}.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guest-phone">{hasGuardian ? 'Phone (optional)' : 'Phone *'}</Label>
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

            {showDateOfBirth && (
              <div className="space-y-1.5">
                <Label htmlFor="guest-dob">Date of birth{isChild ? '' : ' (optional)'}</Label>
                <Input
                  id="guest-dob"
                  type="date"
                  max={toLocalDateInput()}
                  value={family.dateOfBirth}
                  onChange={(e) => updateFamily('dateOfBirth', e.target.value)}
                  aria-invalid={!!fieldErrors.dateOfBirth}
                  aria-describedby="guest-dob-note"
                />
                <p id="guest-dob-note" className={fieldErrors.dateOfBirth ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
                  {fieldErrors.dateOfBirth
                    || ageLabel(family.dateOfBirth, toLocalDateInput())
                    || 'Used to match the right patient, e.g. for online bookings.'}
                </p>
              </div>
            )}

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
                  {guestCategoryOptions(industry, form.category).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {showInsurance && (
              <fieldset className="space-y-3 rounded-md border p-3 sm:col-span-2">
                <legend className="px-1 text-sm font-medium">Insurance <span className="font-normal text-muted-foreground">(optional)</span></legend>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={insurance.selfPay}
                    onCheckedChange={(v) => {
                      setInsurance((i) => ({ ...i, selfPay: v === true }));
                      setFieldErrors((e) => ({ ...e, insurance: undefined }));
                    }}
                  />
                  Self-pay (no insurance)
                </label>
                {!insurance.selfPay && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {([
                      ['carrier', 'Insurance company', 'e.g. Blue Cross Blue Shield'],
                      ['plan', 'Plan', 'e.g. PPO Gold'],
                      ['memberId', 'Member ID', 'From the insurance card'],
                      ['groupNumber', 'Group number', 'From the insurance card'],
                    ] as const).map(([key, label, placeholder]) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={`guest-ins-${key}`}>{label}</Label>
                        <Input
                          id={`guest-ins-${key}`}
                          value={insurance[key]}
                          maxLength={INSURANCE_FIELD_MAX}
                          onChange={(e) => {
                            const value = e.target.value;
                            setInsurance((i) => ({ ...i, [key]: value }));
                            setFieldErrors((er) => ({ ...er, insurance: undefined }));
                          }}
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {fieldErrors.insurance && <p className="text-xs text-destructive">{fieldErrors.insurance}</p>}
              </fieldset>
            )}

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
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : `Add ${t.person.one}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
