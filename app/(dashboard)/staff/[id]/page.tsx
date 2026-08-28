'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, Building2, BadgeCheck, Clock, CalendarDays, CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StaffFormDialog } from '@/components/dialogs/StaffFormDialog';
import { StaffScheduleDialog } from '@/components/dialogs/StaffScheduleDialog';
import {
  useStaffMember, useUpdateStaff, useDeleteStaff, useUpdateStaffSchedule, useStaff,
} from '@/hooks/useStaff';
import { getInitials, formatDate, getFriendlyErrorMessage } from '@/lib/utils';
import type { UpdateStaffPayload } from '@/services/staff.service';

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getStaffId(id: string, pk?: string): string {
  return id || (pk ? pk.replace('STAFF#', '') : '');
}

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: staff, isLoading, isError, error, refetch } = useStaffMember(id);
  const { data: allStaff } = useStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();
  const scheduleMutation = useUpdateStaffSchedule();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const roleOptions = Array.from(new Set((allStaff ?? []).map((s) => s.role).filter((r): r is string => !!r && typeof r === 'string')));
  const departmentOptions = Array.from(new Set((allStaff ?? []).map((s) => s.department).filter((d): d is string => !!d)));

  function handleUpdate(payload: UpdateStaffPayload) {
    updateMutation.mutate({ id, data: payload }, { onSuccess: () => setEditOpen(false) });
  }

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Staff member deleted');
        router.push('/staff');
      },
    });
  }

  function handleScheduleSubmit(schedule: Record<string, string>) {
    scheduleMutation.mutate({ id, schedule }, { onSuccess: () => setScheduleOpen(false) });
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

  if (isError || !staff) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/staff')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All staff
        </Button>
        <ErrorState
          title="Unable to load this staff member"
          message={getFriendlyErrorMessage(error, 'This staff member could not be found.')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const resolvedId = getStaffId(staff.id, staff.PK);
  const scheduleEntries = staff.schedule && typeof staff.schedule === 'object'
    ? DAY_ORDER
        .map((day) => [day, (staff.schedule as Record<string, unknown>)[day]] as const)
        .filter(([, v]) => typeof v === 'string' && v.trim() !== '')
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/staff')} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All staff
      </Button>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-24" />
        <CardContent className="relative px-4 pb-6 pt-0 sm:px-6">
          <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
              <Avatar className="h-20 w-20 border-4 border-card shadow-[var(--shadow-medium)] sm:h-24 sm:w-24">
                <AvatarImage src={staff.avatar} alt={staff.name} />
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                  {staff.name ? getInitials(staff.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="sm:pb-1">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold tracking-tight">{staff.name || 'Unnamed'}</h1>
                  {typeof staff.role === 'string' && staff.role && (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                      {staff.role}
                    </span>
                  )}
                  <StatusBadge status={staff.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{staff.email || 'No email on file'}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 sm:pb-1">
              <Button size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                Set Schedule
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.push('/calendar')}>
                <CalendarDays className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
              <Button
                size="icon" variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete staff member"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatChip icon={Building2} label="Department" value={staff.department || '—'} />
            <StatChip icon={BadgeCheck} label="Role" value={typeof staff.role === 'string' && staff.role ? staff.role : '—'} />
            <StatChip icon={CalendarClock} label="Joined" value={staff.joinedDate || staff.createdAt ? formatDate(staff.joinedDate ?? staff.createdAt) : '—'} />
            <StatChip icon={Clock} label="Scheduled Days" value={String(scheduleEntries.length)} />
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={staff.email} />
            <InfoRow icon={Phone} label="Phone" value={staff.phone} />
            <InfoRow icon={Building2} label="Department" value={staff.department} />
            <InfoRow icon={BadgeCheck} label="Role" value={typeof staff.role === 'string' ? staff.role : undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scheduleEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No schedule set yet.</p>
            ) : (
              scheduleEntries.map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{DAY_LABELS[day] ?? day}</span>
                  <span className="font-medium">{String(hours)}</span>
                </div>
              ))
            )}
            <Button size="sm" variant="outline" className="w-full" onClick={() => setScheduleOpen(true)}>
              <Clock className="mr-2 h-4 w-4" />
              {scheduleEntries.length > 0 ? 'Edit Schedule' : 'Set Schedule'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <StaffFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        staff={staff}
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error ? getFriendlyErrorMessage(updateMutation.error, 'Unable to save staff member.') : null}
        roleOptions={roleOptions}
        departmentOptions={departmentOptions}
        onSubmit={handleUpdate}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Staff Member?"
        description={`Are you sure you want to delete ${staff.name || 'this staff member'}? This action cannot be undone.`}
        confirmLabel="Delete Staff"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />

      {/* Schedule */}
      <StaffScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        staff={staff}
        isSubmitting={scheduleMutation.isPending}
        onSubmit={handleScheduleSubmit}
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
        <p className="truncate text-sm font-semibold leading-tight capitalize">{value}</p>
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
