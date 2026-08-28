'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Download, MoreHorizontal, Eye, Pencil, Trash2, Users } from 'lucide-react';
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
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { CustomerFormDialog } from '@/components/dialogs/CustomerFormDialog';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomers';
import { customerService } from '@/services/customer.service';
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from '@/services/customer.service';
import { CUSTOMER_TIERS, TIER_BADGE_CLASSES } from '@/constants';
import { cn, formatDate, formatCurrency, getInitials, exportToCSV, getFriendlyErrorMessage } from '@/lib/utils';

function getCustomerId(c: Customer): string {
  return c.id ?? (c.PK ? c.PK.replace('CUSTOMER#', '') : '') ?? '';
}

function formErrorMessage(err: unknown): string | null {
  if (!err) return null;
  const backendMsg = (err as { backendMessage?: string } | undefined)?.backendMessage;
  return backendMsg || getFriendlyErrorMessage(err, 'Unable to save customer.');
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersPageSkeleton />}>
      <CustomersPageInner />
    </Suspense>
  );
}

function CustomersPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [tier, setTier] = useState(searchParams.get('tier') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit') ?? '20') || 20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filters = useMemo(
    () => ({ page, limit, search: search || undefined, tier: tier || undefined }),
    [page, limit, search, tier]
  );

  const { data, isLoading, isError, error, refetch } = useCustomers(filters);
  const customers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  function syncUrl(next: { search?: string; tier?: string; page?: number; limit?: number }) {
    const s = next.search ?? search;
    const t = next.tier ?? tier;
    const p = next.page ?? page;
    const l = next.limit ?? limit;
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (t) params.set('tier', t);
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

  function handleTierChange(value: string) {
    const v = value === 'all' ? '' : value;
    setTier(v);
    setPage(1);
    syncUrl({ tier: v, page: 1 });
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
    setTier('');
    setPage(1);
    router.replace(pathname, { scroll: false });
  }

  function openCreate() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEdit(c: Customer) {
    setEditingCustomer(c);
    setFormOpen(true);
  }

  function handleFormSubmit(payload: CreateCustomerPayload | UpdateCustomerPayload) {
    if (editingCustomer) {
      updateMutation.mutate(
        { id: getCustomerId(editingCustomer), data: payload },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(payload as CreateCustomerPayload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(getCustomerId(deleteTarget), {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await customerService.exportCustomers();
      if (res.downloadUrl) {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
      } else if (res.data && res.data.length > 0) {
        exportToCSV(res.data, `customers-export-${new Date().toISOString().slice(0, 10)}`);
        toast.success('Customer export downloaded');
      } else {
        toast.error('The export returned no data.');
      }
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, 'Failed to export customers.'));
    } finally {
      setIsExporting(false);
    }
  }

  const isSubmittingForm = createMutation.isPending || updateMutation.isPending;
  const formSubmitError = formErrorMessage(createMutation.error ?? updateMutation.error);
  const hasActiveFilters = !!search || !!tier;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts, tiers and appointments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} loading={isExporting}>
            {!isExporting && <Download className="mr-2 h-4 w-4" aria-hidden="true" />}
            Export
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search customers…"
          defaultValue={search}
          onSearch={handleSearch}
          className="max-w-sm"
        />
        <Select value={tier || 'all'} onValueChange={handleTierChange}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by tier">
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            {CUSTOMER_TIERS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
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
                title="Unable to load customers"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : customers.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState
                  icon={Users}
                  title="No customers found"
                  description="Try changing your search or filters."
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No customers yet"
                  description="Add your first customer to get started."
                  action={{ label: 'Add Customer', onClick: openCreate }}
                />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="hidden sm:table-cell">Visits</TableHead>
                  <TableHead className="hidden md:table-cell">Balance</TableHead>
                  <TableHead className="hidden lg:table-cell">Next Appointment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => {
                  const id = getCustomerId(c);
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {c.name ? getInitials(c.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{c.name || 'Unnamed'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{c.email || '—'}</div>
                        <div className="text-xs text-muted-foreground">{c.phone || '—'}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{c.company || '—'}</div>
                        {c.designation && <div className="text-xs text-muted-foreground">{c.designation}</div>}
                      </TableCell>
                      <TableCell>
                        {c.tier ? (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              TIER_BADGE_CLASSES[c.tier] ?? 'bg-gray-100 text-gray-700 border-gray-300'
                            )}
                          >
                            {c.tier}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{c.visits ?? 0}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatCurrency(c.balance ?? 0)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(c.nextAppointment)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/customers/${id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(c)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(c)}>
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
          )}
        </CardContent>
      </Card>

      {!isLoading && !isError && customers.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
        isSubmitting={isSubmittingForm}
        submitError={formSubmitError}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Customer?"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? 'this customer'}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function CustomersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Customers</h1>
        <p className="text-muted-foreground">Manage customer accounts, tiers and appointments</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
