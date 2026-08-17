'use client';

import { useState } from 'react';
import { Briefcase, Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '@/hooks/useCompanies';
import { useCreateStaff } from '@/hooks/useStaff';
import { useAuthStore } from '@/store';
import type { Company } from '@/types';

// Hardcoded resellers — replace with useResellers() hook when API is ready
const MOCK_RESELLERS = [
  { id: 'reseller-1', name: 'Alex Fernandez (Reseller 1)' },
  { id: 'reseller-2', name: 'Nina Walsh (Reseller 2)' },
];

export default function CompaniesPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';
  const canInviteAdmin = user?.role === 'super_admin' || user?.role === 'reseller_admin';

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState({ name: '', email: '', resellerId: '' });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCompany, setInviteCompany] = useState<Company | null>(null);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });

  const { data: companies = [], isLoading, error } = useCompanies({ search });

  const create = useCreateCompany();
  const update = useUpdateCompany();
  const remove = useDeleteCompany();
  const inviteStaff = useCreateStaff();

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
        tenant_id: inviteCompany.id,
      },
      { onSuccess: () => setInviteOpen(false) }
    );
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', resellerId: '' });
    setDialogOpen(true);
  }

  function openEdit(c: Company) {
    setEditing(c);
    setForm({ name: c.name, email: c.email ?? '', resellerId: c.resellerId ?? '' });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload = isSuperAdmin
      ? { name: form.name, email: form.email, resellerId: form.resellerId || undefined }
      : { name: form.name, email: form.email };

    if (editing) {
      update.mutate({ id: editing.id, data: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Manage company tenants</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <strong>Access denied:</strong> The backend returned an error — please log out and log back in with your super admin account. If the issue persists, contact the backend team to verify the <code>custom:role</code> Cognito attribute.
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter((c) => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Search companies…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <p className="col-span-3 text-muted-foreground">Loading companies…</p>
        )}
        {!isLoading && companies.length === 0 && (
          <p className="col-span-3 text-muted-foreground">No companies found.</p>
        )}
        {companies.map((c) => (
          <Card key={c.id ?? c.PK} className="card-hover">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <CardDescription className="text-xs">{c.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize font-medium">{c.status ?? 'active'}</span>
              </div>
              {c.resellerId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reseller ID</span>
                  <span className="font-medium truncate max-w-[140px]">{c.resellerId}</span>
                </div>
              )}
              <div className="flex flex-col gap-2 pt-1">
                {canInviteAdmin && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => openInvite(c)}
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Invite Admin
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => remove.mutate(c.id ?? c.PK?.replace('COMPANY#', ''))}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Company' : 'Add Company'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="company@example.com"
              />
            </div>
            {/* Super Admin only: assign company to a reseller */}
            {isSuperAdmin && (
              <div className="space-y-1">
                <Label htmlFor="reseller">Assign to Reseller</Label>
                <Select
                  value={form.resellerId}
                  onValueChange={(val) => setForm((f) => ({ ...f, resellerId: val }))}
                >
                  <SelectTrigger id="reseller">
                    <SelectValue placeholder="Select a reseller (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_RESELLERS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.name}>
              {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Admin Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Admin — {inviteCompany?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="invite-name">Name</Label>
              <Input
                id="invite-name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@hospital.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Role: <span className="font-medium">Company Admin</span> · Tenant:{' '}
              <span className="font-medium">{inviteCompany?.id}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInviteSubmit}
              disabled={inviteStaff.isPending || !inviteForm.name || !inviteForm.email}
            >
              {inviteStaff.isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
