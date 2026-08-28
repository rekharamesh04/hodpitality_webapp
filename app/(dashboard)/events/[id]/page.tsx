'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Pencil, Trash2, MapPin, Users, CalendarClock, CalendarDays,
  UserCheck, ClipboardList, Building2, Info, Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EventFormDialog } from '@/components/dialogs/EventFormDialog';
import {
  useEvent, useEventAttendees, useUpdateEvent, useDeleteEvent, useEvents,
} from '@/hooks/useEvents';
import { usePrintBadge } from '@/hooks/useCheckins';
import { getInitials, formatDate, formatCheckInTimestamp, getFriendlyErrorMessage } from '@/lib/utils';
import type { UpdateEventPayload } from '@/services/event.service';

function methodLabel(ci: { checkInMethod?: string; method?: string }): string {
  const raw = ci.checkInMethod ?? ci.method ?? '';
  const key = raw.toLowerCase();
  if (key.includes('qr')) return 'QR';
  if (key.includes('facial') || key.includes('face')) return 'Facial Recognition';
  if (key.includes('manual')) return 'Manual';
  if (key.includes('self')) return 'Self';
  return raw || 'Unknown';
}

function getEventId(id: string, pk?: string): string {
  return id || (pk ? pk.replace('EVENT#', '') : '');
}
function getCheckInGuestId(ciGuestId?: string): string {
  return ciGuestId ?? '';
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: event, isLoading, isError, error, refetch } = useEvent(id);
  const { data: attendeesData, isLoading: attendeesLoading, isError: attendeesError } = useEventAttendees(id);
  const { data: allEvents } = useEvents();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const printBadge = usePrintBadge();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const statusOptions = Array.from(new Set((allEvents ?? []).map((e) => e.status).filter(Boolean))) as string[];
  const categoryOptions = Array.from(new Set((allEvents ?? []).map((e) => e.category).filter((c): c is string => !!c)));

  function handleUpdate(payload: UpdateEventPayload) {
    updateMutation.mutate({ id, data: payload }, { onSuccess: () => setEditOpen(false) });
  }

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Event deleted');
        router.push('/events');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/events')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All events
        </Button>
        <ErrorState
          title="Unable to load this event"
          message={getFriendlyErrorMessage(error, 'This event could not be found.')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const resolvedId = getEventId(event.id, event.PK);
  const startDate = event.startDate ?? event.date;
  const attendees = event.attendees ?? event.registered;
  const hasAttendance = attendees !== undefined && event.capacity !== undefined;
  const pct = hasAttendance && event.capacity! > 0 ? Math.min(Math.round((attendees! / event.capacity!) * 100), 100) : 0;
  const eventAttendees = attendeesData ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/events')} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All events
      </Button>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-24" />
        <CardContent className="relative px-4 pb-6 pt-0 sm:px-6">
          <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
              <Avatar className="h-20 w-20 border-4 border-card shadow-[var(--shadow-medium)] sm:h-24 sm:w-24">
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                  {event.title ? getInitials(event.title) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="sm:pb-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold tracking-tight">{event.title || 'Untitled event'}</h1>
                  {event.category && (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {event.category}
                    </span>
                  )}
                  <StatusBadge status={event.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {startDate ? formatDate(startDate, 'MMMM dd, yyyy') : 'No date set'}
                  {event.endDate ? ` – ${formatDate(event.endDate, 'MMMM dd, yyyy')}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 sm:pb-1">
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.push('/calendar')}>
                <CalendarDays className="mr-2 h-4 w-4" />
                View on Calendar
              </Button>
              <Button
                size="icon" variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete event"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatChip icon={CalendarClock} label="Starts" value={startDate ? formatDate(startDate, 'MMM dd, yyyy') : '—'} />
            <StatChip icon={MapPin} label="Venue" value={event.venue || '—'} />
            <StatChip
              icon={Users}
              label="Attendance"
              value={hasAttendance ? `${attendees} / ${event.capacity}` : attendees !== undefined ? `${attendees} registered` : '—'}
            />
            <StatChip icon={UserCheck} label="Checked In" value={String(eventAttendees.length)} />
          </div>

          {hasAttendance && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Capacity filled</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {event.description && (
              <InfoRow icon={Info} label="Description" value={event.description} />
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={MapPin} label="Venue" value={event.venue} />
              <InfoRow icon={Building2} label="Organizer" value={event.organizer} />
            </div>
            {!event.description && !event.venue && !event.organizer && (
              <p className="text-sm text-muted-foreground">No additional details on file.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                size="sm" variant="outline" className="w-full justify-start"
                onClick={() => router.push(`/check-ins?event=${encodeURIComponent(event.title ?? '')}`)}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                View Check-ins
              </Button>
              {event.venue && (
                <Button
                  size="sm" variant="outline" className="w-full justify-start"
                  onClick={() => router.push(`/venues?search=${encodeURIComponent(event.venue ?? '')}`)}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  View Venue
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendees (from GET /events/{id}/attendees) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Checked-in Guests</CardTitle>
        </CardHeader>
        <CardContent>
          {attendeesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : attendeesError ? (
            <ErrorState title="Unable to load attendees" message="Please try again." />
          ) : eventAttendees.length === 0 ? (
            <EmptyState icon={UserCheck} title="No check-ins yet" description="Guests who check in to this event will appear here." />
          ) : (
            <div className="space-y-2">
              {eventAttendees.map((ci) => {
                const guestId = getCheckInGuestId(ci.guestId);
                const ciId = ci.id ?? ci.PK ?? Math.random().toString(36);
                return (
                  <div key={ciId} className="flex w-full items-center gap-3 rounded-lg border p-2.5">
                    <button
                      className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                      onClick={() => guestId && router.push(`/guests/${guestId}`)}
                      disabled={!guestId}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {ci.guestName ? getInitials(ci.guestName) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{ci.guestName || ci.guestId || 'Guest'}</p>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span>{formatCheckInTimestamp(ci.timestamp ?? ci.checkInTime)}</span>
                          <span aria-hidden="true">•</span>
                          <span>{methodLabel(ci)}</span>
                        </div>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                        title={ci.badgePrinted ? 'Badge printed' : 'Badge not printed yet'}
                      >
                        <Printer className={`h-3.5 w-3.5 ${ci.badgePrinted ? 'text-success' : 'text-muted-foreground'}`} aria-hidden="true" />
                        {ci.badgePrinted ? 'Printed' : 'Not printed'}
                      </span>
                      <Button
                        size="sm" variant="outline" className="h-7 px-2 text-xs"
                        onClick={() => printBadge.mutate(ci.id ?? '')}
                        disabled={printBadge.isPending || !ci.id}
                      >
                        {ci.badgePrinted ? 'Reprint' : 'Print'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <EventFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        event={event}
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error ? getFriendlyErrorMessage(updateMutation.error, 'Unable to save event.') : null}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        onSubmit={handleUpdate}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Event?"
        description={`Are you sure you want to delete ${event.title || 'this event'}? This action cannot be undone.`}
        confirmLabel="Delete Event"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
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
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
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
