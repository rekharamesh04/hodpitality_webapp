'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Pill, Plus, ScanBarcode, RefreshCw, MoreHorizontal, Eye, ShieldAlert,
  Clock, FileWarning, PhoneCall, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { PrescriptionStatusBadge } from '@/components/prescriptions/PrescriptionStatusBadge';
import { ControlledBadge } from '@/components/prescriptions/ControlledBadge';
import { popup } from '@/lib/popup';
import { cn, formatDate, getInitials, getRelativeTime } from '@/lib/utils';
import {
  PRESCRIPTION_QUEUES, SEVERITY_RANK, SOURCE_LABELS, isControlled,
} from '@/constants/prescription';
import { MOCK_PRESCRIPTIONS } from '@/lib/mock/pharmacy';
import type { Prescription } from '@/types/prescription';

/**
 * The pharmacy worklist.
 *
 * Organised around queues rather than a single flat table, because that is how
 * the work actually moves: a technician lives in Intake, a pharmacist lives in
 * Review, and whoever is on the phone lives in Problems. The tiles along the
 * top are the queues *and* the filter — clicking one is how you pick up work.
 *
 * Static for now: it renders lib/mock/pharmacy.ts rather than calling an API
 * that does not exist yet. See docs/PHARMACY_MODULE.md.
 */
export default function PrescriptionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PrescriptionsPageInner />
    </Suspense>
  );
}

/** The worst unresolved alert on a prescription, for the flags column and sorting. */
function topSeverity(rx: Prescription) {
  const open = rx.alerts.filter((a) => !a.overriddenAt);
  if (open.length === 0) return null;
  return open.reduce((worst, a) => (SEVERITY_RANK[a.severity] < SEVERITY_RANK[worst.severity] ? a : worst));
}

function PrescriptionsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [queueId, setQueueId] = useState(searchParams.get('queue') ?? 'all');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [prescriber, setPrescriber] = useState('');
  const [source, setSource] = useState('');
  const [controlledOnly, setControlledOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const all = MOCK_PRESCRIPTIONS;
  const queue = PRESCRIPTION_QUEUES.find((q) => q.id === queueId) ?? PRESCRIPTION_QUEUES[0];

  const prescriberOptions = useMemo(
    () => Array.from(new Set(all.map((rx) => rx.prescriber.name))).sort(),
    [all],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of PRESCRIPTION_QUEUES) {
      map[q.id] = q.statuses ? all.filter((rx) => q.statuses!.includes(rx.status)).length : all.length;
    }
    return map;
  }, [all]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return all
      .filter((rx) => {
        if (queue.statuses && !queue.statuses.includes(rx.status)) return false;
        if (prescriber && rx.prescriber.name !== prescriber) return false;
        if (source && rx.source !== source) return false;
        if (controlledOnly && !isControlled(rx.drug.schedule)) return false;
        if (needle) {
          const haystack = [
            rx.patientName, rx.rxNumber, rx.drug.name, rx.drug.genericName ?? '',
            rx.drug.ndc, rx.prescriber.name,
          ].join(' ').toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
        return true;
      })
      // Worst clinical problem first, then longest-waiting — the two things that
      // decide what a pharmacist should pick up next.
      .sort((a, b) => {
        const sa = topSeverity(a);
        const sb = topSeverity(b);
        const ra = sa ? SEVERITY_RANK[sa.severity] : 99;
        const rb = sb ? SEVERITY_RANK[sb.severity] : 99;
        if (ra !== rb) return ra - rb;
        return new Date(a.queuedAt ?? 0).getTime() - new Date(b.queuedAt ?? 0).getTime();
      });
  }, [all, queue, search, prescriber, source, controlledOnly]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  function selectQueue(id: string) {
    setQueueId(id);
    setPage(1);
    const params = new URLSearchParams();
    if (id !== 'all') params.set('queue', id);
    if (search) params.set('search', search);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const hasFilters = !!search || !!prescriber || !!source || controlledOnly;

  function clearFilters() {
    setSearch(''); setPrescriber(''); setSource(''); setControlledOnly(false); setPage(1);
  }

  // Every action is a placeholder until the API lands — say so plainly rather
  // than rendering a button that silently does nothing.
  function notWired(what: string) {
    popup.info(`${what} is not wired up yet`, {
      description: 'These screens are a static prototype. See docs/PHARMACY_MODULE.md for the endpoint this needs.',
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Prescriptions</h1>
            <p className="text-muted-foreground">{queue.hint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => notWired('Refresh')} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => notWired('Barcode scan')}>
              <ScanBarcode className="mr-2 h-4 w-4" />
              Scan Rx
            </Button>
            <Button size="sm" onClick={() => notWired('New prescription')}>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </div>
        </div>

        {/* Queues — the tiles are the filter */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {PRESCRIPTION_QUEUES.map((q) => {
            const active = q.id === queue.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => selectQueue(q.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-lg border bg-card px-4 py-3 text-left transition-all',
                  'hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active && 'border-primary bg-primary/5 ring-1 ring-primary/20',
                )}
              >
                <p className={cn('text-xs font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
                  {q.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{counts[q.id] ?? 0}</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            placeholder="Patient, Rx number, drug or NDC…"
            defaultValue={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            className="max-w-sm"
          />
          <Select value={prescriber || 'all'} onValueChange={(v) => { setPrescriber(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[210px]" aria-label="Filter by prescriber">
              <SelectValue placeholder="All prescribers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prescribers</SelectItem>
              {prescriberOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={source || 'all'} onValueChange={(v) => { setSource(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by source">
              <SelectValue placeholder="Any source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any source</SelectItem>
              {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant={controlledOnly ? 'default' : 'outline'}
            onClick={() => { setControlledOnly((v) => !v); setPage(1); }}
            aria-pressed={controlledOnly}
          >
            <Lock className="mr-2 h-4 w-4" />
            Controlled only
          </Button>
          {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Reset</Button>}
        </div>

        {/* Worklist */}
        <Card>
          <CardContent className="p-0">
            {pageItems.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Pill}
                  title="Nothing in this queue"
                  description={
                    hasFilters
                      ? 'No prescription matches these filters. Try widening the search.'
                      : 'Work arriving in this queue will appear here.'
                  }
                  action={hasFilters ? { label: 'Clear filters', onClick: clearFilters } : undefined}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead className="hidden lg:table-cell">Rx #</TableHead>
                      <TableHead className="hidden xl:table-cell">Prescriber</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Waiting</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((rx) => {
                      const worst = topSeverity(rx);
                      const claimProblem =
                        rx.claim?.status === 'rejected' || rx.claim?.status === 'prior_auth';
                      return (
                        <TableRow
                          key={rx.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/prescriptions/${rx.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                  {getInitials(rx.patientName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{rx.patientName}</p>
                                <p className="text-xs text-muted-foreground">
                                  DOB {formatDate(rx.patientDob, 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-sm font-medium">
                                  {rx.drug.name} {rx.drug.strength}
                                </p>
                                <ControlledBadge schedule={rx.drug.schedule} />
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {rx.quantity} {rx.drug.form.toLowerCase()}
                                {rx.daysSupply ? ` · ${rx.daysSupply}-day supply` : ''}
                                {` · ${rx.refillsRemaining}/${rx.refillsAuthorized} refills`}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="hidden whitespace-nowrap font-mono text-xs lg:table-cell">
                            {rx.rxNumber}
                          </TableCell>

                          <TableCell className="hidden xl:table-cell">
                            <p className="truncate text-sm">{rx.prescriber.name}</p>
                            <p className="text-xs text-muted-foreground">{SOURCE_LABELS[rx.source]}</p>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {worst && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <ShieldAlert
                                      className={cn(
                                        'h-4 w-4',
                                        worst.severity === 'contraindicated' && 'text-red-600 dark:text-red-400',
                                        worst.severity === 'severe' && 'text-orange-600 dark:text-orange-400',
                                        worst.severity === 'moderate' && 'text-amber-600 dark:text-amber-400',
                                        worst.severity === 'info' && 'text-blue-600 dark:text-blue-400',
                                      )}
                                      aria-label={worst.title}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">{worst.title}</TooltipContent>
                                </Tooltip>
                              )}
                              {claimProblem && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <FileWarning
                                      className="h-4 w-4 text-amber-600 dark:text-amber-400"
                                      aria-label={rx.claim?.rejectReason ?? 'Claim problem'}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>{rx.claim?.rejectReason ?? 'Claim problem'}</TooltipContent>
                                </Tooltip>
                              )}
                              {!worst && !claimProblem && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <PrescriptionStatusBadge status={rx.status} />
                            {rx.willCallBin && (
                              <p className="mt-1 text-[11px] text-muted-foreground">{rx.willCallBin}</p>
                            )}
                          </TableCell>

                          <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground sm:table-cell">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {rx.queuedAt ? getRelativeTime(rx.queuedAt) : '—'}
                            </span>
                          </TableCell>

                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" aria-label={`Actions for Rx ${rx.rxNumber}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => router.push(`/prescriptions/${rx.id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> Open
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => notWired('Contacting the prescriber')}
                                >
                                  <PhoneCall className="mr-2 h-4 w-4" /> Contact prescriber
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => router.push(`/pickup?patient=${rx.patientId}`)}
                                >
                                  <Pill className="mr-2 h-4 w-4" /> Start pickup
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

        {pageItems.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={limit}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(l) => { setLimit(l); setPage(1); }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Prescriptions</h1>
        <p className="text-muted-foreground">Loading the worklist…</p>
      </div>
      <Card><CardContent className="h-96" /></Card>
    </div>
  );
}
