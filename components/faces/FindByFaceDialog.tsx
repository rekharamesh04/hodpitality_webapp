'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { SearchX, Users } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { FaceMatchCard, personHref } from '@/components/faces/FaceMatchCard';
import { checkInService } from '@/services/checkin.service';
import type { FaceLookupResult } from '@/services/checkin.service';
import { popup } from '@/lib/popup';
import { getFriendlyErrorMessage } from '@/lib/utils';
import { useTerminology } from '@/hooks';

interface FindByFaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where "Register new" goes when nobody matches. */
  registerHref?: string;
}

/**
 * Find a person's record from their face — nothing is written and no visit is logged.
 *
 * The desk's way back to a returning visitor whose details have changed (a new email, a lost
 * phone): find the record by face, then edit it, instead of registering the person again.
 */
export function FindByFaceDialog({ open, onOpenChange, registerHref = '/guests?action=add' }: FindByFaceDialogProps) {
  const router = useRouter();
  const t = useTerminology();
  const [result, setResult] = useState<FaceLookupResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = useMutation({
    mutationFn: (image: string) => checkInService.findByFace(image),
    onSuccess: (data) => {
      onOpenChange(false);
      if (data.matches.length === 0) setNotFound(true);
      else setResult(data);
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      if (status === 404) {
        onOpenChange(false);
        setNotFound(true);
        return;
      }
      if (status === 400) {
        popup.error('No face was found in that photo. Please retake it facing the camera.');
        return;
      }
      popup.error(err?.backendMessage ?? getFriendlyErrorMessage(err, 'Face search failed. Please try again.'));
    },
  });

  function closeResults() {
    setResult(null);
    setNotFound(false);
  }

  function go(href: string) {
    closeResults();
    router.push(href);
  }

  const matches = result?.matches ?? [];

  return (
    <>
      <CameraCaptureDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Find by face"
        description={`Take a photo of the ${t.person.one.toLowerCase()} to open their record. This does not check them in.`}
        submitLabel="Search"
        isSubmitting={lookup.isPending}
        onSubmit={(image) => lookup.mutate(image)}
      />

      <Dialog open={!!result || notFound} onOpenChange={(v) => !v && closeResults()}>
        <DialogContent className="sm:max-w-md">
          {notFound ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <SearchX className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  No match found
                </DialogTitle>
                <DialogDescription>
                  Nobody registered here has this face enrolled. Search by name or phone instead,
                  or register them as a new {t.person.one.toLowerCase()}.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeResults}>Close</Button>
                <Button onClick={() => go(registerHref)}>Register new {t.person.one.toLowerCase()}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                  {matches.length === 1 ? 'Record found' : `${matches.length} records found`}
                </DialogTitle>
                <DialogDescription>
                  Open the record to see their history or update their email and phone.
                </DialogDescription>
              </DialogHeader>
              {matches.length > 1 && (
                <Alert>
                  <AlertDescription className="text-xs">
                    This person seems to be registered more than once. Ask an admin to keep one record
                    and remove the extra.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                {matches.map((m) => (
                  <FaceMatchCard key={m.id} match={m} onOpen={() => go(personHref(m))} />
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
