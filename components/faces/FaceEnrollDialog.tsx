'use client';

import { useEffect, useState } from 'react';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { DuplicateFaceDialog } from '@/components/faces/DuplicateFaceDialog';
import { FaceConsentNotice, type ConsentGivenBy } from '@/components/faces/FaceConsentNotice';
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
  const [givenBy, setGivenBy] = useState<ConsentGivenBy>('self');
  // Asked afresh for every enrolment.
  useEffect(() => { if (open) { setConsent(false); setGivenBy('self'); } }, [open]);
  const isPending = enrollGuest.isPending || enrollCustomer.isPending;

  function reset() {
    setConflict(null);
    setPendingImage(null);
  }

  function enroll(image: string, options: FaceEnrollOptions = {}) {
    if (!personId || !consent) return;
    options = { ...options, consent: true, consentGivenBy: givenBy };
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
        <FaceConsentNotice
          idPrefix="enroll"
          personName={personName}
          givenBy={givenBy}
          onGivenByChange={setGivenBy}
          consent={consent}
          onConsentChange={setConsent}
        />
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
