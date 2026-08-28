'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, Pencil, Trash2, Camera, Link2, Mail, Phone, Building2,
  Wallet, CalendarClock, MessageSquare, AlertTriangle, Clock, BadgeCheck,
  UserRoundCheck, Repeat, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CustomerFormDialog } from '@/components/dialogs/CustomerFormDialog';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  useCustomer, useUpdateCustomer, useDeleteCustomer, useEnrollCustomerFace, useLinkCustomerAccount,
} from '@/hooks/useCustomers';
import { getLocalAvatar } from '@/lib/local-avatars';
import { cn, formatCurrency, formatDate, getInitials, getFriendlyErrorMessage } from '@/lib/utils';
import { TIER_BADGE_CLASSES } from '@/constants';
import type { UpdateCustomerPayload } from '@/services/customer.service';

function getCustomerId(id: string, pk?: string): string {
  return id || (pk ? pk.replace('CUSTOMER#', '') : '');
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: customer, isLoading, isError, error, refetch } = useCustomer(id);
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const enrollFace = useEnrollCustomerFace();
  const linkAccount = useLinkCustomerAccount();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [faceOpen, setFaceOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUserId, setLinkUserId] = useState('');

  function handleUpdate(payload: UpdateCustomerPayload) {
    updateMutation.mutate({ id, data: payload }, { onSuccess: () => setEditOpen(false) });
  }

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Customer deleted');
        router.push('/customers');
      },
    });
  }

  function handleFaceSubmit(image: string) {
    enrollFace.mutate({ customerId: id, image }, { onSuccess: () => setFaceOpen(false) });
  }

  function handleLinkSubmit() {
    linkAccount.mutate(
      { customerId: id, userId: linkUserId.trim() || undefined },
      { onSuccess: () => { setLinkOpen(false); setLinkUserId(''); } }
    );
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

  if (isError || !customer) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/customers')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All customers
        </Button>
        <ErrorState
          title="Unable to load this customer"
          message={getFriendlyErrorMessage(error, 'This customer could not be found.')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const resolvedId = getCustomerId(customer.id, customer.PK);
  const localPhoto = getLocalAvatar(`customer:${resolvedId}`);
  const createdAt = customer.createdAt ?? customer.created_at;
  const hasFacePhoto = !!localPhoto;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/customers')} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All customers
        </Button>

        {/* Hero */}
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-24" />
          <CardContent className="relative px-4 pb-6 pt-0 sm:px-6">
            <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
                <Avatar className="h-20 w-20 border-4 border-card shadow-[var(--shadow-medium)] sm:h-24 sm:w-24">
                  <AvatarImage src={localPhoto} alt={customer.name} />
                  <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                    {customer.name ? getInitials(customer.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="sm:pb-1">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-bold tracking-tight">{customer.name || 'Unnamed customer'}</h1>
                    {customer.tier && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          TIER_BADGE_CLASSES[customer.tier] ?? 'bg-gray-100 text-gray-700 border-gray-300'
                        )}
                      >
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        {customer.tier}
                      </span>
                    )}
                    {customer.allergyNotes && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        Allergy
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{customer.email || 'No email on file'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-2 sm:pb-1">
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
                    <Button size="icon" variant="outline" aria-label="Link account" onClick={() => setLinkOpen(true)}>
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Link account</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Delete customer" onClick={() => setDeleteOpen(true)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete customer</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Stat strip */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatChip icon={Wallet} label="Balance" value={customer.balance !== undefined ? formatCurrency(customer.balance) : '—'} />
              <StatChip icon={Repeat} label="Visits" value={customer.visits !== undefined ? String(customer.visits) : '—'} />
              <StatChip icon={CalendarClock} label="Next Appointment" value={customer.nextAppointment ? formatDate(customer.nextAppointment, 'MMM dd, yyyy') : '—'} />
              <StatChip icon={Clock} label="Customer Since" value={createdAt ? formatDate(createdAt) : '—'} />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email" value={customer.email} />
              <InfoRow icon={Phone} label="Phone" value={customer.phone} />
              <InfoRow icon={Building2} label="Company" value={customer.company} />
              <InfoRow icon={BadgeCheck} label="Designation" value={customer.designation} />
              <InfoRow icon={MessageSquare} label="Preferred Contact" value={customer.preferredContact} />
              <InfoRow icon={CalendarClock} label="Next Appointment" value={customer.nextAppointment ? formatDate(customer.nextAppointment, 'MMM dd, yyyy HH:mm') : undefined} />
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
                <Button size="sm" variant="outline" className="w-full" onClick={() => setLinkOpen(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Link Account
                </Button>
              </CardContent>
            </Card>

            {customer.allergyNotes && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Allergy Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{customer.allergyNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit dialog */}
        <CustomerFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          customer={customer}
          isSubmitting={updateMutation.isPending}
          submitError={updateMutation.error ? getFriendlyErrorMessage(updateMutation.error, 'Unable to save customer.') : null}
          onSubmit={handleUpdate}
        />

        {/* Delete confirmation */}
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Customer?"
          description={`Are you sure you want to delete ${customer.name || 'this customer'}? This action cannot be undone.`}
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
          description="Capture a clear front-facing photo to enroll this customer."
          submitLabel="Enroll"
          isSubmitting={enrollFace.isPending}
          onSubmit={handleFaceSubmit}
        />

        {/* Link account */}
        <Dialog open={linkOpen} onOpenChange={(v) => !linkAccount.isPending && setLinkOpen(v)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Link Account</DialogTitle>
              <DialogDescription>
                Link this customer to an existing user account. Leave blank to link by matching email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5 py-2">
              <Label htmlFor="link-user-id">User ID (optional)</Label>
              <Input
                id="link-user-id"
                value={linkUserId}
                onChange={(e) => setLinkUserId(e.target.value)}
                placeholder="e.g. cognito user sub"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkOpen(false)} disabled={linkAccount.isPending}>
                Cancel
              </Button>
              <Button onClick={handleLinkSubmit} loading={linkAccount.isPending}>
                {linkAccount.isPending ? 'Linking…' : 'Link Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
