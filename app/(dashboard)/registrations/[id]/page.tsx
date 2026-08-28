'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Pencil, Trash2, Check, CreditCard, Mail, Phone, Calendar, Tag, FileText, CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RecordPaymentDialog } from '@/components/dialogs/RecordPaymentDialog';
import { RegistrationEditDialog } from '@/components/dialogs/RegistrationEditDialog';
import {
  useRegistrations, useConfirmRegistration, useDeleteRegistration,
} from '@/hooks/useRegistrations';
import { formatDate, formatCurrency, getFriendlyErrorMessage } from '@/lib/utils';

/** There is no GET /registrations/{id} on the backend — only PUT/DELETE at that path.
 * This page fetches the full (unfiltered) list, same as the Registrations list page, and
 * finds the matching record client-side. Same approach the Resellers/Companies "view" panels
 * use, just as a full route here since the task specifically asked for /registrations/{id}. */
export default function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: regs, isLoading, isError, error, refetch } = useRegistrations();
  const registration = useMemo(() => (regs ?? []).find((r) => r.id === id), [regs, id]);

  const confirmReg = useConfirmRegistration();
  const deleteReg = useDeleteRegistration();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  function handleDelete() {
    deleteReg.mutate(id, {
      onSuccess: () => {
        toast.success('Registration deleted');
        router.push('/registrations');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !registration) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/registrations')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All registrations
        </Button>
        <ErrorState
          title="Unable to load this registration"
          message={isError ? getFriendlyErrorMessage(error) : 'This registration could not be found.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/registrations')} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All registrations
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{registration.guestName}</h1>
                <StatusBadge status={registration.status} />
                <Badge variant={registration.paymentStatus === 'paid' ? 'default' : 'secondary'} className="capitalize">
                  {registration.paymentStatus}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{registration.event}</p>
              <p className="mt-1 text-xs font-mono text-muted-foreground">{registration.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              {registration.status !== 'confirmed' && (
                <Button size="sm" variant="outline" onClick={() => confirmReg.mutate(registration.id)} disabled={confirmReg.isPending}>
                  <Check className="mr-2 h-4 w-4" /> Confirm
                </Button>
              )}
              {registration.paymentStatus !== 'paid' && (
                <Button size="sm" variant="outline" onClick={() => setPaymentOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                </Button>
              )}
              <Button
                size="icon" variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete registration"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Guest Information</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={registration.guestEmail} />
            <InfoRow icon={Phone} label="Phone" value={registration.phone} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Booking Details</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <InfoRow icon={Calendar} label="Event" value={registration.event} />
            <InfoRow icon={Tag} label="Category" value={registration.category} />
            <InfoRow icon={CreditCard} label="Amount" value={registration.amount != null ? formatCurrency(registration.amount) : undefined} />
            <InfoRow icon={CalendarClock} label="Registered" value={formatDate(registration.createdAt || registration.registrationDate)} />
          </CardContent>
        </Card>
        {registration.notes && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <InfoRow icon={FileText} label="Notes" value={registration.notes} />
            </CardContent>
          </Card>
        )}
      </div>

      <RegistrationEditDialog open={editOpen} onOpenChange={setEditOpen} registration={registration} />
      <RecordPaymentDialog open={paymentOpen} onOpenChange={setPaymentOpen} registration={registration} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Registration?"
        description={`Are you sure you want to delete ${registration.guestName || 'this registration'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteReg.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function InfoRow({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
