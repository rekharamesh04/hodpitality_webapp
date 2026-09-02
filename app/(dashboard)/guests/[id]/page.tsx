'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Pencil, Trash2, Camera, Mail, Phone, Building2,
  BadgeCheck, StickyNote, CalendarClock, UserRoundCheck, UserCheck, Clock, CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { GuestFormDialog } from '@/components/dialogs/GuestFormDialog';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';

import {
  useGuest, useUpdateGuest, useDeleteGuest, useEnrollFace,
} from '@/hooks/use-guests';
import { useCheckIn } from '@/hooks/useCheckins';
import { useAppointments } from '@/hooks/useAppointments';
import { getLocalAvatar } from '@/lib/local-avatars';
import { cn, formatDate, formatCheckInTimestamp, getInitials, getFriendlyErrorMessage } from '@/lib/utils';
import { GUEST_CATEGORY_BADGE_CLASSES } from '@/constants';
import type { UpdateGuestPayload } from '@/services/guest.service';

function getGuestId(id: string, pk?: string): string {
  return id || (pk ? pk.replace('GUEST#', '') : '');
}

export default function GuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: guest, isLoading, isError, error, refetch } = useGuest(id);
  const updateMutation = useUpdateGuest();
  const deleteMutation = useDeleteGuest();
  const enrollFace = useEnrollFace();
  const checkIn = useCheckIn();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [faceOpen, setFaceOpen] = useState(false);

  // No dedicated "appointments by guest" endpoint exists — filter the full list client-side, same
  // pattern used elsewhere in the app (see the legacy customer profile view this replaced).
  const { data: appointmentsData } = useAppointments({}, { enabled: !!guest });
  const relatedAppointments = (appointmentsData ?? []).filter(
    (a) => a.guestId === id || a.customerId === id
  );

  function handleUpdate(payload: UpdateGuestPayload) {
    updateMutation.mutate({ id, data: payload }, { onSuccess: () => setEditOpen(false) });
  }

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Guest deleted');
        router.push('/guests');
      },
    });
  }

  function handleFaceSubmit(image: string) {
    enrollFace.mutate({ guestId: id, image }, { onSuccess: () => setFaceOpen(false) });
  }

  function handleCheckIn() {
    checkIn.mutate({ guestId: id }, { onSuccess: () => refetch() });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !guest) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/guests')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All guests
        </Button>
        <ErrorState
          title="Unable to load this guest"
          message={getFriendlyErrorMessage(error, 'This guest could not be found.')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const resolvedId = getGuestId(guest.id, guest.PK);
  const localPhoto = getLocalAvatar(resolvedId);
  const photoSrc = guest.avatar ?? localPhoto;
  const hasFacePhoto = !!photoSrc;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/guests')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All guests
        </Button>

        {/* Hero */}
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-24" />
          <CardContent className="relative px-4 pb-6 pt-0 sm:px-6">
            <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
                <Avatar className="h-20 w-20 border-4 border-card shadow-[var(--shadow-medium)] sm:h-24 sm:w-24">
                  <AvatarImage src={photoSrc} alt={guest.name} />
                  <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                    {guest.name ? getInitials(guest.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="sm:pb-1">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-bold tracking-tight">{guest.name || 'Unnamed guest'}</h1>
                    {guest.category && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          GUEST_CATEGORY_BADGE_CLASSES[guest.category] ?? 'bg-gray-100 text-gray-700 border-gray-300'
                        )}
                      >
                        {guest.category}
                      </span>
                    )}
                    <StatusBadge status={guest.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{guest.email || 'No email on file'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-2 sm:pb-1">
                {!guest.checkedIn && (
                  <Button size="sm" variant="secondary" onClick={handleCheckIn} loading={checkIn.isPending}>
                    {!checkIn.isPending && <UserCheck className="mr-2 h-4 w-4" />}
                    Check In
                  </Button>
                )}
                <Button size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" aria-label={hasFacePhoto ? 'Retake face photo' : 'Enroll face'} onClick={() => setFaceOpen(true)}>
                      <Camera className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{hasFacePhoto ? 'Retake face photo' : 'Enroll face'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Delete guest" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete guest</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Stat strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip
                icon={guest.checkedIn ? UserRoundCheck : UserCheck}
                label="Check-in"
                value={guest.checkedIn ? formatCheckInTimestamp(guest.checkInTime) : 'Not checked in'}
              />
              <StatChip icon={CalendarDays} label="Registered" value={guest.registrationDate ? formatDate(guest.registrationDate) : '—'} />
              <StatChip icon={CalendarClock} label="Upcoming Appointments" value={String(relatedAppointments.length)} />
              <StatChip icon={Clock} label="Guest Since" value={guest.createdAt ? formatDate(guest.createdAt) : '—'} />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email" value={guest.email} />
              <InfoRow icon={Phone} label="Phone" value={guest.phone} />
              <InfoRow icon={Building2} label="Company" value={guest.company} />
              <InfoRow icon={BadgeCheck} label="Designation" value={guest.designation} />
              {guest.notes && (
                <div className="sm:col-span-2">
                  <InfoRow icon={StickyNote} label="Notes" value={guest.notes} />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Face &amp; Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', hasFacePhoto ? 'bg-success/10' : 'bg-muted')}>
                    <UserRoundCheck className={cn('h-4 w-4', hasFacePhoto ? 'text-success' : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{hasFacePhoto ? 'Face enrolled' : 'Not enrolled'}</p>
                    <p className="text-xs text-muted-foreground">Facial recognition check-in</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 shrink-0 px-2 text-xs" onClick={() => setFaceOpen(true)}>
                    {hasFacePhoto ? 'Retake' : 'Enroll'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Appointments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No appointments linked to this guest.</p>
                ) : (
                  <>
                    {relatedAppointments.slice(0, 4).map((a) => (
                      <div key={a.id} className="rounded-lg border p-2.5 text-sm">
                        <p className="font-medium truncate">{a.service ?? a.title ?? 'Appointment'}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.date ? formatDate(a.date) : '—'}{a.startTime ? ` · ${a.startTime}` : ''}
                        </p>
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" className="w-full" onClick={() => router.push('/calendar')}>
                      View in Calendar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit dialog */}
        <GuestFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          guest={guest}
          isSubmitting={updateMutation.isPending}
          submitError={updateMutation.error ? getFriendlyErrorMessage(updateMutation.error, 'Unable to save guest.') : null}
          onSubmit={handleUpdate}
        />

        {/* Delete confirmation */}
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Guest?"
          description={`Are you sure you want to delete ${guest.name || 'this guest'}? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmingLabel="Deleting…"
          destructive
          isConfirming={deleteMutation.isPending}
          onConfirm={handleDelete}
        />

        {/* Face enrollment */}
        <CameraCaptureDialog
          open={faceOpen}
          onOpenChange={setFaceOpen}
          title="Enroll Face"
          description="Capture a clear front-facing photo to enroll this guest."
          submitLabel="Enroll"
          isSubmitting={enrollFace.isPending}
          onSubmit={handleFaceSubmit}
        />

      </div>
    </TooltipProvider>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  const Icon = icon;
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
