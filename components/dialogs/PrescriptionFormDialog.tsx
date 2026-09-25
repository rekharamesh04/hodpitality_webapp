'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { GuestCombobox } from '@/components/common/GuestCombobox';
import { StaffSelect } from '@/components/common/StaffSelect';
import { useCreatePrescription, useUpdatePrescription } from '@/hooks/usePrescriptions';
import { useTerminology } from '@/hooks';
import { popup } from '@/lib/popup';
import type { Guest } from '@/types';
import type { Medicine, Prescription } from '@/types/prescription';
import { medicinesOf } from '@/types/prescription';

/**
 * Write or amend a prescription.
 *
 * The API requires a patient and a prescriber and validates that both rows
 * exist, answering 404 otherwise — so both are pickers over real records
 * rather than free text.
 *
 * `medicines` is stored as an untyped array, which means this form decides the
 * shape every future reader has to cope with. It writes objects with named
 * fields for that reason: a list of bare strings would be quicker to build and
 * impossible to render as anything but a sentence.
 */
export function PrescriptionFormDialog({
  open,
  onOpenChange,
  existing,
  defaultGuest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when amending; absent when writing a new one. */
  existing?: Prescription;
  /** Pre-selects the patient — e.g. when writing from their profile. */
  defaultGuest?: Guest | null;
}) {
  const t = useTerminology();
  const create = useCreatePrescription();
  const update = useUpdatePrescription();
  const isEdit = !!existing;
  const pending = create.isPending || update.isPending;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [staffId, setStaffId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setStaffId(existing.staffId ?? '');
      setDiagnosis(existing.diagnosis ?? '');
      setNotes(existing.notes ?? '');
      const meds = medicinesOf(existing).map((m) =>
        typeof m === 'string' ? { name: m, dosage: '', frequency: '', duration: '' } : m,
      );
      setMedicines(meds.length ? meds : [{ name: '', dosage: '', frequency: '', duration: '' }]);
    } else {
      setGuest(defaultGuest ?? null); setStaffId(''); setDiagnosis(''); setNotes('');
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
    }
    // defaultGuest is read only when the dialog opens, so a parent re-render
    // cannot wipe a patient the user has since changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing]);

  function setMedicine(index: number, patch: Partial<Medicine>) {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function handleSubmit() {
    const cleaned = medicines.filter((m) => (m.name ?? '').trim());
    if (!cleaned.length) {
      popup.warning('Add at least one medicine');
      return;
    }

    if (isEdit) {
      update.mutate(
        { id: existing.id, data: { medicines: cleaned, diagnosis, notes } },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    const customerId = guest?.id ?? (guest?.PK ? guest.PK.replace('GUEST#', '') : '');
    if (!customerId) { popup.warning(`Choose a ${t.person.one.toLowerCase()}`); return; }
    if (!staffId) { popup.warning(`Choose a ${t.practitioner.toLowerCase()}`); return; }

    create.mutate(
      { customerId, staffId, medicines: cleaned, diagnosis, notes },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Amend prescription' : 'New prescription'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `The ${t.person.one.toLowerCase()} and ${t.practitioner.toLowerCase()} cannot be changed after writing — cancel it and write a new one instead.`
              : `Medicines prescribed to a ${t.person.one.toLowerCase()} by one of your ${t.practitioner.toLowerCase()}s.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isEdit && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.person.one}</Label>
                <GuestCombobox selected={guest} onSelectGuest={setGuest} disabled={pending} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.practitioner}</Label>
                <StaffSelect
                  value={staffId}
                  onChange={setStaffId}
                  disabled={pending}
                  placeholder={`Select ${t.practitioner.toLowerCase()}`}
                  noun={t.practitioner.toLowerCase()}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="What is being treated"
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Medicines</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => setMedicines((m) => [...m, { name: '', dosage: '', frequency: '', duration: '' }])}
              >
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>

            {medicines.map((m, i) => (
              <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <Input
                  value={m.name ?? ''}
                  onChange={(e) => setMedicine(i, { name: e.target.value })}
                  placeholder="Medicine"
                  disabled={pending}
                  aria-label={`Medicine ${i + 1} name`}
                />
                <Input
                  value={m.dosage ?? ''}
                  onChange={(e) => setMedicine(i, { dosage: e.target.value })}
                  placeholder="500 mg"
                  disabled={pending}
                  aria-label={`Medicine ${i + 1} dosage`}
                />
                <Input
                  value={m.frequency ?? ''}
                  onChange={(e) => setMedicine(i, { frequency: e.target.value })}
                  placeholder="Twice daily"
                  disabled={pending}
                  aria-label={`Medicine ${i + 1} frequency`}
                />
                <Input
                  value={m.duration ?? ''}
                  onChange={(e) => setMedicine(i, { duration: e.target.value })}
                  placeholder="7 days"
                  disabled={pending}
                  aria-label={`Medicine ${i + 1} duration`}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={pending || medicines.length === 1}
                  onClick={() => setMedicines((prev) => prev.filter((_, x) => x !== i))}
                  aria-label={`Remove medicine ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rx-notes">Notes</Label>
            <Textarea
              id="rx-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Directions, cautions, follow-up"
              disabled={pending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button onClick={handleSubmit} loading={pending}>
            {isEdit ? 'Save changes' : 'Write prescription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
