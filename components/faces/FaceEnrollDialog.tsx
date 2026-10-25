'use client';

import { useEffect, useState } from 'react';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { DuplicateFaceDialog } from '@/components/faces/DuplicateFaceDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useEnrollFace } from '@/hooks/use-guests';
import { useEnrollCustomerFace } from '@/hooks/useCustomers';
import { getDuplicateFaceConflict } from '@/lib/utils';
import type { DuplicateFaceConflict } from '@/lib/utils';
import type { FaceEnrollOptions } from '@/services/guest.service';
import type { PersonEntity } from '@/services/document.service';

interface FaceEnrollDialogProps {
  entity: PersonEntity;
  /** Empty closes nothing but disables the submit — the dialog needs someone to enrol. */
  personId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Shown on the phone when the photo is taken with smart glasses: "Look at <name>'s face". */
  personName?: string;
}

/**
 * Capture and enrol a person's face. If the face already belongs to someone else here, shows
 * that record instead (and, for a company admin, an "enrol anyway" for twins or a false match).
 *
 * Nothing is enrolled until staff confirm the person agreed: biometric laws (Texas CUBI, Illinois
 * BIPA, India's DPDP) need consent first, and the backend stores the tick as explicit consent.
 */
export function FaceEnrollDialog({ entity, personId, open, onOpenChange, title, description, personName }: FaceEnrollDialogProps) {
  const enrollGuest = useEnrollFace();
  const enrollCustomer = useEnrollCustomerFace();
  const [conflict, setConflict] = useState<DuplicateFaceConflict | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  // Asked afresh for every enrolment.
  useEffect(() => { if (open) setConsent(false); }, [open]);
  const isPending = enrollGuest.isPending || enrollCustomer.isPending;

  function reset() {
    setConflict(null);
    setPendingImage(null);
  }

  function enroll(image: string, options: FaceEnrollOptions = {}) {
    if (!personId || !consent) return;
    options = { ...options, consent: true };
    const callbacks = {
      onSuccess: (result: { success?: boolean } | undefined) => {
        if (result?.success === false) return;
        reset();
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const found = getDuplicateFaceConflict(err);
        if (found) {
          setPendingImage(image);
          setConflict(found);
        }
      },
    };
    if (entity === 'customer') {
      enrollCustomer.mutate({ customerId: personId, image, options }, callbacks);
    } else {
      enrollGuest.mutate({ guestId: personId, image, options }, callbacks);
    }
  }

  return (
    <>
      <CameraCaptureDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description={description}
        submitLabel="Enroll"
        isSubmitting={isPending}
        submitDisabled={!consent}
        onSubmit={(image) => enroll(image)}
        glasses={{ purpose: 'enroll', subjectLabel: personName }}
      >
        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
          <Checkbox id="enroll-consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
          <Label htmlFor="enroll-consent" className="text-xs font-normal leading-snug">
            {personName ? `${personName} agreed` : 'They agreed'} to their face being used for check-in. If they said no,
            close this — they can check in with their phone number instead.
          </Label>
        </div>
      </CameraCaptureDialog>
      <DuplicateFaceDialog
        conflict={conflict}
        onOpenChange={(v) => !v && reset()}
        onOpenRecord={() => onOpenChange(false)}
        onOverride={pendingImage ? () => enroll(pendingImage, { allowDuplicate: true }) : undefined}
        isOverriding={isPending}
      />
    </>
  );
}
