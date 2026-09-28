'use client';

import { useState } from 'react';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { DuplicateFaceDialog } from '@/components/faces/DuplicateFaceDialog';
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
}

/**
 * Capture and enrol a person's face. If the face already belongs to someone else here, shows
 * that record instead (and, for a company admin, an "enrol anyway" for twins or a false match).
 */
export function FaceEnrollDialog({ entity, personId, open, onOpenChange, title, description }: FaceEnrollDialogProps) {
  const enrollGuest = useEnrollFace();
  const enrollCustomer = useEnrollCustomerFace();
  const [conflict, setConflict] = useState<DuplicateFaceConflict | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const isPending = enrollGuest.isPending || enrollCustomer.isPending;

  function reset() {
    setConflict(null);
    setPendingImage(null);
  }

  function enroll(image: string, options?: FaceEnrollOptions) {
    if (!personId) return;
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
        onSubmit={(image) => enroll(image)}
      />
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
