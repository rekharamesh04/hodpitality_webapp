'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus, Check, CreditCard, Trash2, Pencil, MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompleteRegistrationDialog } from '@/components/dialogs/CompleteRegistrationDialog';
import { RecordPaymentDialog } from '@/components/dialogs/RecordPaymentDialog';
import { RegistrationEditDialog } from '@/components/dialogs/RegistrationEditDialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton, StatsCardSkeleton } from '@/components/common/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, formatCurrency, getFriendlyErrorMessage } from '@/lib/utils';
import { guestCategoryBadgeClass } from '@/constants';
import { useTerminology } from '@/hooks';
import {
  useRegistrations, useConfirmRegistration, useDeleteRegistration,
} from '@/hooks/useRegistrations';
import { useActionParam } from '@/hooks/useActionParam';
import { useEvents } from '@/hooks/useEvents';
import type { Registration } from '@/types';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];
const PAYMENT_STATUS_OPTIONS = ['paid', 'pending', 'failed', 'refunded'];

export default function RegistrationsPage() {
  return (
    <Suspense fallback={<div className="p-6"><TableSkeleton rows={8} /></div>}>
      <RegistrationsPageInner />
    </Suspense>
  );
}

function RegistrationsPageInner() {
  const t = useTerminology();
  const industry = t.slug;
  const router = useRouter();
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<Registration | null>(null);
  const [editTarget, setEditTarget] = useState<Registration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);

  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Loads the full (filtered) set so the summary cards reflect every registration, not just one page.
  const { data: regs, isLoading, isError, error, refetch } = useRegistrations({
    status: (status || undefined) as Registration['status'] | undefined,
    paymentStatus: paymentStatus || undefined,
    eventId: eventFilter || undefined,
  });
  const registrations = useMemo(() => regs ?? [], [regs]);

  const confirmReg = useConfirmRegistration();
  const deleteReg = useDeleteRegistration();

  useActionParam({ add: () => setRegistrationDialogOpen(true) });

  // Event filter: value is the event id (what the API filters on), label is the event's title.
  const { data: events } = useEvents();
  const eventOptions = useMemo(
    () => (events ?? [])
      .map((e) => [e.id ?? (e.PK ? e.PK.replace('EVENT#', '') : ''), e.title || 'Untitled event'] as const)
      .filter(([id]) => !!id)
      .sort((a, b) => a[1].localeCompare(b[1])),
    [events]
  );

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return registrations;
    return registrations.filter((r) =>
      [r.guestName, r.guestEmail, r.phone, r.event, r.id].some((v) => v?.toLowerCase().includes(q))
    );
  }, [registrations, search]);

  const total = searched.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, totalPages);
  const pageItems = searched.slice((currentPage - 1) * limit, currentPage * limit);

  const confirmed = searched.filter((r) => r.status === 'confirmed').length;
  const pending = searched.filter((r) => r.status === 'pending').length;
  const revenue = searched
    .filter((r) => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const hasActiveFilters = !!status || !!paymentStatus || !!eventFilter || !!search;

  function clearFilters() {
    setStatus(''); setPaymentStatus(''); setEventFilter(''); setSearch(''); setPage(1);
    setSearchResetKey((k) => k + 1);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteReg.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Registrations</h1>
          <p className="text-muted-foreground">Track event registrations and payments.</p>
        </div>
        <Button size="sm" onClick={() => setRegistrationDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Complete Registration
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Total Registrations</p><p className="mt-1 text-2xl font-bold tabular-nums">{total}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Confirmed</p><p className="mt-1 text-2xl font-bold tabular-nums">{confirmed}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Pending</p><p className="mt-1 text-2xl font-bold tabular-nums">{pending}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs font-medium text-muted-foreground">Paid Revenue</p><p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(revenue)}</p></CardContent></Card>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          key={searchResetKey}
          placeholder={`Search ${t.person.one.toLowerCase()}, email or event…`}
          defaultValue={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          className="w-full sm:max-w-xs"
        />
        <Select value={status || 'all'} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={paymentStatus || 'all'} onValueChange={(v) => { setPaymentStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by payment status">
            <SelectValue placeholder="All payment statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment statuses</SelectItem>
            {PAYMENT_STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {eventOptions.length > 0 && (
          <Select value={eventFilter || 'all'} onValueChange={(v) => { setEventFilter(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by event">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {eventOptions.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear Filters</Button>}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton rows={8} /></div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState title="Unable to load registrations" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState icon={ClipboardList} title="No registrations found" description="Try changing your filters." action={{ label: 'Clear filters', onClick: clearFilters }} />
              ) : (
                <EmptyState icon={ClipboardList} title="No registrations yet" description="Complete your first registration to get started." action={{ label: 'Complete Registration', onClick: () => setRegistrationDialogOpen(true) }} />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden lg:table-cell">Registration ID</TableHead>
                    <TableHead>{t.person.one}</TableHead>
                    <TableHead className="hidden sm:table-cell">Event</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((reg) => (
                    <TableRow key={reg.id} className="cursor-pointer" onClick={() => router.push(`/registrations/${reg.id}`)}>
                      <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground truncate max-w-[120px]">{reg.id}</TableCell>
                      <TableCell>
                        <div className="font-medium truncate max-w-[160px]">{reg.guestName}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[160px]">{reg.guestEmail}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell truncate max-w-[140px]">{reg.event}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {reg.category ? (
                          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', guestCategoryBadgeClass(reg.category, industry))}>
                            {reg.category}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell whitespace-nowrap text-sm text-muted-foreground">{formatDate(reg.createdAt || reg.registrationDate)}</TableCell>
                      <TableCell><StatusBadge status={reg.status} /></TableCell>
                      <TableCell>
                        <StatusBadge status={reg.paymentStatus} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell whitespace-nowrap">{reg.amount != null ? formatCurrency(reg.amount) : '—'}</TableCell>
                      <TableCell className="text-right" onClick={(evt) => evt.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${reg.guestName}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/registrations/${reg.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setEditTarget(reg)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {reg.status !== 'confirmed' && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => confirmReg.mutate(reg.id)}
                                disabled={confirmReg.isPending && confirmReg.variables === reg.id}
                              >
                                <Check className="mr-2 h-4 w-4" /> Confirm
                              </DropdownMenuItem>
                            )}
                            {reg.paymentStatus !== 'paid' && (
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setPaymentTarget(reg)}>
                                <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(reg)}>
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

      {!isLoading && !isError && pageItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={limit}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(l) => { setLimit(l); setPage(1); }}
        />
      )}

      <CompleteRegistrationDialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen} />
      <RecordPaymentDialog open={!!paymentTarget} onOpenChange={(v) => !v && setPaymentTarget(null)} registration={paymentTarget} />
      <RegistrationEditDialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)} registration={editTarget} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Registration?"
        description={`Are you sure you want to delete ${deleteTarget?.guestName ?? 'this registration'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteReg.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
