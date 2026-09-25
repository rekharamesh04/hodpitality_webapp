'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, PackageCheck, Pill, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { PrescriptionFormDialog } from '@/components/dialogs/PrescriptionFormDialog';
import { PrescriptionStatusBadge } from '@/components/prescriptions/PrescriptionStatusBadge';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useTerminology } from '@/hooks';
import { getFriendlyErrorMessage, getRelativeTime } from '@/lib/utils';
import {
  isReadyForPickup, medicineLabel, medicinesOf, prescriberNameOf, prescriptionsFor, writtenAt,
} from '@/types/prescription';
import type { Guest } from '@/types';

const SHOWN = 5;

/** A patient's prescriptions on their profile, with the two things done next: write one, or hand them over. */
export function PatientPrescriptionsCard({ guest, guestId }: { guest: Guest; guestId: string }) {
  const t = useTerminology();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = usePrescriptions({});

  const theirs = prescriptionsFor(data ?? [], guestId);
  const readyCount = theirs.filter(isReadyForPickup).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          Prescriptions{!isLoading && !isError && theirs.length > 0 && ` (${theirs.length})`}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          New prescription
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : isError ? (
          <ErrorState title="Unable to load prescriptions" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />
        ) : theirs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No prescriptions for this {t.person.one.toLowerCase()} yet.
          </p>
        ) : (
          <>
            {readyCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/20">
                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                  {readyCount} ready for pickup
                </p>
                <Button size="sm" onClick={() => router.push(`/pickup?patient=${encodeURIComponent(guestId)}`)}>
                  <PackageCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                  Hand over at counter
                </Button>
              </div>
            )}
            <ul className="divide-y rounded-lg border">
              {theirs.slice(0, SHOWN).map((p) => {
                const meds = medicinesOf(p);
                const when = writtenAt(p);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      onClick={() => router.push(`/prescriptions/${p.id}`)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Pill className="h-4 w-4 text-primary" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {meds.length ? medicineLabel(meds[0]) : 'Prescription'}
                          {meds.length > 1 && <span className="font-normal text-muted-foreground"> +{meds.length - 1} more</span>}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {prescriberNameOf(p)}{when ? ` · ${getRelativeTime(when)}` : ''}
                        </p>
                      </div>
                      <PrescriptionStatusBadge status={p.status} />
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            {theirs.length > SHOWN && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => router.push(`/prescriptions?search=${encodeURIComponent(guest.name ?? '')}`)}
              >
                View all {theirs.length} prescriptions
              </Button>
            )}
          </>
        )}
      </CardContent>
      <PrescriptionFormDialog open={createOpen} onOpenChange={setCreateOpen} defaultGuest={guest} />
    </Card>
  );
}
