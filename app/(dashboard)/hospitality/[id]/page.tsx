'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Trash2, Hotel, MapPin, Building2, DollarSign, Calendar, FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useHospitalityBooking, useUpdateBookingStatus, useDeleteBooking } from '@/hooks/useHospitality';
import { formatDate, formatCurrency, getFriendlyErrorMessage } from '@/lib/utils';
import type { Status } from '@/types';

const STATUSES: Status[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function HospitalityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: booking, isLoading, isError, error, refetch } = useHospitalityBooking(id);
  const updateStatusMutation = useUpdateBookingStatus();
  const deleteMutation = useDeleteBooking();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Hospitality request deleted');
        router.push('/hospitality');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/hospitality')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All requests
        </Button>
        <ErrorState
          title="Unable to load this request"
          message={isError ? getFriendlyErrorMessage(error) : 'This hospitality request could not be found.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/hospitality')} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All requests
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{booking.guestName}</h1>
                <Badge variant="outline">{booking.type}</Badge>
                <StatusBadge status={booking.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{booking.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={booking.status}
                onValueChange={(v) => updateStatusMutation.mutate({ id: booking.id, status: v as Status })}
              >
                <SelectTrigger className="w-[150px]" aria-label="Update status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                size="icon" variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete request"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Service Information</CardTitle></CardHeader>
          <CardContent className="grid gap-5">
            <InfoRow icon={Hotel} label="Type" value={booking.type} />
            <InfoRow icon={Calendar} label="Scheduled Date" value={formatDate(booking.scheduledAt || booking.serviceDate)} />
            <InfoRow icon={DollarSign} label="Cost" value={booking.cost != null ? formatCurrency(booking.cost) : undefined} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Venue &amp; Vendor</CardTitle></CardHeader>
          <CardContent className="grid gap-5">
            <InfoRow icon={MapPin} label="Venue" value={booking.venue} />
            <InfoRow icon={Building2} label="Vendor" value={booking.vendor} />
          </CardContent>
        </Card>
        {(booking.notes || booking.details) && (
          <Card className="sm:col-span-2">
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <InfoRow icon={FileText} label="Notes" value={booking.notes || booking.details} />
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Hospitality Request?"
        description={`Are you sure you want to delete this request for ${booking.guestName || 'this guest'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
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
