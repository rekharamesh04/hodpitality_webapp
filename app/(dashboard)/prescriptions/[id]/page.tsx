'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Pill, Pencil, Trash2, Stethoscope, User, CalendarClock, CheckCircle2, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PrescriptionStatusBadge } from '@/components/prescriptions/PrescriptionStatusBadge';
import { PrescriptionFormDialog } from '@/components/dialogs/PrescriptionFormDialog';
import {
  usePrescription, useUpdatePrescription, useDeletePrescription,
} from '@/hooks/usePrescriptions';
import { useTerminology } from '@/hooks';
import { cn, formatDate, getFriendlyErrorMessage, getInitials } from '@/lib/utils';
import { medicineLabel, medicinesOf, patientNameOf, prescriberNameOf } from '@/types/prescription';

/**
 * One prescription.
 *
 * Shows what the record holds and nothing more. A dispensing pharmacy would
 * expect clinical screening, an insurance claim and a fill history here; none
 * of that is on this entity, and inventing a panel for data the API cannot
 * return would be a screen that quietly disagrees with the database. See
 * docs/PHARMACY_MODULE.md for the fill record that would carry them.
 */
export default function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTerminology();
  const router = useRouter();

  const { data: rx, isLoading, isError, error, refetch } = usePrescription(id);
  const updateMutation = useUpdatePrescription();
  const deleteMutation = useDeletePrescription();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !rx) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/prescriptions')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> All prescriptions
        </Button>
        <ErrorState
          title="Unable to load this prescription"
          message={getFriendlyErrorMessage(error, 'This prescription could not be found.')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const meds = medicinesOf(rx);
  const created = rx.created_at ?? rx.createdAt;
  const isActive = rx.status === 'active';

  function setStatus(status: 'completed' | 'cancelled') {
    updateMutation.mutate({ id, data: { status } });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/prescriptions')} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> All prescriptions
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Pill className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold sm:text-2xl">{patientNameOf(rx)}</h1>
                  <PrescriptionStatusBadge status={rx.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rx.diagnosis || 'No diagnosis recorded'}
                  {created ? ` · written ${formatDate(created, 'MMM dd, yyyy')}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Amend
              </Button>
              {isActive && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus('completed')}
                    loading={updateMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus('cancelled')}
                    disabled={updateMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </>
              )}
              <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Medicines */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Medicines</CardTitle>
            <p className="text-xs text-muted-foreground">
              {meds.length} item{meds.length === 1 ? '' : 's'} on this prescription
            </p>
          </CardHeader>
          <CardContent>
            {meds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medicines were recorded.</p>
            ) : (
              <ol className="space-y-3">
                {meds.map((m, i) => {
                  const detail = typeof m === 'string' ? null : m;
                  return (
                    <li key={i} className="rounded-lg border p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {detail?.name || medicineLabel(m)}
                          </p>
                          {detail && (
                            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                              {detail.dosage ? <Field label="Dosage" value={detail.dosage} /> : null}
                              {detail.frequency ? <Field label="Frequency" value={detail.frequency} /> : null}
                              {detail.duration ? <Field label="Duration" value={detail.duration} /> : null}
                            </dl>
                          )}
                          {detail?.instructions ? (
                            <p className="mt-2 rounded bg-muted px-2.5 py-1.5 text-xs">{detail.instructions}</p>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {rx.notes && (
              <>
                <Separator className="my-5" />
                <p className="mb-1.5 text-sm font-semibold">Notes</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{rx.notes}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Side */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{t.person.one}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(patientNameOf(rx))}
                  </AvatarFallback>
                </Avatar>
                <p className="min-w-0 truncate font-semibold">{patientNameOf(rx)}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/guests/${rx.customerId}`)}
              >
                <User className="mr-2 h-4 w-4" /> Open {t.person.one.toLowerCase()} profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Field label={t.practitioner} value={prescriberNameOf(rx)} icon={Stethoscope} />
                <Field label="Written" value={created ? formatDate(created, 'MMM dd, yyyy HH:mm') : '—'} icon={CalendarClock} />
                <Field label="Status" value={rx.status ? String(rx.status) : '—'} />
                {rx.appointmentId ? <Field label={t.visit.one} value={rx.appointmentId} mono /> : null}
              </dl>
              {rx.appointmentId && (
                <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => router.push('/calendar')}>
                  View {t.visit.one.toLowerCase()}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PrescriptionFormDialog open={editOpen} onOpenChange={setEditOpen} existing={rx} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this prescription?"
        description={`The prescription for ${patientNameOf(rx)} will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={() =>
          deleteMutation.mutate(id, { onSuccess: () => router.push('/prescriptions') })
        }
      />
    </div>
  );
}

function Field({
  label, value, mono, icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: typeof Stethoscope;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 flex items-center gap-1.5 text-sm capitalize', mono && 'font-mono text-xs normal-case')}>
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
        {value}
      </dd>
    </div>
  );
}
