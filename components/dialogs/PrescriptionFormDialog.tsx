'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, FileText, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { GuestCombobox } from '@/components/common/GuestCombobox';
import { StaffSelect } from '@/components/common/StaffSelect';
import { PrescriptionPhotos } from '@/components/prescriptions/PrescriptionPhotos';
import {
  useAddPrescriptionAttachments, useCreatePrescription, useUpdatePrescription,
} from '@/hooks/usePrescriptions';
import { useTerminology } from '@/hooks';
import { popup } from '@/lib/popup';
import { cn } from '@/lib/utils';
import { DOCUMENT_ACCEPT } from '@/services/document.service';
import type { Guest } from '@/types';
import type { Medicine, Prescription } from '@/types/prescription';
import { attachmentsOf, medicinesOf } from '@/types/prescription';

/** The backend's upload limit and per-prescription cap. */
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 10;
const ALLOWED_TYPES = DOCUMENT_ACCEPT.split(',');
/** HEIC is accepted but most browsers cannot draw it, so it previews as a file tile. */
const PREVIEWABLE = ['image/jpeg', 'image/png', 'image/webp'];

type PrescriberMode = 'staff' | 'outside';

const emptyMedicine = (): Medicine => ({ name: '', dosage: '', frequency: '', duration: '' });

/**
 * Write or amend a prescription.
 *
 * The API requires a patient and a prescriber and validates that both rows
 * exist, answering 404 otherwise — so the patient is a picker over real
 * records. The prescriber is a staff member, or — for paper written elsewhere,
 * which is most of what a pharmacy fills — an outside doctor by name.
 *
 * Handwriting is hard to read, so the paper can be photographed and attached.
 * A prescription may be saved from the photo alone and typed up later; it
 * cannot be handed over or completed until it is.
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
  const addPhotos = useAddPrescriptionAttachments();
  const isEdit = !!existing;
  const pending = create.isPending || update.isPending || addPhotos.isPending;

  const fileRef = useRef<HTMLInputElement>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [prescriberMode, setPrescriberMode] = useState<PrescriberMode>('staff');
  const [staffId, setStaffId] = useState('');
  const [outsideName, setOutsideName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([emptyMedicine()]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  // Set once a new prescription is saved but some photos failed: a retry then only
  // uploads photos, rather than writing the prescription a second time.
  const [savedId, setSavedId] = useState<string | null>(null);
  const locked = pending || !!savedId;

  const existingPhotos = existing ? attachmentsOf(existing) : [];

  useEffect(() => {
    if (!open) return;
    setPhotos([]);
    setPhotoError(null);
    setSavedId(null);
    if (existing) {
      setStaffId(existing.staffId ?? '');
      setDiagnosis(existing.diagnosis ?? '');
      setNotes(existing.notes ?? '');
      const meds = medicinesOf(existing).map((m) =>
        typeof m === 'string' ? { ...emptyMedicine(), name: m } : m,
      );
      setMedicines(meds.length ? meds : [emptyMedicine()]);
    } else {
      setGuest(defaultGuest ?? null); setStaffId(''); setDiagnosis(''); setNotes('');
      setPrescriberMode('staff'); setOutsideName('');
      setMedicines([emptyMedicine()]);
    }
    // defaultGuest is read only when the dialog opens, so a parent re-render
    // cannot wipe a patient the user has since changed. Keyed on the id, not
    // the object: every read re-signs the photo links, so a background refetch
    // hands back a new object and would otherwise wipe medicines being typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing?.id]);

  // Object URLs for the previews, released when the list changes or the dialog goes away.
  const previews = useMemo(
    () => photos.map((f) => (PREVIEWABLE.includes(f.type) ? URL.createObjectURL(f) : null)),
    [photos],
  );
  useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);

  function setMedicine(index: number, patch: Partial<Medicine>) {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (fileRef.current) fileRef.current.value = '';
    setPhotoError(null);
    const room = MAX_PHOTOS - existingPhotos.length - photos.length;
    const accepted: File[] = [];
    const problems: string[] = [];
    for (const f of picked) {
      if (!ALLOWED_TYPES.includes(f.type)) problems.push(`${f.name}: use a photo (JPEG, PNG, WEBP, HEIC) or a PDF`);
      else if (f.size > MAX_BYTES) problems.push(`${f.name}: larger than 8 MB`);
      else if (accepted.length >= room) problems.push(`${f.name}: a prescription can have at most ${MAX_PHOTOS} photos`);
      else accepted.push(f);
    }
    if (problems.length) setPhotoError(problems.join(' · '));
    if (accepted.length) setPhotos((prev) => [...prev, ...accepted]);
  }

  /** Uploads the new photos; the prescription is already saved, so a failure is reported, not thrown. */
  async function uploadPhotos(id: string): Promise<boolean> {
    if (!photos.length) return true;
    const { failed } = await addPhotos.mutateAsync({ id, files: photos });
    if (!failed.length) return true;
    setPhotos(failed.map((f) => f.file));
    setPhotoError(failed.map((f) => `${f.file.name}: ${f.error}`).join(' · '));
    popup.warning(`Prescription saved, but ${failed.length} photo${failed.length === 1 ? '' : 's'} did not upload`, {
      description: 'They are still listed — press the button again to retry, or cancel and add them from the prescription later.',
    });
    return false;
  }

  async function handleSubmit() {
    const cleaned = medicines.filter((m) => (m.name ?? '').trim());
    const hasPhotos = photos.length + existingPhotos.length > 0;
    if (!cleaned.length && !hasPhotos) {
      popup.warning('Add at least one medicine, or attach a photo of the prescription');
      return;
    }

    try {
      if (savedId) {
        if (await uploadPhotos(savedId)) onOpenChange(false);
        return;
      }
      if (isEdit) {
        await update.mutateAsync({ id: existing.id, data: { medicines: cleaned, diagnosis, notes } });
        if (await uploadPhotos(existing.id)) onOpenChange(false);
        return;
      }

      const customerId = guest?.id ?? (guest?.PK ? guest.PK.replace('GUEST#', '') : '');
      if (!customerId) { popup.warning(`Choose a ${t.person.one.toLowerCase()}`); return; }
      const prescriber = prescriberMode === 'staff'
        ? (staffId ? { staffId } : null)
        : (outsideName.trim() ? { prescriberName: outsideName.trim() } : null);
      if (!prescriber) {
        popup.warning(prescriberMode === 'staff'
          ? `Choose a ${t.practitioner.toLowerCase()}`
          : `Enter the outside ${t.practitioner.toLowerCase()}'s name`);
        return;
      }

      const created = await create.mutateAsync({ customerId, ...prescriber, medicines: cleaned, diagnosis, notes });
      if (await uploadPhotos(created.id)) onOpenChange(false);
      else setSavedId(created.id);
    } catch {
      // The mutation hooks already showed the error.
    }
  }

  const photoCount = existingPhotos.length + photos.length;

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Amend prescription' : 'New prescription'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `The ${t.person.one.toLowerCase()} and ${t.practitioner.toLowerCase()} cannot be changed after writing — cancel it and write a new one instead.`
              : `Type the medicines, attach a photo of the written prescription, or both.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isEdit && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.person.one}</Label>
                <GuestCombobox selected={guest} onSelectGuest={setGuest} disabled={locked} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={prescriberMode === 'outside' ? 'rx-outside' : undefined}>{t.practitioner}</Label>
                  <div className="inline-flex rounded-md border p-0.5 text-xs" role="radiogroup" aria-label={`Who wrote it`}>
                    {(['staff', 'outside'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={prescriberMode === mode}
                        disabled={locked}
                        onClick={() => setPrescriberMode(mode)}
                        className={cn(
                          'rounded px-2 py-0.5 font-medium transition-colors',
                          prescriberMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {mode === 'staff' ? 'Our staff' : 'Outside'}
                      </button>
                    ))}
                  </div>
                </div>
                {prescriberMode === 'staff' ? (
                  <StaffSelect
                    value={staffId}
                    onChange={setStaffId}
                    disabled={locked}
                    placeholder={`Select ${t.practitioner.toLowerCase()}`}
                    noun={t.practitioner.toLowerCase()}
                  />
                ) : (
                  <Input
                    id="rx-outside"
                    value={outsideName}
                    onChange={(e) => setOutsideName(e.target.value)}
                    placeholder="e.g. Dr Mehta, City Clinic"
                    maxLength={120}
                    disabled={locked}
                  />
                )}
              </div>
            </div>
          )}

          {/* The paper itself */}
          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Label>Photo of the written prescription</Label>
                <p className="text-xs text-muted-foreground">
                  Optional. Every page, in order — up to {MAX_PHOTOS}. Photos stay private to your {t.org.toLowerCase()}.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending || photoCount >= MAX_PHOTOS}
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" /> Add photo
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept={DOCUMENT_ACCEPT}
                multiple
                className="sr-only"
                onChange={handlePhotos}
                aria-label="Add photos of the prescription"
              />
            </div>

            {existing && existingPhotos.length > 0 && (
              <PrescriptionPhotos prescriptionId={existing.id} attachments={existingPhotos} size="sm" />
            )}

            {photos.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {photos.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="relative h-16 w-14 overflow-hidden rounded-lg border bg-muted">
                    {previews[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previews[i]!} alt={f.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 p-1 text-[10px] text-muted-foreground">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        <span className="w-full truncate text-center">{f.name}</span>
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setPhotos((prev) => prev.filter((_, x) => x !== i))}
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-center text-[9px] font-medium text-primary-foreground">
                      New
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {photoError && <p className="text-xs text-destructive">{photoError}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="What is being treated"
              disabled={locked}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label>Medicines</Label>
                {photoCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Can be typed later from the photo — it cannot be handed over until they are.
                  </p>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={locked}
                onClick={() => setMedicines((m) => [...m, emptyMedicine()])}
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
                  disabled={locked}
                  aria-label={`Medicine ${i + 1} name`}
                />
                <Input
                  value={m.dosage ?? ''}
                  onChange={(e) => setMedicine(i, { dosage: e.target.value })}
                  placeholder="500 mg"
                  disabled={locked}
                  aria-label={`Medicine ${i + 1} dosage`}
                />
                <Input
                  value={m.frequency ?? ''}
                  onChange={(e) => setMedicine(i, { frequency: e.target.value })}
                  placeholder="Twice daily"
                  disabled={locked}
                  aria-label={`Medicine ${i + 1} frequency`}
                />
                <Input
                  value={m.duration ?? ''}
                  onChange={(e) => setMedicine(i, { duration: e.target.value })}
                  placeholder="7 days"
                  disabled={locked}
                  aria-label={`Medicine ${i + 1} duration`}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={locked || medicines.length === 1}
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
              disabled={locked}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button onClick={handleSubmit} loading={pending}>
            {addPhotos.isPending ? 'Uploading photos…' : savedId ? 'Retry photo upload' : isEdit ? 'Save changes' : 'Write prescription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
