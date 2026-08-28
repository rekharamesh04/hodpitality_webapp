'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus, Download, MoreHorizontal, Eye, Pencil, Trash2, Users, ScanFace, UserCheck, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { GuestFormDialog } from '@/components/dialogs/GuestFormDialog';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import {
  useGuests, useCreateGuest, useUpdateGuest, useDeleteGuest, useEnrollFace,
} from '@/hooks/use-guests';
import { useCheckIn } from '@/hooks/useCheckins';
import { guestService } from '@/services/guest.service';
import type { CreateGuestPayload, UpdateGuestPayload } from '@/services/guest.service';
import { GUEST_CATEGORIES, GUEST_CATEGORY_BADGE_CLASSES, QUERY_KEYS } from '@/constants';
import {
  cn, formatDate, formatCheckInTimestamp, getInitials, exportToCSV, getFriendlyErrorMessage,
} from '@/lib/utils';
import type { Guest } from '@/types';

function getGuestId(g: Guest): string {
  return g.id ?? (g.PK ? g.PK.replace('GUEST#', '') : '') ?? '';
}

function formErrorMessage(err: unknown): string | null {
  if (!err) return null;
  const backendMsg = (err as { backendMessage?: string } | undefined)?.backendMessage;
  return backendMsg || getFriendlyErrorMessage(err, 'Unable to save guest.');
}

export default function GuestsPage() {
  return (
    <Suspense fallback={<GuestsPageSkeleton />}>
      <GuestsPageInner />
    </Suspense>
  );
}

function GuestsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit') ?? '20') || 20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);
  const [enrollTarget, setEnrollTarget] = useState<Guest | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filters = useMemo(
    () => ({ page, limit, search: search || undefined, category: category || undefined }),
    [page, limit, search, category]
  );

  const { data, isLoading, isError, error, refetch } = useGuests(filters);
  const guests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const createMutation = useCreateGuest();
  const updateMutation = useUpdateGuest();
  const deleteMutation = useDeleteGuest();
  const enrollFace = useEnrollFace();
  const checkIn = useCheckIn();

  function syncUrl(next: { search?: string; category?: string; page?: number; limit?: number }) {
    const s = next.search ?? search;
    const c = next.category ?? category;
    const p = next.page ?? page;
    const l = next.limit ?? limit;
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (c) params.set('category', c);
    if (p > 1) params.set('page', String(p));
    if (l !== 20) params.set('limit', String(l));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    syncUrl({ search: value, page: 1 });
  }

  function handleCategoryChange(value: string) {
    const v = value === 'all' ? '' : value;
    setCategory(v);
    setPage(1);
    syncUrl({ category: v, page: 1 });
  }

  function handlePageChange(p: number) {
    setPage(p);
    syncUrl({ page: p });
  }

  function handlePageSizeChange(l: number) {
    setLimit(l);
    setPage(1);
    syncUrl({ limit: l, page: 1 });
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setPage(1);
    router.replace(pathname, { scroll: false });
  }

  function openCreate() {
    setEditingGuest(null);
    setFormOpen(true);
  }

  function openEdit(g: Guest) {
    setEditingGuest(g);
    setFormOpen(true);
  }

  function handleFormSubmit(payload: CreateGuestPayload | UpdateGuestPayload) {
    if (editingGuest) {
      updateMutation.mutate(
        { id: getGuestId(editingGuest), data: payload },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(payload as CreateGuestPayload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(getGuestId(deleteTarget), {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  function handleCheckIn(g: Guest) {
    const guestId = getGuestId(g);
    if (!guestId) return;
    checkIn.mutate(
      { guestId },
      { onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.GUESTS }) }
    );
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await guestService.exportGuests();
      if (res.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else if (res.data && res.data.length > 0) {
        exportToCSV(res.data, `guests-export-${new Date().toISOString().slice(0, 10)}`);
        toast.success('Guest export downloaded');
      } else {
        toast.error('The export returned no data.');
      }
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, 'Failed to export guests.'));
    } finally {
      setIsExporting(false);
    }
  }

  const isSubmittingForm = createMutation.isPending || updateMutation.isPending;
  const formSubmitError = formErrorMessage(createMutation.error ?? updateMutation.error);
  const hasActiveFilters = !!search || !!category;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Guests</h1>
          <p className="text-muted-foreground">Visitor, event attendance &amp; check-in management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/registrations')}>
            <ClipboardList className="mr-2 h-4 w-4" aria-hidden="true" />
            Registrations
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} loading={isExporting}>
            {!isExporting && <Download className="mr-2 h-4 w-4" aria-hidden="true" />}
            Export
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Guest
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search guests…"
          defaultValue={search}
          onSearch={handleSearch}
          className="max-w-sm"
        />
        <Select value={category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {GUEST_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={8} />
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState
                title="Unable to load guests"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : guests.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState
                  icon={Users}
                  title="No guests found"
                  description="Try changing your search or filters."
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No guests yet"
                  description="Add your first guest to get started."
                  action={{ label: 'Add Guest', onClick: openCreate }}
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden sm:table-cell">Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Check-in</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((g) => {
                    const id = getGuestId(g);
                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <button
                            className="flex items-center gap-3 text-left hover:underline"
                            onClick={() => router.push(`/guests/${id}`)}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={g.avatar} alt={g.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {g.name ? getInitials(g.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{g.name || 'Unnamed guest'}</p>
                              <p className="text-xs text-muted-foreground">
                                {g.registrationDate ? `Registered ${formatDate(g.registrationDate)}` : ''}
                              </p>
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-sm truncate max-w-[180px]">{g.email || '—'}</p>
                          <p className="text-xs text-muted-foreground">{g.phone || '—'}</p>
                        </TableCell>
                        <TableCell>
                          {g.category ? (
                            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', GUEST_CATEGORY_BADGE_CLASSES[g.category] ?? GUEST_CATEGORY_BADGE_CLASSES.regular)}>
                              {g.category}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <StatusBadge status={g.status} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {g.checkedIn ? (
                            <div className="flex items-center gap-1.5 text-success">
                              <UserCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <div>
                                <p className="text-xs font-medium leading-tight">Checked in</p>
                                {g.checkInTime && (
                                  <p className="text-xs text-muted-foreground leading-tight">{formatCheckInTimestamp(g.checkInTime)}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">Not checked in</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${g.name}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/guests/${id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(g)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              {!g.checkedIn && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleCheckIn(g)} disabled={checkIn.isPending}>
                                  <UserCheck className="mr-2 h-4 w-4" /> Check In
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setEnrollTarget(g)}>
                                <ScanFace className="mr-2 h-4 w-4" /> {g.avatar ? 'Re-enroll Face' : 'Enroll Face'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(g)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && !isError && guests.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <GuestFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        guest={editingGuest}
        isSubmitting={isSubmittingForm}
        submitError={formSubmitError}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Guest?"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? 'this guest'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <CameraCaptureDialog
        open={!!enrollTarget}
        onOpenChange={(v) => !v && setEnrollTarget(null)}
        title={`Enroll Face — ${enrollTarget?.name ?? ''}`}
        description="Capture a clear front-facing photo for facial recognition check-in."
        submitLabel="Enroll"
        isSubmitting={enrollFace.isPending}
        onSubmit={(imageDataUrl) => {
          const guestId = enrollTarget ? getGuestId(enrollTarget) : '';
          if (!guestId) return;
          enrollFace.mutate(
            { guestId, image: imageDataUrl },
            { onSuccess: () => setEnrollTarget(null) }
          );
        }}
      />
    </div>
  );
}

function GuestsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Guests</h1>
        <p className="text-muted-foreground">Visitor, event attendance &amp; check-in management</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
