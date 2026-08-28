'use client';

import { useMemo, useState } from 'react';
import {
  Plus, MoreHorizontal, Eye, Pencil, Trash2, Briefcase, UserPlus, Mail, Building2, CalendarClock, Hash, Fingerprint,
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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { useResellers } from '@/hooks/useResellers';
import { useCreateStaff } from '@/hooks/useStaff';
import { useAuthStore } from '@/store';
import { getInitials, formatDate, isValidEmail, getFriendlyErrorMessage } from '@/lib/utils';
import type { CreateCompanyPayload, UpdateCompanyPayload } from '@/services/company.service';
import type { Company } from '@/types';

function getCompanyId(c: Company): string {
  return c.id ?? (c.PK ? c.PK.replace('COMPANY#', '') : '') ?? '';
}

interface FormState {
  name: string;
  email: string;
  resellerId: string;
}
function emptyForm(): FormState {
  return { name: '', email: '', resellerId: '' };
}
function toFormState(c: Company): FormState {
  return { name: c.name ?? '', email: c.email ?? '', resellerId: c.reseller_id ?? '' };
}
type FieldErrors = Partial<Record<'name' | 'email', string>>;
function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Company name is required';
  if (form.email.trim() && !isValidEmail(form.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}

export default function CompaniesPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isResellerAdmin = role === 'reseller_admin' || role === 'reseller';
  const isCompanyAdmin = role === 'company_admin';
  const canView = isSuperAdmin || isResellerAdmin || isCompanyAdmin;

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Companies</h1>
          <p className="text-muted-foreground">Manage organizations and tenant accounts.</p>
        </div>
        <ErrorState
          title="Access denied"
          message="Company management is restricted to super admins, reseller admins, and company admins. Contact your platform administrator if you believe this is a mistake."
        />
      </div>
    );
  }

  return <CompaniesPageInner isSuperAdmin={isSuperAdmin} isResellerAdmin={isResellerAdmin} isCompanyAdmin={isCompanyAdmin} />;
}

function CompaniesPageInner({
  isSuperAdmin, isResellerAdmin, isCompanyAdmin,
}: { isSuperAdmin: boolean; isResellerAdmin: boolean; isCompanyAdmin: boolean }) {
  const canCreate = isSuperAdmin || isResellerAdmin;
  const canDelete = isSuperAdmin || isResellerAdmin;
  const canInviteAdmin = isSuperAdmin || isResellerAdmin;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [viewing, setViewing] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCompany, setInviteCompany] = useState<Company | null>(null);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });

  const { data: companies, isLoading, isError, error, refetch } = useCompanies();
  // Only super_admin can call GET /resellers — used to (a) resolve reseller_id → name for the
  // table/detail view and (b) populate the "assign to reseller" dropdown on create. One request,
  // not one per company.
  const { data: resellersData } = useResellers({ enabled: isSuperAdmin });
  const resellerNameById = useMemo(() => {
    const map = new Map<string, string>();
    (resellersData ?? []).forEach((r) => map.set(r.id ?? r.PK?.replace('RESELLER#', '') ?? '', r.name));
    return map;
  }, [resellersData]);

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const deleteMutation = useDeleteCompany();
  const inviteStaff = useCreateStaff();

  const allCompanies = useMemo(() => companies ?? [], [companies]);
  const hasStatusData = useMemo(() => allCompanies.some((c) => !!c.status), [allCompanies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCompanies;
    return allCompanies.filter((c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }, [allCompanies, search]);

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
  function openEdit(c: Company) {
    setEditing(c);
    setForm(toFormState(c));
    setFieldErrors({});
    setFormOpen(true);
  }
  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in fieldErrors) setFieldErrors((e) => ({ ...e, [key]: undefined }) as FieldErrors);
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
      const payload: UpdateCompanyPayload = { name: form.name.trim(), email: form.email.trim() || undefined };
      updateMutation.mutate({ id: getCompanyId(editing), data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      const payload: CreateCompanyPayload = { name: form.name.trim() };
      if (form.email.trim()) payload.email = form.email.trim();
      if (isSuperAdmin && form.resellerId) payload.reseller_id = form.resellerId;
      createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(getCompanyId(deleteTarget), { onSuccess: () => setDeleteTarget(null) });
  }

  function openInvite(c: Company) {
    setInviteCompany(c);
    setInviteForm({ name: '', email: '' });
    setInviteOpen(true);
  }
  function handleInviteSubmit() {
    if (!inviteCompany) return;
    inviteStaff.mutate(
      {
        name: inviteForm.name,
        email: inviteForm.email,
        role: 'company_admin',
        tenant_id: inviteCompany.tenant_id ?? getCompanyId(inviteCompany),
      },
      { onSuccess: () => setInviteOpen(false) }
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const submitError = createMutation.error ?? updateMutation.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Companies</h1>
          <p className="text-muted-foreground">Manage organizations and tenant accounts.</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Company
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:max-w-md">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Companies</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{isLoading ? '—' : total}</p>
          </CardContent>
        </Card>
        {hasStatusData && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Active</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {isLoading ? '—' : allCompanies.filter((c) => c.status === 'active').length}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <SearchInput placeholder="Search companies…" onSearch={handleSearch} className="max-w-sm" />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton rows={6} /></div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState title="Unable to load companies" message={getFriendlyErrorMessage(error)} onRetry={() => refetch()} />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="p-6">
              {search ? (
                <EmptyState icon={Briefcase} title="No companies found" description="Try a different search term." />
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No companies yet"
                  description="Create your first company to get started."
                  action={canCreate ? { label: 'Add Company', onClick: openCreate } : undefined}
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    {isSuperAdmin && <TableHead className="hidden md:table-cell">Reseller</TableHead>}
                    {hasStatusData && <TableHead>Status</TableHead>}
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((c) => {
                    const id = getCompanyId(c);
                    const resellerName = c.reseller_id ? resellerNameById.get(c.reseller_id) ?? c.reseller_id : '—';
                    return (
                      <TableRow key={id} className="cursor-pointer" onClick={() => setViewing(c)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {c.name ? getInitials(c.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-semibold truncate max-w-[200px]">{c.name || 'Unnamed'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm truncate max-w-[200px]">{c.email || '—'}</TableCell>
                        {isSuperAdmin && (
                          <TableCell className="hidden md:table-cell text-sm truncate max-w-[160px]">{resellerName}</TableCell>
                        )}
                        {hasStatusData && (
                          <TableCell className="whitespace-nowrap"><StatusBadge status={c.status} /></TableCell>
                        )}
                        <TableCell className="hidden md:table-cell whitespace-nowrap text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                        <TableCell className="text-right" onClick={(evt) => evt.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${c.name}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setViewing(c)}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(c)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              {canInviteAdmin && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => openInvite(c)}>
                                  <UserPlus className="mr-2 h-4 w-4" /> Invite Admin
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => setDeleteTarget(c)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </>
                              )}
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
            <DialogTitle>{editing ? 'Edit Company' : 'Add Company'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update this company’s details.' : 'Adds a company and, if an email is supplied, sends an admin invite.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 py-2">
              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{getFriendlyErrorMessage(submitError, 'Unable to save company.')}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="company-name">Company Name *</Label>
                <Input
                  id="company-name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Acme Hospitality"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'company-name-error' : undefined}
                />
                {fieldErrors.name && <p id="company-name-error" className="text-xs text-destructive">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-email">Company Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="admin@company.example"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'company-email-error' : 'company-email-hint'}
                />
                {fieldErrors.email && <p id="company-email-error" className="text-xs text-destructive">{fieldErrors.email}</p>}
                {!editing && !fieldErrors.email && (
                  <p id="company-email-hint" className="text-xs text-muted-foreground">Sends a company admin invite to this address.</p>
                )}
              </div>
              {!editing && isSuperAdmin && (
                <div className="space-y-1.5">
                  <Label htmlFor="company-reseller">Assign to Reseller</Label>
                  <Select value={form.resellerId || undefined} onValueChange={(v) => updateField('resellerId', v)}>
                    <SelectTrigger id="company-reseller"><SelectValue placeholder="Unassigned (optional)" /></SelectTrigger>
                    <SelectContent>
                      {(resellersData ?? []).map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>
                {isSubmitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Company'}
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
            <SheetDescription>Company details</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="mt-6 space-y-5">
              <DetailRow icon={Mail} label="Email" value={viewing.email} />
              {isSuperAdmin && (
                <DetailRow
                  icon={Building2}
                  label="Reseller"
                  value={viewing.reseller_id ? resellerNameById.get(viewing.reseller_id) ?? viewing.reseller_id : undefined}
                />
              )}
              {viewing.status && <DetailRow icon={Briefcase} label="Status" value={viewing.status} capitalize />}
              <DetailRow icon={CalendarClock} label="Created" value={formatDate(viewing.createdAt)} />

              <Separator />
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Technical Details</p>
                <div className="space-y-3">
                  <DetailRow icon={Hash} label="Company ID" value={getCompanyId(viewing)} mono />
                  <DetailRow icon={Fingerprint} label="Tenant ID" value={viewing.tenant_id} mono />
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Invite Admin */}
      <Dialog open={inviteOpen} onOpenChange={(v) => !inviteStaff.isPending && setInviteOpen(v)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Invite Admin</DialogTitle>
            <DialogDescription>Send a company admin invite for {inviteCompany?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-name">Name</Label>
              <Input
                id="invite-name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@hospital.example"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Role: <span className="font-medium text-foreground">Company Admin</span> · Tenant:{' '}
              <span className="font-mono text-foreground">{inviteCompany?.tenant_id ?? (inviteCompany ? getCompanyId(inviteCompany) : '')}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviteStaff.isPending}>Cancel</Button>
            <Button
              onClick={handleInviteSubmit}
              loading={inviteStaff.isPending}
              disabled={!inviteForm.name.trim() || !isValidEmail(inviteForm.email.trim())}
            >
              {inviteStaff.isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete Company?"
        description="Are you sure you want to delete this company? This action cannot be undone."
        confirmLabel="Delete Company"
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
