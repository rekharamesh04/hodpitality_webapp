'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  QrCode, UserCheck, Printer, RefreshCw, ScanFace, MoreHorizontal, Eye, CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { CameraCaptureDialog } from '@/components/dialogs/CameraCaptureDialog';
import { GuestCombobox } from '@/components/common/GuestCombobox';
import {
  useCheckIns, useCheckInStats, useCheckIn, useQrCheckIn, usePrintBadge, useFacialCheckIn,
} from '@/hooks/useCheckins';
import { useAppointments } from '@/hooks/useAppointments';
import { useEvents } from '@/hooks/useEvents';
import { cn, formatCheckInTimestamp, getInitials, getFriendlyErrorMessage } from '@/lib/utils';
import type { CheckIn, Guest, Appointment } from '@/types';

type CheckMode = 'quick' | 'qr' | 'face' | null;

const METHOD_BADGE: Record<string, string> = {
  manual:             'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700',
  qr:                 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  qr_scan:            'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
  facial_recognition: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800',
  quick:              'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
  self:               'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getCheckInId(ci: CheckIn): string {
  return ci.id ?? (ci.PK ? ci.PK.replace('CHECKIN#', '') : '') ?? '';
}

function checkInDateIso(ci: CheckIn): string | null {
  const raw = ci.timestamp ?? ci.checkInTime;
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function getEventId(e: { id: string; PK?: string }): string {
  return e.id ?? (e.PK ? e.PK.replace('EVENT#', '') : '') ?? '';
}

export default function CheckInsPage() {
  return (
    <Suspense fallback={<CheckInsPageSkeleton />}>
      <CheckInsPageInner />
    </Suspense>
  );
}

function CheckInsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [eventFilter, setEventFilter] = useState(searchParams.get('event') ?? '');
  const [date, setDate] = useState(searchParams.get('date') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit') ?? '20') || 20);

  const [checkMode, setCheckMode] = useState<CheckMode>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [faceVenue, setFaceVenue] = useState('Main Lobby');
  const [faceEventId, setFaceEventId] = useState('');

  // Only `search` is a confirmed server-supported filter — status/date/event are applied
  // client-side below over this one fetched set, which also keeps their dropdown options
  // (and the badge counts) stable as any single filter changes.
  const { data: checkIns, isLoading, isError, error, refetch } = useCheckIns({ search: search || undefined });
  const { data: stats } = useCheckInStats();
  const { data: events } = useEvents();
  // The backend only auto-links a check-in to an appointment for the SAME day, so appointment
  // data is only ever fetched (and only ever shown) for the date currently being viewed.
  const { data: appointments } = useAppointments({ date: date || todayIso() });

  const quickCheckIn = useCheckIn();
  const qrCheckIn = useQrCheckIn();
  const printBadge = usePrintBadge();
  const facialCheckIn = useFacialCheckIn();

  const allCheckIns = useMemo(() => checkIns ?? [], [checkIns]);

  const statusOptions = useMemo(
    () => Array.from(new Set(allCheckIns.map((ci) => ci.status).filter((s): s is string => !!s))),
    [allCheckIns]
  );
  const eventOptions = useMemo(
    () => Array.from(new Set(allCheckIns.map((ci) => ci.event).filter((e): e is string => !!e))),
    [allCheckIns]
  );

  const filtered = useMemo(() => {
    return allCheckIns.filter((ci) => {
      if (status && ci.status !== status) return false;
      if (eventFilter && ci.event !== eventFilter) return false;
      if (date) {
        const ciDate = checkInDateIso(ci);
        if (ciDate !== date) return false;
      }
      return true;
    });
  }, [allCheckIns, status, eventFilter, date]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  const appointmentByCheckInId = useMemo(() => {
    const map = new Map<string, Appointment>();
    (appointments ?? []).forEach((a) => {
      if (a.checkinId) map.set(a.checkinId, a);
    });
    return map;
  }, [appointments]);
  const appointmentByGuestId = useMemo(() => {
    const map = new Map<string, Appointment>();
    (appointments ?? []).forEach((a) => {
      const gid = a.guestId ?? a.customerId;
      if (gid && !map.has(gid)) map.set(gid, a);
    });
    return map;
  }, [appointments]);

  function findAppointment(ci: CheckIn) {
    const id = getCheckInId(ci);
    return appointmentByCheckInId.get(id) ?? (ci.guestId ? appointmentByGuestId.get(ci.guestId) : undefined);
  }

  function syncUrl(next: { search?: string; status?: string; event?: string; date?: string; page?: number; limit?: number }) {
    const s = next.search ?? search;
    const st = next.status ?? status;
    const ev = next.event ?? eventFilter;
    const dt = next.date ?? date;
    const p = next.page ?? page;
    const l = next.limit ?? limit;
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (st) params.set('status', st);
    if (ev) params.set('event', ev);
    if (dt) params.set('date', dt);
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
  function handleEventChange(value: string) {
    const v = value === 'all' ? '' : value;
    setEventFilter(v); setPage(1); syncUrl({ event: v, page: 1 });
  }
  function handleDateChange(value: string) {
    setDate(value); setPage(1); syncUrl({ date: value, page: 1 });
  }
  function handlePageChange(p: number) {
    setPage(p); syncUrl({ page: p });
  }
  function handlePageSizeChange(l: number) {
    setLimit(l); setPage(1); syncUrl({ limit: l, page: 1 });
  }
  function clearFilters() {
    setSearch(''); setStatus(''); setEventFilter(''); setDate(''); setPage(1);
    router.replace(pathname, { scroll: false });
  }

  function handleQuickCheckIn() {
    if (!selectedGuest) return;
    const guestId = selectedGuest.id ?? (selectedGuest.PK ? selectedGuest.PK.replace('GUEST#', '') : '');
    if (!guestId) return;
    quickCheckIn.mutate(
      { guestId },
      { onSuccess: () => { setCheckMode(null); setSelectedGuest(null); } }
    );
  }

  function handleQrCheckIn() {
    if (!qrCode.trim()) return;
    qrCheckIn.mutate(
      { qrCode: qrCode.trim() },
      { onSuccess: () => { setCheckMode(null); setQrCode(''); } }
    );
  }

  function handleFaceCheckIn(imageDataUrl: string) {
    facialCheckIn.mutate(
      { image: imageDataUrl, venue: faceVenue.trim() || undefined, eventId: faceEventId || undefined },
      { onSuccess: (result) => { if (result.success) setCheckMode(null); } }
    );
  }

  const STAT_CARDS = [
    { label: 'Expected',  value: stats?.expected  ?? 0, color: 'text-blue-700 dark:text-blue-400' },
    { label: 'Arrived',   value: stats?.arrived   ?? 0, color: 'text-teal-700 dark:text-teal-400' },
    { label: 'On Site',   value: stats?.onSite    ?? 0, color: 'text-green-700 dark:text-green-400' },
    { label: 'Completed', value: stats?.completed ?? 0, color: 'text-gray-700 dark:text-gray-300' },
    { label: 'No Shows',  value: stats?.noShows   ?? 0, color: 'text-orange-700 dark:text-orange-400' },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, color: 'text-red-600 dark:text-red-400' },
  ];

  const hasActiveFilters = !!search || !!status || !!eventFilter || !!date;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Check-ins</h1>
          <p className="text-muted-foreground">Live front-desk check-in management</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCheckMode('qr')}>
            <QrCode className="mr-2 h-4 w-4" />
            QR Scan
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCheckMode('face')}>
            <ScanFace className="mr-2 h-4 w-4" />
            Face Scan
          </Button>
          <Button size="sm" onClick={() => setCheckMode('quick')}>
            <UserCheck className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder="Search guest name, email or phone…"
          defaultValue={search}
          onSearch={handleSearch}
          className="max-w-sm"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full sm:w-[170px]"
          aria-label="Filter by date"
        />
        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={eventFilter || 'all'} onValueChange={handleEventChange}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by event">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {eventOptions.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>Reset</Button>
        )}
      </div>

      {/* Check-in list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={8} />
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState
                title="Unable to load check-ins"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState
                  icon={UserCheck}
                  title="No check-ins found"
                  description="Try changing your search, date or filters."
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <EmptyState
                  icon={UserCheck}
                  title="No check-ins yet"
                  description="Guest check-ins will show up here as they happen."
                  action={{ label: 'Check In', onClick: () => setCheckMode('quick') }}
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden md:table-cell">Event</TableHead>
                    <TableHead className="hidden lg:table-cell">Appointment</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="hidden sm:table-cell">Time</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((ci) => {
                    const ciId = getCheckInId(ci);
                    const method = (ci.method ?? ci.checkInMethod ?? 'manual').toString().toLowerCase();
                    const ts = ci.timestamp ?? ci.checkInTime;
                    const appt = findAppointment(ci);
                    return (
                      <TableRow key={ciId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {ci.guestName ? getInitials(ci.guestName) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold truncate">{ci.guestName || ci.guestId || 'Guest'}</p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Printer
                                      className={cn('h-3 w-3 shrink-0', ci.badgePrinted ? 'text-success' : 'text-muted-foreground/30')}
                                      aria-label={ci.badgePrinted ? 'Badge printed' : 'Badge not printed yet'}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>{ci.badgePrinted ? 'Badge printed' : 'Badge not printed yet'}</TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-[160px]">{ci.guestEmail || '—'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm whitespace-nowrap truncate max-w-[160px]">{ci.event || '—'}</TableCell>
                        <TableCell className="hidden lg:table-cell whitespace-nowrap">
                          {appt ? (
                            <div className="text-sm">
                              <p className="truncate max-w-[140px]">{appt.service ?? appt.title ?? 'Appointment'}</p>
                              {appt.startTime && <p className="text-xs text-muted-foreground">{appt.startTime}</p>}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={cn('inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium capitalize', METHOD_BADGE[method] ?? METHOD_BADGE.manual)}>
                            {method.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell whitespace-nowrap text-sm text-muted-foreground">
                          {formatCheckInTimestamp(ts)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell whitespace-nowrap">
                          {ci.status ? (
                            <StatusBadge status={ci.status} className="whitespace-nowrap" />
                          ) : (
                            <Badge variant="outline" className="whitespace-nowrap text-xs">Checked in</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {ci.guestId && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/guests/${ci.guestId}`)}>
                                  <Eye className="mr-2 h-4 w-4" /> View Guest
                                </DropdownMenuItem>
                              )}
                              {appt && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/calendar')}>
                                  <CalendarClock className="mr-2 h-4 w-4" /> View Appointment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => printBadge.mutate(ciId)}
                                disabled={printBadge.isPending}
                              >
                                <Printer className="mr-2 h-4 w-4" /> {ci.badgePrinted ? 'Reprint Badge' : 'Print Badge'}
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Check-in Dialog */}
      <Dialog open={checkMode === 'quick'} onOpenChange={(v) => { if (!v) { setCheckMode(null); setSelectedGuest(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Quick Check-in</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Guest</Label>
              <GuestCombobox selected={selectedGuest} onSelectGuest={setSelectedGuest} disabled={quickCheckIn.isPending} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCheckMode(null); setSelectedGuest(null); }} disabled={quickCheckIn.isPending}>Cancel</Button>
            <Button onClick={handleQuickCheckIn} loading={quickCheckIn.isPending} disabled={!selectedGuest}>
              {quickCheckIn.isPending ? 'Checking in…' : 'Check In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Check-in Dialog */}
      <Dialog open={checkMode === 'qr'} onOpenChange={(v) => !v && setCheckMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>QR Code Check-in</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>QR Code</Label>
              <Input
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Scan or enter QR code"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleQrCheckIn()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckMode(null)}>Cancel</Button>
            <Button onClick={handleQrCheckIn} loading={qrCheckIn.isPending} disabled={!qrCode.trim()}>
              {qrCheckIn.isPending ? 'Processing…' : 'Scan & Check In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Facial Recognition Check-in Dialog */}
      <CameraCaptureDialog
        open={checkMode === 'face'}
        onOpenChange={(v) => !v && setCheckMode(null)}
        title="Facial Recognition Check-in"
        description="Capture a clear front-facing photo to identify the guest."
        submitLabel="Check In"
        isSubmitting={facialCheckIn.isPending}
        onSubmit={handleFaceCheckIn}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label>Venue</Label>
            <Input
              value={faceVenue}
              onChange={(e) => setFaceVenue(e.target.value)}
              placeholder="Main Lobby"
            />
          </div>
          <div className="space-y-1">
            <Label>Event (optional)</Label>
            <Select value={faceEventId || undefined} onValueChange={setFaceEventId}>
              <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
              <SelectContent>
                {(events ?? []).map((e) => {
                  const id = getEventId(e);
                  return <SelectItem key={id} value={id}>{e.title}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CameraCaptureDialog>
    </div>
    </TooltipProvider>
  );
}

function CheckInsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Check-ins</h1>
        <p className="text-muted-foreground">Live front-desk check-in management</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
