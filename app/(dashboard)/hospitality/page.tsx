'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, Eye, Trash2, Hotel, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton, StatsCardSkeleton } from '@/components/common/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency, getFriendlyErrorMessage } from '@/lib/utils';
import {
  useHospitalityBookings, useCreateBooking, useUpdateBookingStatus, useDeleteBooking,
} from '@/hooks/useHospitality';
import type { Hospitality, Status } from '@/types';

const TYPES: Hospitality['type'][] = ['Hotel', 'Transport', 'Meal', 'Airport Pickup', 'Special Request'];
// The backend's update_hospitality_status doesn't validate status server-side, but the rest of
// this app only ever uses these four values for booking-style records (see mock data / StatusBadge
// color map) — sticking to them keeps status colors and meaning consistent app-wide.
const STATUSES: Status[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const emptyForm = {
  guestName: '',
  type: 'Hotel' as Hospitality['type'],
  description: '',
  serviceDate: '',
  venue: '',
  vendor: '',
  cost: '',
  notes: '',
};

export default function HospitalityPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const { data: bookings, isLoading, isError, error, refetch } = useHospitalityBookings({
    status: (status || undefined) as Status | undefined,
    type: type || undefined,
  });
  const createBookingMutation = useCreateBooking();
  const updateStatusMutation = useUpdateBookingStatus();
  const deleteMutation = useDeleteBooking();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Hospitality | null>(null);

  const allBookings = bookings ?? [];
  const hasActiveFilters = !!status || !!type;

  function clearFilters() { setStatus(''); setType(''); }

  function handleOpen() {
    setForm(emptyForm);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.guestName.trim() || !form.type || !form.serviceDate) return;
    createBookingMutation.mutate(
      {
        guestName: form.guestName,
        type: form.type,
        description: form.description,
        status: 'pending',
        serviceDate: form.serviceDate,
        venue: form.venue || undefined,
        vendor: form.vendor || undefined,
        cost: form.cost ? Number(form.cost) : undefined,
        notes: form.notes || undefined,
      },
      { onSuccess: () => setOpen(false) }
    );
  }

  const total = allBookings.length;
  const pending = allBookings.filter((b) => b.status === 'pending').length;
  const confirmed = allBookings.filter((b) => b.status === 'confirmed').length;
  const completed = allBookings.filter((b) => b.status === 'completed').length;

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Hospitality</h1>
          <p className="text-muted-foreground">Concierge &amp; guest services.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleOpen}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Total Requests</p><p className="mt-1 text-2xl font-bold tabular-nums">{total}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Pending</p><p className="mt-1 text-2xl font-bold tabular-nums">{pending}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Confirmed</p><p className="mt-1 text-2xl font-bold tabular-nums">{confirmed}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Completed</p><p className="mt-1 text-2xl font-bold tabular-nums">{completed}</p></CardContent></Card>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type || 'all'} onValueChange={(v) => setType(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by service type">
            <SelectValue placeholder="All service types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All service types</SelectItem>
            {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear Filters</Button>}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton rows={8} /></div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState title="Unable to load hospitality requests" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />
            </div>
          ) : allBookings.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState icon={Hotel} title="No hospitality requests found" description="Try changing your filters." action={{ label: 'Clear filters', onClick: clearFilters }} />
              ) : (
                <EmptyState icon={Hotel} title="No hospitality requests yet" description="Create your first request to get started." action={{ label: 'New Request', onClick: handleOpen }} />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden sm:table-cell">Service</TableHead>
                    <TableHead className="hidden lg:table-cell">Description</TableHead>
                    <TableHead className="hidden md:table-cell">Scheduled Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Venue</TableHead>
                    <TableHead className="hidden lg:table-cell">Vendor</TableHead>
                    <TableHead className="hidden sm:table-cell">Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allBookings.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer" onClick={() => router.push(`/hospitality/${item.id}`)}>
                      <TableCell className="font-medium truncate max-w-[140px]">{item.guestName}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-sm text-muted-foreground">{item.description}</TableCell>
                      <TableCell className="hidden md:table-cell whitespace-nowrap text-sm">{formatDate(item.scheduledAt || item.serviceDate)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm truncate max-w-[140px]">{item.venue || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm truncate max-w-[140px]">{item.vendor || '—'}</TableCell>
                      <TableCell className="hidden sm:table-cell whitespace-nowrap">{item.cost != null ? formatCurrency(item.cost) : '—'}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell className="text-right" onClick={(evt) => evt.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${item.guestName}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/hospitality/${item.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {STATUSES.filter((s) => s !== item.status).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                className="cursor-pointer capitalize"
                                onClick={() => updateStatusMutation.mutate({ id: item.id, status: s })}
                                disabled={updateStatusMutation.isPending}
                              >
                                Mark {s}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(item)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Request */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>New Hospitality Request</DialogTitle>
            <DialogDescription>Book a hotel, transport, meal, or other guest service.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="guestName">Guest *</Label>
              <Input id="guestName" placeholder="e.g. Sarah Anderson" value={form.guestName} onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Service Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as Hospitality['type'] }))}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serviceDate">Scheduled Date *</Label>
              <Input id="serviceDate" type="date" value={form.serviceDate} onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Input id="description" placeholder="e.g. Grand Hotel - Suite 304" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" placeholder="e.g. Grand Hotel" value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" placeholder="e.g. City Cabs" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" type="number" min="0" step="0.01" placeholder="0.00" value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Optional note" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <DialogFooter className="pt-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createBookingMutation.isPending}>Cancel</Button>
              <Button type="submit" loading={createBookingMutation.isPending}>
                {createBookingMutation.isPending ? 'Creating…' : 'Create Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Hospitality Request?"
        description={`Are you sure you want to delete this request for ${deleteTarget?.guestName ?? 'this guest'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
