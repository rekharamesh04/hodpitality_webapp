'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Plus, MoreHorizontal, Eye, Pencil, Trash2, Calendar, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EventFormDialog } from '@/components/dialogs/EventFormDialog';
import {
  useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent,
} from '@/hooks/useEvents';
import { cn, formatDate, getFriendlyErrorMessage } from '@/lib/utils';
import type { CreateEventPayload, UpdateEventPayload } from '@/services/event.service';
import type { Event } from '@/types';

function getEventId(e: Event): string {
  return e.id ?? (e.PK ? e.PK.replace('EVENT#', '') : '') ?? '';
}
function eventDateIso(e: Event): string | null {
  const raw = e.startDate ?? e.date;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
function formErrorMessage(err: unknown): string | null {
  if (!err) return null;
  const backendMsg = (err as { backendMessage?: string } | undefined)?.backendMessage;
  return backendMsg || getFriendlyErrorMessage(err, 'Unable to save event.');
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageInner />
    </Suspense>
  );
}

function EventsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [venue, setVenue] = useState(searchParams.get('venue') ?? '');
  const [date, setDate] = useState(searchParams.get('date') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit') ?? '20') || 20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  // search/status/category are confirmed server-supported (the same generic list-filtering
  // helper the backend uses for check-ins/venues, plus category was already wired before this
  // rewrite). venue/date are NOT confirmed, so they're applied client-side over this fetched
  // set — which also keeps their dropdown options stable as other filters change.
  const { data: eventsData, isLoading, isError, error, refetch } = useEvents({
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
  });

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const allEvents = useMemo(() => eventsData ?? [], [eventsData]);

  const statusOptions = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.status).filter(Boolean))) as string[],
    [allEvents]
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.category).filter((c): c is string => !!c))),
    [allEvents]
  );
  const venueOptions = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.venue).filter((v): v is string => !!v))),
    [allEvents]
  );

  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      if (venue && e.venue !== venue) return false;
      if (date && eventDateIso(e) !== date) return false;
      return true;
    });
  }, [allEvents, venue, date]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  function syncUrl(next: { search?: string; status?: string; category?: string; venue?: string; date?: string; page?: number; limit?: number }) {
    const s = next.search ?? search;
    const st = next.status ?? status;
    const cat = next.category ?? category;
    const ve = next.venue ?? venue;
    const dt = next.date ?? date;
    const p = next.page ?? page;
    const l = next.limit ?? limit;
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (st) params.set('status', st);
    if (cat) params.set('category', cat);
    if (ve) params.set('venue', ve);
    if (dt) params.set('date', dt);
    if (p > 1) params.set('page', String(p));
    if (l !== 20) params.set('limit', String(l));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearch(value: string) { setSearch(value); setPage(1); syncUrl({ search: value, page: 1 }); }
  function handleStatusChange(value: string) { const v = value === 'all' ? '' : value; setStatus(v); setPage(1); syncUrl({ status: v, page: 1 }); }
  function handleCategoryChange(value: string) { const v = value === 'all' ? '' : value; setCategory(v); setPage(1); syncUrl({ category: v, page: 1 }); }
  function handleVenueChange(value: string) { const v = value === 'all' ? '' : value; setVenue(v); setPage(1); syncUrl({ venue: v, page: 1 }); }
  function handleDateChange(value: string) { setDate(value); setPage(1); syncUrl({ date: value, page: 1 }); }
  function handlePageChange(p: number) { setPage(p); syncUrl({ page: p }); }
  function handlePageSizeChange(l: number) { setLimit(l); setPage(1); syncUrl({ limit: l, page: 1 }); }
  function clearFilters() {
    setSearch(''); setStatus(''); setCategory(''); setVenue(''); setDate(''); setPage(1);
    router.replace(pathname, { scroll: false });
  }

  function openCreate() { setEditingEvent(null); setFormOpen(true); }
  function openEdit(e: Event) { setEditingEvent(e); setFormOpen(true); }

  function handleFormSubmit(payload: CreateEventPayload | UpdateEventPayload) {
    if (editingEvent) {
      updateMutation.mutate({ id: getEventId(editingEvent), data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate(payload as CreateEventPayload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(getEventId(deleteTarget), { onSuccess: () => setDeleteTarget(null) });
  }

  const isSubmittingForm = createMutation.isPending || updateMutation.isPending;
  const formSubmitError = formErrorMessage(createMutation.error ?? updateMutation.error);
  const hasActiveFilters = !!search || !!status || !!category || !!venue || !!date;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Events</h1>
          <p className="text-muted-foreground">Schedule and manage events</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Create Event
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder="Search events…"
          defaultValue={search}
          onSearch={handleSearch}
          className="max-w-sm"
        />
        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={venue || 'all'} onValueChange={handleVenueChange}>
          <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by venue">
            <SelectValue placeholder="All venues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All venues</SelectItem>
            {venueOptions.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full sm:w-[170px]"
          aria-label="Filter by date"
        />
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
                title="Unable to load events"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState
                  icon={Calendar}
                  title="No events found"
                  description="Try changing your search or filters."
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No events yet"
                  description="Create your first event to get started."
                  action={{ label: 'Create Event', onClick: openCreate }}
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Venue</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((e) => {
                    const id = getEventId(e);
                    const startDate = e.startDate ?? e.date;
                    const attendees = e.attendees ?? e.registered;
                    const hasAttendance = attendees !== undefined && e.capacity !== undefined;
                    const pct = hasAttendance && e.capacity! > 0 ? Math.min(Math.round((attendees! / e.capacity!) * 100), 100) : 0;
                    return (
                      <TableRow key={id} className="cursor-pointer" onClick={() => router.push(`/events/${id}`)}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate max-w-[220px]">{e.title || 'Untitled event'}</p>
                            {e.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[220px]">{e.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell whitespace-nowrap text-sm text-muted-foreground">
                          {startDate ? formatDate(startDate, 'MMM dd, yyyy') : '—'}
                          {e.endDate && <> – {formatDate(e.endDate, 'MMM dd, yyyy')}</>}
                        </TableCell>
                        <TableCell className="hidden md:table-cell whitespace-nowrap text-sm">
                          {e.venue ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden="true" />
                              {e.venue}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell whitespace-nowrap text-sm">{e.category || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {hasAttendance ? (
                            <div className="w-28 space-y-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground whitespace-nowrap">
                                <span>{attendees} / {e.capacity}</span>
                                <span>{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                          ) : attendees !== undefined ? (
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{attendees} registered</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <StatusBadge status={e.status} className="whitespace-nowrap" />
                        </TableCell>
                        <TableCell className="text-right" onClick={(evt) => evt.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${e.title}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/events/${id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(e)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(e)}>
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

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editingEvent}
        isSubmitting={isSubmittingForm}
        submitError={formSubmitError}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Event?"
        description={`Are you sure you want to delete ${deleteTarget?.title ?? 'this event'}? This action cannot be undone.`}
        confirmLabel="Delete Event"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function EventsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Events</h1>
        <p className="text-muted-foreground">Schedule and manage events</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
