'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { GuestCombobox } from '@/components/common/GuestCombobox';
import { guestService } from '@/services/guest.service';
import { guestKeys } from '@/hooks/use-guests';
import { GUARDIAN_RELATIONSHIPS, ageLabel, type FamilyFormFields } from '@/constants/family';
import {
  getDuplicatePersonConflict, getFriendlyErrorMessage, isValidEmail, isValidPhone, toLocalDateInput,
} from '@/lib/utils';
import type { Guest } from '@/types';

export type FamilyErrors = Partial<Record<'dateOfBirth' | 'guardian' | 'schoolEmail', string>>;

/**
 * The "Family & school" part of the patient form, shown once the desk ticks "This patient is a
 * child or dependant".
 *
 * The parent or guardian is another patient record. If they are not registered yet, the desk adds
 * them right here ("Register new parent") instead of abandoning the child's form — they are saved
 * first, then linked, and the child's form keeps everything typed so far.
 */
export function FamilySection({
  family, onChange, guardian, onChooseGuardian, errors, childAddress, selfId, personNoun, personsNoun,
}: {
  family: FamilyFormFields;
  onChange: <K extends keyof FamilyFormFields>(key: K, value: string) => void;
  guardian: Guest | null;
  onChooseGuardian: (g: Guest | null) => void;
  errors: FamilyErrors;
  /** The child's address as typed: the parent usually shares it. */
  childAddress: string;
  /** The record being edited, which cannot be its own guardian. */
  selfId?: string;
  personNoun: string;
  personsNoun: string;
}) {
  const [adding, setAdding] = useState(false);
  const age = ageLabel(family.dateOfBirth, toLocalDateInput());

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
      {/* 1. Who looks after them */}
      <div className="space-y-1.5">
        <Label>Parent or guardian *</Label>
        {guardian ? (
          <div className="flex items-start justify-between gap-3 rounded-md border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
            <div className="flex min-w-0 items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <div className="min-w-0 text-sm">
                <p className="font-medium">Linked to {guardian.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[guardian.email || 'No email on file', guardian.phone].filter(Boolean).join(' · ')}
                </p>
                <p className="text-xs text-muted-foreground">School notes and emails go to them.</p>
              </div>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={() => onChooseGuardian(null)} aria-label="Remove the parent or guardian">
              <X className="mr-1 h-4 w-4" /> Change
            </Button>
          </div>
        ) : adding ? (
          <NewParent
            defaultAddress={childAddress}
            onCancel={() => setAdding(false)}
            onSaved={(g) => { setAdding(false); onChooseGuardian(g); }}
          />
        ) : (
          <>
            <GuestCombobox
              selected={null}
              onSelectGuest={(g) => onChooseGuardian(g)}
              placeholder={`Search registered ${personsNoun.toLowerCase()} by name, email or phone…`}
            />
            <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setAdding(true)}>
              <UserPlus className="mr-1.5 h-4 w-4" /> Parent not registered yet? Register them here
            </Button>
          </>
        )}
        {errors.guardian && <p className="text-xs text-destructive">{errors.guardian}</p>}
        {selfId && guardian?.id === selfId && (
          <p className="text-xs text-destructive">A {personNoun.toLowerCase()} cannot be their own parent or guardian.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="guest-relationship">Relationship</Label>
          <Select
            value={family.guardianRelationship || undefined}
            onValueChange={(v) => onChange('guardianRelationship', v)}
            disabled={!guardian}
          >
            <SelectTrigger id="guest-relationship">
              <SelectValue placeholder={guardian ? 'Parent' : 'Link the parent first'} />
            </SelectTrigger>
            <SelectContent>
              {GUARDIAN_RELATIONSHIPS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-dob">Date of birth</Label>
          <Input
            id="guest-dob"
            type="date"
            max={toLocalDateInput()}
            value={family.dateOfBirth}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            aria-invalid={!!errors.dateOfBirth}
          />
          {errors.dateOfBirth
            ? <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
            : age && <p className="text-xs text-muted-foreground">{age}</p>}
        </div>
      </div>

      {/* 2. Their school — only needed for school excuse notes */}
      <div className="grid grid-cols-1 gap-4 border-t pt-3 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="guest-school">School (optional)</Label>
          <Input
            id="guest-school"
            value={family.schoolName}
            onChange={(e) => onChange('schoolName', e.target.value)}
            placeholder="Lincoln Elementary"
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="guest-grade">Grade</Label>
          <Input
            id="guest-grade"
            value={family.schoolGrade}
            onChange={(e) => onChange('schoolGrade', e.target.value)}
            placeholder="4"
            maxLength={40}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor="guest-school-email">School attendance office email</Label>
          <Input
            id="guest-school-email"
            type="email"
            value={family.schoolEmail}
            onChange={(e) => onChange('schoolEmail', e.target.value)}
            placeholder="attendance@school.edu"
            aria-invalid={!!errors.schoolEmail}
          />
          {errors.schoolEmail
            ? <p className="text-xs text-destructive">{errors.schoolEmail}</p>
            : (
              <p className="text-xs text-muted-foreground">
                Notes go here only after the parent gives permission — record it on the {personNoun.toLowerCase()}&apos;s page.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

/**
 * Register the parent without leaving the child's form. Saved straight away, then linked. An email
 * that already belongs to someone links that person instead of failing.
 */
function NewParent({
  defaultAddress, onCancel, onSaved,
}: { defaultAddress: string; onCancel: () => void; onSaved: (g: Guest) => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(defaultAddress);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    if (!name.trim()) { setError("Enter the parent's full name."); return; }
    if (!isValidEmail(email.trim())) { setError("Enter the parent's email — school notes are sent there."); return; }
    if (!isValidPhone(phone.trim())) { setError("Enter the parent's phone number."); return; }
    if (!address.trim()) { setError("Enter the parent's address."); return; }
    setSaving(true);
    setError(null);
    try {
      const created = await guestService.createGuest({
        name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim(),
      });
      qc.invalidateQueries({ queryKey: guestKeys.all });
      onSaved({ ...created, id: created.id || (created.PK ?? '').replace('GUEST#', '') });
    } catch (err) {
      const conflict = getDuplicatePersonConflict(err);
      if (conflict) {
        // Already registered under this email: link that record rather than make a second one.
        try {
          const existing = await guestService.getGuest(conflict.id);
          onSaved(existing);
          return;
        } catch {
          setError('Someone with this email is already registered. Search for them above instead.');
        }
      } else {
        setError((err as { backendMessage?: string })?.backendMessage ?? getFriendlyErrorMessage(err, 'Could not register the parent.'));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border bg-card p-3">
      <p className="text-sm font-medium">Register the parent or guardian</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="parent-name">Full name *</Label>
          <Input id="parent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Johnson" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="parent-email">Email *</Label>
          <Input id="parent-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="parent-phone">Phone *</Label>
          <Input id="parent-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="parent-address">Address *</Label>
          <Textarea id="parent-address" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="button" size="sm" onClick={save} loading={saving}>Save parent &amp; link</Button>
      </div>
    </div>
  );
}
