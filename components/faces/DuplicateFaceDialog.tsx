'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaceMatchCard, personHref } from '@/components/faces/FaceMatchCard';
import { useTerminology } from '@/hooks';
import type { DuplicateFaceConflict } from '@/lib/utils';

interface DuplicateFaceDialogProps {
  conflict: DuplicateFaceConflict | null;
  onOpenChange: (open: boolean) => void;
  /** Called before navigating to the existing record, so the caller can close its own dialogs. */
  onOpenRecord?: () => void;
  /** Offered only when the conflict says the caller may override (company admin and above). */
  onOverride?: () => void;
  overrideLabel?: string;
  isOverriding?: boolean;
}

/**
 * "This face is already registered." One person should be one record, so the desk is sent to
 * the existing record — where a new email or phone is simply an edit — instead of creating a
 * second one that would split their history and confuse check-in.
 */
export function DuplicateFaceDialog({
  conflict, onOpenChange, onOpenRecord, onOverride, overrideLabel = 'Enroll anyway', isOverriding,
}: DuplicateFaceDialogProps) {
  const router = useRouter();
  const t = useTerminology();
  const person = t.person.one.toLowerCase();

  function openRecord(href: string) {
    onOpenRecord?.();
    onOpenChange(false);
    router.push(href);
  }

  const canOverride = !!conflict?.canOverride && !!onOverride;

  return (
    <Dialog open={!!conflict} onOpenChange={(v) => !isOverriding && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
            Already registered
          </DialogTitle>
          <DialogDescription>
            This face already belongs to a {person} here. Open their record and update the email or
            phone there — registering them again would split their history in two.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {(conflict?.matches ?? []).map((m) => (
            <FaceMatchCard key={m.id} match={m} onOpen={() => openRecord(personHref(m))} />
          ))}
        </div>

        {canOverride && (
          <Alert>
            <AlertDescription className="text-xs">
              As an admin you can continue anyway — only for twins or a wrong match. Both records
              will then share this face.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isOverriding}>
            Cancel
          </Button>
          {canOverride && (
            <Button variant="destructive" onClick={onOverride} loading={isOverriding}>
              {overrideLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
