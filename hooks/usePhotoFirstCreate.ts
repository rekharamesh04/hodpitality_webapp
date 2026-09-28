import { useState } from 'react';
import { popup } from '@/lib/popup';
import { checkInService } from '@/services/checkin.service';
import { useEnrollFace } from '@/hooks/use-guests';
import { useEnrollCustomerFace } from '@/hooks/useCustomers';
import { useAuthStore } from '@/store';
import { isOrgAdmin } from '@/constants/roles';
import { getDuplicateFaceConflict } from '@/lib/utils';
import type { DuplicateFaceConflict } from '@/lib/utils';
import type { PersonEntity } from '@/services/document.service';

/** Runs the caller's create and reports the new record's id — or never calls back if it failed. */
type CreateFn<P> = (payload: P, onCreated: (id: string) => void) => void;

/**
 * Register someone together with their face photo.
 *
 * The face is looked up BEFORE the record is created: if it already belongs to someone here,
 * the desk is shown that record (to update its email or phone) instead of creating a second
 * person. Only when nobody matches is the record created and the face enrolled. A company admin
 * may create anyway — twins, or a wrong match.
 */
export function usePhotoFirstCreate<P>(entity: PersonEntity, create: CreateFn<P>) {
  const role = useAuthStore((s) => s.user?.role);
  const enrollGuest = useEnrollFace();
  const enrollCustomer = useEnrollCustomerFace();
  const [checking, setChecking] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ conflict: DuplicateFaceConflict; payload: P; photo: string } | null>(null);

  function enroll(id: string, photo: string, allowDuplicate: boolean) {
    const options = { consent: true, allowDuplicate };
    const onError = (err: unknown) => {
      // Someone enrolled this face between the lookup and now. The record exists; say so plainly.
      const conflict = getDuplicateFaceConflict(err);
      if (conflict) popup.warning(`${conflict.message} The new record was saved without a photo.`);
    };
    if (entity === 'customer') enrollCustomer.mutate({ customerId: id, image: photo, options }, { onError });
    else enrollGuest.mutate({ guestId: id, image: photo, options }, { onError });
  }

  async function submit(payload: P, photo: string | null) {
    setPhotoError(null);
    if (!photo) {
      create(payload, () => {});
      return;
    }
    setChecking(true);
    try {
      const found = await checkInService.findByFace(photo);
      if (found.matches.length > 0) {
        setPending({
          payload,
          photo,
          conflict: {
            message: `This face is already registered to ${found.matches[0].name || 'someone'}.`,
            duplicateOf: found.matches[0],
            matches: found.matches,
            canOverride: isOrgAdmin(role),
          },
        });
        return;
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) {
        setPhotoError('No face was found in that photo. Retake it, or remove it to save without a photo.');
        return;
      }
      // 404 means nobody has this face — the normal case. Any other failure only means the check
      // could not run; the backend checks again on enrolment, so registration goes ahead.
    } finally {
      setChecking(false);
    }
    create(payload, (id) => enroll(id, photo, false));
  }

  function createAnyway() {
    if (!pending) return;
    const { payload, photo } = pending;
    setPending(null);
    create(payload, (id) => enroll(id, photo, true));
  }

  return {
    submit,
    checking,
    photoError,
    conflict: pending?.conflict ?? null,
    clearConflict: () => setPending(null),
    createAnyway,
  };
}
