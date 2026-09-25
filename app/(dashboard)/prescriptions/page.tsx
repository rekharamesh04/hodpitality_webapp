'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Pill, Plus, RefreshCw, MoreHorizontal, Eye, Stethoscope, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PrescriptionStatusBadge } from '@/components/prescriptions/PrescriptionStatusBadge';
import { PrescriptionFormDialog } from '@/components/dialogs/PrescriptionFormDialog';
import { usePrescriptions, useDeletePrescription } from '@/hooks/usePrescriptions';
import { useTerminology } from '@/hooks';
import { useActionParam } from '@/hooks/useActionParam';
import { PRESCRIPTION_QUEUES } from '@/constants/prescription';
import { cn, formatDate, getFriendlyErrorMessage, getInitials, getRelativeTime } from '@/lib/utils';
import {
  medicineLabel, medicinesOf, patientNameOf, prescriberNameOf,
  type Prescription,
} from '@/types/prescription';

/**
 * The prescriptions worklist.
 *
 * Backed by GET /prescriptions, which enriches each row with the patient and
 * practitioner names, so the table needs no second fetch.
 *
 * The columns are what the record actually holds. A dispensing pharmacy would
 * also want a queue, a claim and a will-call bin; none of those exist on this
 * entity, so none are shown — see docs/PHARMACY_MODULE.md for what a fill
 * record would add.
 */
export default function PrescriptionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PrescriptionsPageInner />
    </Suspense>
  );
}

function PrescriptionsPageInner() {
  const t = useTerminology();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [queueId, setQueueId] = useState(searchParams.get('queue') ?? 'all');
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [prescriber, setPrescriber] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Prescription | null>(null);
  useActionParam({ add: () => setCreateOpen(true) });

  // Only `search` is a confirmed server-side filter. Status and prescriber are
  // applied below over this one fetched set, which also keeps the tab counts
  // stable as any single filter changes.
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePrescriptions({ search: search || undefined });
  const deleteMutation = useDeletePrescription();

  const all = useMemo(() => data ?? [], [data]);
  const queue = PRESCRIPTION_QUEUES.find((q) => q.id === queueId) ?? PRESCRIPTION_QUEUES[0];

  const prescriberOptions = useMemo(
    () => Array.from(new Set(all.map(prescriberNameOf))).filter((n) => n !== 'Unknown').sort(),
    [all],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of PRESCRIPTION_QUEUES) {
      map[q.id] = q.status ? all.filter((p) => p.status === q.status).length : all.length;
    }
    return map;
  }, [all]);

  const filtered = useMemo(() => {
    return all
      .filter((p) => {
        if (queue.status && p.status !== queue.status) return false;
        if (prescriber && prescriberNameOf(p) !== prescriber) return false;
        return true;
      })
      .sort((a, b) => {
        const at = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
        const bt = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
        return bt - at; // newest first
      });
  }, [all, queue, prescriber]);

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

  const hasFilters = !!search || !!prescriber;
  function clearFilters() { setSearch(''); setPrescriber(''); setPage(1); }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Prescriptions</h1>
          <p className="text-muted-foreground">
            Medicines prescribed to {t.person.many.toLowerCase()} by your {t.practitioner.toLowerCase()}s
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Prescription
          </Button>
        </div>
      </div>

      {/* Queues */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              <p className="mt-1 text-2xl font-bold tabular-nums">{isLoading ? '—' : counts[q.id] ?? 0}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder={`Search ${t.person.one.toLowerCase()}, medicine or diagnosis…`}
          defaultValue={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          className="max-w-sm"
        />
        <Select value={prescriber || 'all'} onValueChange={(v) => { setPrescriber(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[220px]" aria-label={`Filter by ${t.practitioner.toLowerCase()}`}>
            <SelectValue placeholder={`All ${t.practitioner.toLowerCase()}s`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {t.practitioner.toLowerCase()}s</SelectItem>
            {prescriberOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Reset</Button>}
      </div>

      {/* Worklist */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton rows={8} /></div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState
                title="Unable to load prescriptions"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Pill}
                title={hasFilters || queue.status ? 'No prescriptions found' : 'No prescriptions yet'}
                description={
                  hasFilters || queue.status
                    ? 'Try changing the search or filters.'
                    : `Prescriptions written for your ${t.person.many.toLowerCase()} will appear here.`
                }
                action={
                  hasFilters
                    ? { label: 'Clear filters', onClick: clearFilters }
                    : { label: 'New Prescription', onClick: () => setCreateOpen(true) }
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.person.one}</TableHead>
                    <TableHead>Medicines</TableHead>
                    <TableHead className="hidden lg:table-cell">Diagnosis</TableHead>
                    <TableHead className="hidden md:table-cell">{t.practitioner}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Written</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((p) => {
                    const meds = medicinesOf(p);
                    const created = p.created_at ?? p.createdAt;
                    return (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/prescriptions/${p.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {getInitials(patientNameOf(p))}
                              </AvatarFallback>
                            </Avatar>
                            <p className="truncate text-sm font-semibold">{patientNameOf(p)}</p>
                          </div>
                        </TableCell>

                        <TableCell className="max-w-[260px]">
                          {meds.length === 0 ? (
                            <span className="text-sm text-muted-foreground">None recorded</span>
                          ) : (
                            <div className="min-w-0">
                              <p className="truncate text-sm">{medicineLabel(meds[0])}</p>
                              {meds.length > 1 && (
                                <p className="text-xs text-muted-foreground">
                                  +{meds.length - 1} more
                                </p>
                              )}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="hidden max-w-[200px] lg:table-cell">
                          <span className="block truncate text-sm">{p.diagnosis || '—'}</span>
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            {prescriberNameOf(p)}
                          </span>
                        </TableCell>

                        <TableCell><PrescriptionStatusBadge status={p.status} /></TableCell>

                        <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground sm:table-cell">
                          {created ? getRelativeTime(created) : '—'}
                        </TableCell>

                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${patientNameOf(p)}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/prescriptions/${p.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> Open
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setToDelete(p)}
                              >
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
          onPageChange={setPage}
          onPageSizeChange={(l) => { setLimit(l); setPage(1); }}
        />
      )}

      <PrescriptionFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete this prescription?"
        description={
          toDelete
            ? `The prescription for ${patientNameOf(toDelete)} will be removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Prescriptions</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
      <Card><CardContent className="p-6"><TableSkeleton rows={8} /></CardContent></Card>
    </div>
  );
}
