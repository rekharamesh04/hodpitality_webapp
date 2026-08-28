'use client';

import { useMemo, useState } from 'react';
import {
  Plus, MoreHorizontal, Eye, Pencil, Trash2, Building2, ShieldAlert, Mail, Phone, CalendarClock, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useResellers, useCreateReseller, useUpdateReseller, useDeleteReseller } from '@/hooks/useResellers';
import { useAuthStore } from '@/store';
import { getInitials, formatDate, isValidEmail, isValidPhone, getFriendlyErrorMessage } from '@/lib/utils';
import type { CreateResellerPayload, UpdateResellerPayload } from '@/services/reseller.service';
import type { Reseller } from '@/types';

function getResellerId(r: Reseller): string {
  return r.id ?? (r.PK ? r.PK.replace('RESELLER#', '') : '') ?? '';
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  status: string;
}
function emptyForm(): FormState {
  return { name: '', email: '', phone: '', status: '' };
}
function toFormState(r: Reseller): FormState {
  return { name: r.name ?? '', email: r.email ?? '', phone: r.phone ?? '', status: r.status ?? '' };
}
type FieldErrors = Partial<Record<'name' | 'email' | 'phone', string>>;
function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (form.email.trim() && !isValidEmail(form.email.trim())) errors.email = 'Enter a valid email address';
  if (form.phone.trim() && !isValidPhone(form.phone.trim())) errors.phone = 'Enter a valid phone number';
  return errors;
}

export default function ResellersPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Resellers</h1>
          <p className="text-muted-foreground">Manage your reseller partners and their platform access.</p>
        </div>
        <ErrorState
          title="Access denied"
          message="Reseller management is restricted to super admins. Contact your platform administrator if you believe this is a mistake."
        />
      </div>
    );
  }

  return <ResellersPageInner />;
}

function ResellersPageInner() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reseller | null>(null);
  const [viewing, setViewing] = useState<Reseller | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reseller | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { data: resellers, isLoading, isError, error, refetch } = useResellers();
  const createMutation = useCreateReseller();
  const updateMutation = useUpdateReseller();
  const deleteMutation = useDeleteReseller();

  const allResellers = useMemo(() => resellers ?? [], [resellers]);
  const hasStatusData = useMemo(() => allResellers.some((r) => !!r.status), [allResellers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allResellers;
    return allResellers.filter((r) =>
      r.name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.phone?.toLowerCase().includes(q)
    );
  }, [allResellers, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageItems = filtered.slice((page - 1) * limit, page * limit);

  function handleSearch(value: string) { setSearch(value); setPage(1); }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setFieldErrors({});
    setFormOpen(true);
  }
  function openEdit(r: Reseller) {
    setEditing(r);
    setForm(toFormState(r));
    setFieldErrors({});
    setFormOpen(true);
  }
  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key as keyof FieldErrors]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (createMutation.isPending || updateMutation.isPending) return;
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (editing) {
      const payload: UpdateResellerPayload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        status: (form.status || undefined) as Reseller['status'],
      };
      updateMutation.mutate({ id: getResellerId(editing), data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      const payload: CreateResellerPayload = { name: form.name.trim() };
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(getResellerId(deleteTarget), { onSuccess: () => setDeleteTarget(null) });
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error ?? updateMutation.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Resellers</h1>
          <p className="text-muted-foreground">Manage your reseller partners and their platform access.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Reseller
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Resellers</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{isLoading ? '—' : total}</p>
          </CardContent>
        </Card>
        {hasStatusData && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Active</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {isLoading ? '—' : allResellers.filter((r) => r.status === 'active').length}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <SearchInput placeholder="Search resellers…" onSearch={handleSearch} className="max-w-sm" />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton rows={6} /></div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState title="Unable to load resellers" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              {search ? (
                <EmptyState icon={Building2} title="No resellers found" description="Try a different search term." />
              ) : (
                <EmptyState
                  icon={Building2}
                  title="No reseller partners yet"
                  description="Add your first reseller to get started."
                  action={{ label: 'Add Reseller', onClick: openCreate }}
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reseller</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    {hasStatusData && <TableHead>Status</TableHead>}
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((r) => {
                    const id = getResellerId(r);
                    return (
                      <TableRow key={id} className="cursor-pointer" onClick={() => setViewing(r)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {r.name ? getInitials(r.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-semibold truncate max-w-[200px]">{r.name || 'Unnamed'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm truncate max-w-[200px]">{r.email || '—'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm whitespace-nowrap">{r.phone || '—'}</TableCell>
                        {hasStatusData && (
                          <TableCell className="whitespace-nowrap"><StatusBadge status={r.status} /></TableCell>
                        )}
                        <TableCell className="hidden md:table-cell whitespace-nowrap text-sm text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                        <TableCell className="text-right" onClick={(evt) => evt.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.name}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setViewing(r)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(r)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(r)}>
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

      {/* Create / Edit */}
      <Dialog open={formOpen} onOpenChange={(v) => !isSubmitting && setFormOpen(v)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Reseller' : 'Add Reseller'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this reseller’s details.' : 'Adds a reseller and, if an email is supplied, sends a platform-access invite.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 py-2">
              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{getFriendlyErrorMessage(submitError, 'Unable to save reseller.')}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="reseller-name">Name *</Label>
                <Input
                  id="reseller-name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Global Events Partners"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'reseller-name-error' : undefined}
                />
                {fieldErrors.name && <p id="reseller-name-error" className="text-xs text-destructive">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reseller-email">Email</Label>
                <Input
                  id="reseller-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="contact@reseller.example"
                  disabled={!!editing}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'reseller-email-error' : 'reseller-email-hint'}
                />
                {fieldErrors.email && <p id="reseller-email-error" className="text-xs text-destructive">{fieldErrors.email}</p>}
                {editing && !fieldErrors.email && (
                  <p id="reseller-email-hint" className="text-xs text-muted-foreground">Email is tied to their account and can’t be changed here.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reseller-phone">Phone</Label>
                <Input
                  id="reseller-phone"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'reseller-phone-error' : undefined}
                />
                {fieldErrors.phone && <p id="reseller-phone-error" className="text-xs text-destructive">{fieldErrors.phone}</p>}
              </div>
              {editing && (
                <div className="space-y-1.5">
                  <Label htmlFor="reseller-status">Status</Label>
                  <Select value={form.status || undefined} onValueChange={(v) => updateField('status', v)}>
                    <SelectTrigger id="reseller-status"><SelectValue placeholder="Backend default" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>
                {isSubmitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Reseller'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View details */}
      <Sheet open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{viewing?.name}</SheetTitle>
            <SheetDescription>Reseller details</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="mt-6 space-y-5">
              <DetailRow icon={Mail} label="Email" value={viewing.email} />
              <DetailRow icon={Phone} label="Phone" value={viewing.phone} />
              {viewing.status && <DetailRow icon={ShieldAlert} label="Status" value={viewing.status} capitalize />}
              <DetailRow icon={CalendarClock} label="Created" value={formatDate(viewing.createdAt)} />
              <DetailRow icon={Hash} label="Reseller ID" value={getResellerId(viewing)} mono />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Reseller?"
        description="Are you sure you want to delete this reseller? This action may affect the reseller's tenant relationships."
        confirmLabel="Delete"
        confirmingLabel="Deleting…"
        destructive
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function DetailRow({
  icon: Icon, label, value, mono, capitalize,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium break-words ${mono ? 'font-mono text-xs' : ''} ${capitalize ? 'capitalize' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
