'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Plus, MoreHorizontal, Pencil, Trash2, Gauge, MapPin, CalendarDays, Building2,
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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { VenueFormDialog } from '@/components/dialogs/VenueFormDialog';
import {
  useVenues, useCreateVenue, useUpdateVenue, useDeleteVenue, useUpdateVenueOccupancy,
} from '@/hooks/useVenues';
import { useEvents } from '@/hooks/useEvents';
import { getVenueCreatedRank } from '@/lib/local-venue-order';
import { cn, getFriendlyErrorMessage } from '@/lib/utils';
import type { CreateVenuePayload, UpdateVenuePayload } from '@/services/venue.service';
import type { Venue, Event } from '@/types';

function getVenueId(v: Venue): string {
  return v.id ?? (v.PK ? v.PK.replace('VENUE#', '') : '') ?? '';
}
function getEventVenueId(e: Event): string {
  return e.venueId ?? '';
}

function formErrorMessage(err: unknown): string | null {
  if (!err) return null;
  const backendMsg = (err as { backendMessage?: string } | undefined)?.backendMessage;
  return backendMsg || getFriendlyErrorMessage(err, 'Unable to save venue.');
}

const STATUS_BADGE: Record<string, string> = {
  active:   'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  inactive: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
};

export default function VenuesPage() {
  return (
    <Suspense fallback={<VenuesPageSkeleton />}>
      <VenuesPageInner />
    </Suspense>
  );
}

function VenuesPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [type, setType] = useState(searchParams.get('type') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit') ?? '20') || 20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Venue | null>(null);
  const [occTarget, setOccTarget] = useState<Venue | null>(null);
  const [occValue, setOccValue] = useState('');

  // Only `search` and `status` are confirmed server-supported filters (the backend's generic
  // list-filtering helper checks both). `type` isn't confirmed, so it's applied client-side
  // over this fetched set — which also keeps its dropdown options stable as other filters change.
  const { data: venuesData, isLoading, isError, error, refetch } = useVenues({ search: search || undefined, status: status || undefined });
  const { data: eventsData } = useEvents();

  const createMutation = useCreateVenue();
  const updateMutation = useUpdateVenue();
  const deleteMutation = useDeleteVenue();
  const occupancyMutation = useUpdateVenueOccupancy();

  // GET /venues has no creation timestamp and no guaranteed ordering, so a venue just created
  // from this app is pinned to the top via a locally-recorded creation time (see
  // lib/local-venue-order.ts) — venues never created from here keep the backend's original
  // relative order (stable sort).
  const allVenues = useMemo(() => {
    const list = venuesData ?? [];
    return [...list].sort((a, b) => {
      const ra = getVenueCreatedRank(getVenueId(a)) ?? -1;
      const rb = getVenueCreatedRank(getVenueId(b)) ?? -1;
      return rb - ra;
    });
  }, [venuesData]);
  const allEvents = useMemo(() => eventsData ?? [], [eventsData]);

  const typeOptions = useMemo(
    () => Array.from(new Set(allVenues.map((v) => v.type).filter((t): t is string => !!t))),
    [allVenues]
  );

  const filtered = useMemo(
    () => allVenues.filter((v) => !type || v.type === type),
    [allVenues, type]
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  // Events only carry a `venue` name today (the Events form has no venue picker yet — see
  // app/(dashboard)/events/page.tsx), so name is the primary match; venueId is used when present.
  const eventCountByVenue = useMemo(() => {
    const counts = new Map<string, number>();
    allEvents.forEach((e) => {
      const key = getEventVenueId(e) || e.venue;
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [allEvents]);

  function eventCountFor(v: Venue): number {
    const id = getVenueId(v);
    return eventCountByVenue.get(id) ?? (v.name ? eventCountByVenue.get(v.name) ?? 0 : 0);
  }

  function syncUrl(next: { search?: string; status?: string; type?: string; page?: number; limit?: number }) {
    const s = next.search ?? search;
    const st = next.status ?? status;
    const ty = next.type ?? type;
    const p = next.page ?? page;
    const l = next.limit ?? limit;
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (st) params.set('status', st);
    if (ty) params.set('type', ty);
    if (p > 1) params.set('page', String(p));
    if (l !== 20) params.set('limit', String(l));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearch(value: string) {
    setSearch(value); setPage(1); syncUrl({ search: value, page: 1 });
  }
  function handleStatusChange(value: string) {
    const v = value === 'all' ? '' : value;
    setStatus(v); setPage(1); syncUrl({ status: v, page: 1 });
  }
  function handleTypeChange(value: string) {
    const v = value === 'all' ? '' : value;
    setType(v); setPage(1); syncUrl({ type: v, page: 1 });
  }
  function handlePageChange(p: number) {
    setPage(p); syncUrl({ page: p });
  }
  function handlePageSizeChange(l: number) {
    setLimit(l); setPage(1); syncUrl({ limit: l, page: 1 });
  }
  function clearFilters() {
    setSearch(''); setStatus(''); setType(''); setPage(1);
    router.replace(pathname, { scroll: false });
  }

  function openCreate() { setEditingVenue(null); setFormOpen(true); }
  function openEdit(v: Venue) { setEditingVenue(v); setFormOpen(true); }

  function handleFormSubmit(payload: CreateVenuePayload | UpdateVenuePayload) {
    if (editingVenue) {
      updateMutation.mutate({ id: getVenueId(editingVenue), data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate(payload as CreateVenuePayload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(getVenueId(deleteTarget), { onSuccess: () => setDeleteTarget(null) });
  }

  function openOccupancy(v: Venue) {
    setOccTarget(v);
    setOccValue(String(v.occupancy ?? v.currentOccupancy ?? ''));
  }

  function handleOccupancySubmit() {
    if (!occTarget) return;
    occupancyMutation.mutate(
      { id: getVenueId(occTarget), occupancy: Number(occValue) || 0 },
      { onSuccess: () => { setOccTarget(null); setOccValue(''); } }
    );
  }

  const isSubmittingForm = createMutation.isPending || updateMutation.isPending;
  const formSubmitError = formErrorMessage(createMutation.error ?? updateMutation.error);
  const hasActiveFilters = !!search || !!status || !!type;
  const occCapacity = occTarget ? Number(occTarget.capacity) || 0 : 0;
  const occExceedsCapacity = occCapacity > 0 && Number(occValue) > occCapacity;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Venues</h1>
          <p className="text-muted-foreground">Manage event venues, capacity and occupancy</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Venue
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search venues…"
          defaultValue={search}
          onSearch={handleSearch}
          className="max-w-sm"
        />
        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Reset</Button>
        )}
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
                title="Unable to load venues"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState
                  icon={Building2}
                  title="No venues found"
                  description="Try changing your search or filters."
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <EmptyState
                  icon={Building2}
                  title="No venues yet"
                  description="Add your first venue to get started."
                  action={{ label: 'Add Venue', onClick: openCreate }}
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venue</TableHead>
                    <TableHead className="hidden sm:table-cell">Capacity</TableHead>
                    <TableHead className="hidden md:table-cell">Occupancy</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Events</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((v) => {
                    const id = getVenueId(v);
                    const capacity = Number(v.capacity) || 0;
                    const occ = Number(v.occupancy ?? v.currentOccupancy ?? 0);
                    const pct = capacity > 0 ? Math.min(Math.round((occ / capacity) * 100), 100) : 0;
                    const eventCount = eventCountFor(v);
                    const statusKey = (v.status ?? 'active').toLowerCase();
                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">{v.name || 'Unnamed venue'}</p>
                              {v.location && (
                                <p className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[180px]">
                                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  {v.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell whitespace-nowrap text-sm">{capacity || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="w-32 space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground whitespace-nowrap">
                              <span>{occ} / {capacity || '—'}</span>
                              <span>{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell whitespace-nowrap text-sm">{v.type || '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={cn('inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium capitalize', STATUS_BADGE[statusKey] ?? STATUS_BADGE.inactive)}>
                            {statusKey}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {eventCount > 0 ? (
                            <Button
                              variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs"
                              onClick={() => router.push('/events')}
                            >
                              <CalendarDays className="h-3 w-3" aria-hidden="true" />
                              {eventCount}
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${v.name}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openOccupancy(v)}>
                                <Gauge className="mr-2 h-4 w-4" /> Update Occupancy
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(v)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(v)}>
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

      {!isLoading && !isError && pageItems.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <VenueFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        venue={editingVenue}
        isSubmitting={isSubmittingForm}
        submitError={formSubmitError}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Venue?"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? 'this venue'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      {/* Update Occupancy */}
      <Dialog open={!!occTarget} onOpenChange={(v) => !occupancyMutation.isPending && !v && setOccTarget(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Update Occupancy</DialogTitle>
            <DialogDescription>{occTarget?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="occ-value">Current Occupancy</Label>
            <Input
              id="occ-value"
              type="number"
              min="0"
              step="1"
              value={occValue}
              onChange={(e) => setOccValue(e.target.value)}
              placeholder="e.g. 50"
            />
            {occCapacity > 0 && (
              <p className={cn('text-xs', occExceedsCapacity ? 'text-destructive' : 'text-muted-foreground')}>
                Capacity is {occCapacity}{occExceedsCapacity ? ' — this exceeds capacity' : ''}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOccTarget(null)} disabled={occupancyMutation.isPending}>Cancel</Button>
            <Button onClick={handleOccupancySubmit} loading={occupancyMutation.isPending} disabled={!occValue.trim()}>
              {occupancyMutation.isPending ? 'Saving…' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VenuesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Venues</h1>
        <p className="text-muted-foreground">Manage event venues, capacity and occupancy</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
