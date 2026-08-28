'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Plus, MoreHorizontal, Eye, Pencil, Trash2, UserCog, Clock, CalendarDays,
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
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StaffFormDialog } from '@/components/dialogs/StaffFormDialog';
import { StaffScheduleDialog } from '@/components/dialogs/StaffScheduleDialog';
import {
  useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useUpdateStaffSchedule,
} from '@/hooks/useStaff';
import { cn, getInitials, getFriendlyErrorMessage } from '@/lib/utils';
import type { CreateStaffPayload, UpdateStaffPayload } from '@/services/staff.service';
import type { Staff } from '@/types';

function getStaffId(s: Staff): string {
  return s.id ?? (s.PK ? s.PK.replace('STAFF#', '') : '') ?? '';
}
function formErrorMessage(err: unknown): string | null {
  if (!err) return null;
  const backendMsg = (err as { backendMessage?: string } | undefined)?.backendMessage;
  return backendMsg || getFriendlyErrorMessage(err, 'Unable to save staff member.');
}

export default function StaffPage() {
  return (
    <Suspense fallback={<StaffPageSkeleton />}>
      <StaffPageInner />
    </Suspense>
  );
}

function StaffPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [department, setDepartment] = useState(searchParams.get('department') ?? '');
  const [role, setRole] = useState(searchParams.get('role') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit') ?? '20') || 20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<Staff | null>(null);

  // search/status are confirmed server-supported (the same generic list-filtering helper the
  // backend uses for check-ins/venues/events). department/role aren't confirmed, so they're
  // applied client-side over this fetched set — which also keeps their dropdown options stable.
  const { data: staffData, isLoading, isError, error, refetch } = useStaff({ search: search || undefined, status: status || undefined });

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();
  const scheduleMutation = useUpdateStaffSchedule();

  const allStaff = useMemo(() => staffData ?? [], [staffData]);

  const departmentOptions = useMemo(
    () => Array.from(new Set(allStaff.map((s) => s.department).filter((d): d is string => !!d))),
    [allStaff]
  );
  const roleOptions = useMemo(
    () => Array.from(new Set(allStaff.map((s) => s.role).filter((r): r is string => !!r && typeof r === 'string'))) as string[],
    [allStaff]
  );

  const filtered = useMemo(() => {
    return allStaff.filter((s) => {
      if (department && s.department !== department) return false;
      if (role && s.role !== role) return false;
      return true;
    });
  }, [allStaff, department, role]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  function syncUrl(next: { search?: string; status?: string; department?: string; role?: string; page?: number; limit?: number }) {
    const s = next.search ?? search;
    const st = next.status ?? status;
    const dep = next.department ?? department;
    const rl = next.role ?? role;
    const p = next.page ?? page;
    const l = next.limit ?? limit;
    const params = new URLSearchParams();
    if (s) params.set('search', s);
    if (st) params.set('status', st);
    if (dep) params.set('department', dep);
    if (rl) params.set('role', rl);
    if (p > 1) params.set('page', String(p));
    if (l !== 20) params.set('limit', String(l));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearch(value: string) { setSearch(value); setPage(1); syncUrl({ search: value, page: 1 }); }
  function handleStatusChange(value: string) { const v = value === 'all' ? '' : value; setStatus(v); setPage(1); syncUrl({ status: v, page: 1 }); }
  function handleDepartmentChange(value: string) { const v = value === 'all' ? '' : value; setDepartment(v); setPage(1); syncUrl({ department: v, page: 1 }); }
  function handleRoleChange(value: string) { const v = value === 'all' ? '' : value; setRole(v); setPage(1); syncUrl({ role: v, page: 1 }); }
  function handlePageChange(p: number) { setPage(p); syncUrl({ page: p }); }
  function handlePageSizeChange(l: number) { setLimit(l); setPage(1); syncUrl({ limit: l, page: 1 }); }
  function clearFilters() {
    setSearch(''); setStatus(''); setDepartment(''); setRole(''); setPage(1);
    router.replace(pathname, { scroll: false });
  }

  function openCreate() { setEditingStaff(null); setFormOpen(true); }
  function openEdit(s: Staff) { setEditingStaff(s); setFormOpen(true); }

  function handleFormSubmit(payload: CreateStaffPayload | UpdateStaffPayload) {
    if (editingStaff) {
      updateMutation.mutate({ id: getStaffId(editingStaff), data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate(payload as CreateStaffPayload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(getStaffId(deleteTarget), { onSuccess: () => setDeleteTarget(null) });
  }

  function handleScheduleSubmit(schedule: Record<string, string>) {
    if (!scheduleTarget) return;
    scheduleMutation.mutate(
      { id: getStaffId(scheduleTarget), schedule },
      { onSuccess: () => setScheduleTarget(null) }
    );
  }

  const isSubmittingForm = createMutation.isPending || updateMutation.isPending;
  const formSubmitError = formErrorMessage(createMutation.error ?? updateMutation.error);
  const hasActiveFilters = !!search || !!status || !!department || !!role;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Staff</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Staff
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          placeholder="Search staff…"
          defaultValue={search}
          onSearch={handleSearch}
          className="max-w-sm"
        />
        <Select value={department || 'all'} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-full sm:w-[170px]" aria-label="Filter by department">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departmentOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={role || 'all'} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by role">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roleOptions.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
                title="Unable to load staff"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState
                  icon={UserCog}
                  title="No staff members found"
                  description="Try changing your search or filters."
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <EmptyState
                  icon={UserCog}
                  title="No staff members yet"
                  description="Add your first staff member to get started."
                  action={{ label: 'Add Staff', onClick: openCreate }}
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead className="hidden sm:table-cell">Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Department</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((s) => {
                    const id = getStaffId(s);
                    return (
                      <TableRow key={id} className="cursor-pointer" onClick={() => router.push(`/staff/${id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={s.avatar} alt={s.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {s.name ? getInitials(s.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-semibold truncate max-w-[180px]">{s.name || 'Unnamed'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-sm truncate max-w-[180px]">{s.email || '—'}</p>
                          <p className="text-xs text-muted-foreground">{s.phone || '—'}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell whitespace-nowrap text-sm">{s.department || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell whitespace-nowrap text-sm capitalize">{typeof s.role === 'string' ? s.role : '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <StatusBadge status={s.status} className="whitespace-nowrap" />
                        </TableCell>
                        <TableCell className="text-right" onClick={(evt) => evt.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${s.name}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/staff/${id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(s)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setScheduleTarget(s)}>
                                <Clock className="mr-2 h-4 w-4" /> Set Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/calendar')}>
                                <CalendarDays className="mr-2 h-4 w-4" /> View Calendar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(s)}>
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

      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        staff={editingStaff}
        isSubmitting={isSubmittingForm}
        submitError={formSubmitError}
        roleOptions={roleOptions}
        departmentOptions={departmentOptions}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Staff Member?"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? 'this staff member'}? This action cannot be undone.`}
        confirmLabel="Delete Staff"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />

      <StaffScheduleDialog
        open={!!scheduleTarget}
        onOpenChange={(v) => !v && setScheduleTarget(null)}
        staff={scheduleTarget}
        isSubmitting={scheduleMutation.isPending}
        onSubmit={handleScheduleSubmit}
      />
    </div>
  );
}

function StaffPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Staff</h1>
        <p className="text-muted-foreground">Manage your team members</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TableSkeleton rows={8} />
        </CardContent>
      </Card>
    </div>
  );
}
