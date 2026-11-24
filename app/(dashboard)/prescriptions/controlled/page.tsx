'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useControlledLog } from '@/hooks/usePrescriptions';
import { usePermissions } from '@/hooks';
import { formatDate, getFriendlyErrorMessage } from '@/lib/utils';

const ID_LABELS: Record<string, string> = {
  drivers_license: "Driver's license",
  state_id: 'State ID',
  passport: 'Passport',
  military_id: 'Military ID',
  known_patient: 'Known to staff',
  other: 'Other ID',
};

/**
 * The controlled-substance register: every hand-over of a controlled medicine, who signed it off
 * with two-factor authentication, and which ID the collector showed. Kept even when the patient's
 * record is deleted — it is a legal record. Administrators only (the backend enforces it).
 */
export default function ControlledRegisterPage() {
  const { isAdmin } = usePermissions();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useControlledLog({ enabled: isAdmin });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Not asChild: this Button renders its own spinner beside the children, so it cannot slot onto a Link. */}
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => router.push('/prescriptions')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Prescriptions
      </Button>
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" /> Controlled register
        </h1>
        <p className="text-muted-foreground">
          Every controlled medicine handed over, with the staff member&rsquo;s two-factor sign-off and the collector&rsquo;s ID.
        </p>
      </div>

      {!isAdmin ? (
        <p className="text-sm text-muted-foreground">Only administrators can see the controlled register.</p>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : isError ? (
        <ErrorState title="Could not load the register" message={getFriendlyErrorMessage(error, '')} onRetry={() => refetch()} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{data?.length ?? 0} hand-over{data?.length === 1 ? '' : 's'}</CardTitle>
            <CardDescription>Newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.length ? (
              <p className="text-sm text-muted-foreground">No controlled medicines have been handed over yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr className="border-b">
                      <th className="py-2 pr-4 font-medium">When</th>
                      <th className="py-2 pr-4 font-medium">Patient</th>
                      <th className="py-2 pr-4 font-medium">Medicines</th>
                      <th className="py-2 pr-4 font-medium">Collected by</th>
                      <th className="py-2 pr-4 font-medium">Signed off by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => (
                      <tr key={row.id} className="border-b align-top last:border-0">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDate(row.dispensed_at, 'MMM dd, yyyy HH:mm')}</td>
                        <td className="py-2 pr-4">
                          <Link href={`/prescriptions/${row.prescriptionId}`} className="font-medium hover:underline">
                            {row.patientName || 'Patient record deleted'}
                          </Link>
                          {row.prescriberName && <p className="text-xs text-muted-foreground">Rx: {row.prescriberName}</p>}
                        </td>
                        <td className="py-2 pr-4">
                          {row.medicines.map((m, i) => (
                            <p key={i}>{m.name}{m.schedule ? <span className="text-muted-foreground"> · C-{m.schedule}</span> : null}</p>
                          ))}
                        </td>
                        <td className="py-2 pr-4">
                          {row.idCheck?.collectorName}
                          <p className="text-xs text-muted-foreground">
                            {ID_LABELS[row.idCheck?.idType] ?? row.idCheck?.idType}
                            {row.idCheck?.idLast4 ? ` ····${row.idCheck.idLast4}` : ''}
                            {row.idCheck?.collectorRelationship && row.idCheck.collectorRelationship !== 'self'
                              ? ` · ${row.idCheck.collectorRelationship.replace('_', ' / ')}` : ''}
                          </p>
                        </td>
                        <td className="py-2 pr-4">
                          {row.dispensedBy}
                          <p className="text-xs text-muted-foreground">{row.twoFactorVerified ? 'Password + authenticator code' : '—'}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
