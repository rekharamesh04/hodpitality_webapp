'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { GuestCombobox } from '@/components/common/GuestCombobox';
import { StaffSelect } from '@/components/common/StaffSelect';
import { PriorityPicker } from '@/components/opd/PriorityPicker';
import { useServices } from '@/hooks/useCalendar';
import { useWalkIn } from '@/hooks/useOpd';
import { useTerminology } from '@/hooks';
import type { Guest, VisitPriority } from '@/types';

export interface WalkInPatient {
  id: string;
  name: string;
}

type FieldErrors = Partial<Record<'patient' | 'doctor' | 'amount', string>>;

/** Radix Select refuses an empty item value, so "no service" needs a sentinel. */
const NO_SERVICE = '__default__';

/**
 * A walk-in: someone who needs a doctor today and has no appointment.
 *
 * Opened either blank, from the queue's "Walk-in" button, or for a patient the
 * entrance already checked in by face or QR, who is on site but on nobody's list.
 * Either way it ends with the patient in a doctor's queue with a token.
 */
export function WalkInDialog({
  open, onOpenChange, presetPatient, onSiteIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already checked in at the entrance — their arrival is not logged again. */
  presetPatient?: WalkInPatient | null;
  /** People with an open check-in today, so choosing one never logs a second visit. */
  onSiteIds: ReadonlySet<string>;
}) {
  const t = useTerminology();
  const walkIn = useWalkIn();
  const { data: services } = useServices();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [staffId, setStaffId] = useState('');
  const [service, setService] = useState(NO_SERVICE);
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState<VisitPriority>('routine');
  const [complaint, setComplaint] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;
    setGuest(null); setStaffId(''); setService(NO_SERVICE); setAmount('');
    setPriority('routine'); setComplaint(''); setErrors({});
  }, [open]);

  const patient: WalkInPatient | null = presetPatient
    ?? (guest ? { id: guest.id ?? (guest.PK ? guest.PK.replace('GUEST#', '') : ''), name: guest.name ?? '' } : null);
  const person = t.person.one.toLowerCase();
  const doctor = t.practitioner.toLowerCase();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (walkIn.isPending) return;
    const found: FieldErrors = {};
    if (!patient?.id) found.patient = `Choose the ${person}`;
    if (!staffId) found.doctor = `Choose the ${doctor}`;
    if (amount.trim() && (!Number.isFinite(Number(amount)) || Number(amount) < 0)) found.amount = 'Enter a fee of 0 or more';
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    walkIn.mutate(
      {
        patientId: patient!.id,
        patientName: patient!.name || t.person.one,
        staffId,
        service: service === NO_SERVICE ? undefined : service,
        amount: amount.trim() ? Number(amount) : undefined,
        visitPriority: priority,
        complaint,
        alreadyOnSite: !!presetPatient || onSiteIds.has(patient!.id),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !walkIn.isPending && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{presetPatient ? `Assign a ${doctor}` : 'Walk-in'}</DialogTitle>
            <DialogDescription>
              {presetPatient
                ? `${presetPatient.name} is checked in but on nobody's list. Choose who will see them.`
                : `Add a ${person} with no appointment straight to a ${doctor}'s queue.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>{t.person.one}</Label>
              {presetPatient ? (
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium">{presetPatient.name}</p>
              ) : (
                <>
                  <GuestCombobox
                    selected={guest}
                    onSelectGuest={(g) => { setGuest(g); setErrors((x) => ({ ...x, patient: undefined })); }}
                    disabled={walkIn.isPending}
                    placeholder={`Search ${t.person.many.toLowerCase()}…`}
                  />
                  <Link href="/guests?action=add" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <UserPlus className="h-3 w-3" aria-hidden="true" /> New {person}? Register them first
                  </Link>
                </>
              )}
              {errors.patient && <p className="text-xs text-destructive">{errors.patient}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="walkin-doctor">{t.practitioner}</Label>
              <StaffSelect
                id="walkin-doctor"
                value={staffId}
                onChange={(id) => { setStaffId(id); setErrors((x) => ({ ...x, doctor: undefined })); }}
                disabled={walkIn.isPending}
                placeholder={`Select ${doctor}`}
                noun={doctor}
              />
              {errors.doctor && <p className="text-xs text-destructive">{errors.doctor}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="walkin-service">Service</Label>
                <Select value={service} onValueChange={setService} disabled={walkIn.isPending}>
                  <SelectTrigger id="walkin-service"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SERVICE}>Consultation (default)</SelectItem>
                    {(services ?? []).filter((s) => s.name).map((s) => (
                      <SelectItem key={s.id || s.name} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="walkin-fee">Fee</Label>
                <Input
                  id="walkin-fee"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrors((x) => ({ ...x, amount: undefined })); }}
                  disabled={walkIn.isPending}
                />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <PriorityPicker value={priority} onChange={setPriority} disabled={walkIn.isPending} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="walkin-complaint">Complaint</Label>
              <Textarea
                id="walkin-complaint"
                rows={2}
                placeholder="Why they came in today"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                disabled={walkIn.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={walkIn.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={walkIn.isPending}>Add to queue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
