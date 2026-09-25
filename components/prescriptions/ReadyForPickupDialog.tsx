'use client';

import { useRouter } from 'next/navigation';
import { PackageCheck, Pill, ShieldCheck, Stethoscope } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useTerminology } from '@/hooks';
import { usePickupHandoffStore } from '@/store/pickup-handoff-store';
import { getFriendlyErrorMessage, getRelativeTime } from '@/lib/utils';
import {
  isReadyForPickup, medicineLabel, medicinesOf, prescriberNameOf, prescriptionsFor, writtenAt,
} from '@/types/prescription';

export interface FaceMatch {
  guestId: string;
  guestName?: string;
  matchConfidence?: number;
  matchThreshold?: number;
}

/**
 * What a pharmacy needs the moment a face is matched at check-in: that the
 * person is who they say they are, and what is waiting for them.
 *
 * "Release at collection counter" hands the face match to the counter, so the
 * patient is not asked to scan a second time a minute later.
 */
export function ReadyForPickupDialog({
  match,
  onOpenChange,
}: {
  match: FaceMatch | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTerminology();
  const router = useRouter();
  const give = usePickupHandoffStore((s) => s.give);
  const { data, isLoading, isError, error, refetch } = usePrescriptions({}, { enabled: !!match });

  if (!match) return null;

  const name = match.guestName || `this ${t.person.one.toLowerCase()}`;
  const ready = prescriptionsFor(data ?? [], match.guestId).filter(isReadyForPickup);
  const confidence = typeof match.matchConfidence === 'number' ? `${match.matchConfidence.toFixed(1)}%` : null;
  const threshold = typeof match.matchThreshold === 'number' ? `${match.matchThreshold}%` : null;

  function releaseAtCounter() {
    if (!match) return;
    give(match.guestId, `Face matched at check-in${confidence ? ` (${confidence})` : ''}`);
    onOpenChange(false);
    router.push(`/pickup?patient=${encodeURIComponent(match.guestId)}`);
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 sm:mx-0">
            <ShieldCheck className="h-6 w-6 text-green-700 dark:text-green-400" aria-hidden="true" />
          </div>
          <DialogTitle className="pt-2">Identity verified</DialogTitle>
          <DialogDescription>
            {name} matched by face scan
            {confidence && <> — {confidence}{threshold && ` (needs ${threshold})`}</>}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm font-semibold">
            {isLoading ? 'Ready for pickup' : `Ready for pickup (${ready.length})`}
          </p>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Unable to load prescriptions"
              message={getFriendlyErrorMessage(error)}
              onRetry={() => refetch()}
            />
          ) : ready.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Pill className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="mt-1.5 text-sm text-muted-foreground">No prescriptions waiting for {name}.</p>
            </div>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {ready.map((p) => {
                const meds = medicinesOf(p);
                const when = writtenAt(p);
                return (
                  <li key={p.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{meds.length ? medicineLabel(meds[0]) : 'Prescription'}</p>
                    {meds.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        + {meds.slice(1).map(medicineLabel).join(', ')}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3" aria-hidden="true" />
                      {prescriberNameOf(p)}
                      {when && <> · written {getRelativeTime(when)}</>}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {ready.length > 0 && (
            <Button onClick={releaseAtCounter}>
              <PackageCheck className="mr-2 h-4 w-4" /> Release at collection counter
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
