'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn, formatDate } from '@/lib/utils';
import {
  useGuests, useCreateGuest, useUpdateGuest, useDeleteGuest,
} from '@/hooks/use-guests';
import { guestService } from '@/services/guest.service';
import apiClient from '@/lib/axios';
import type { Guest, Registration } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  VIP:      'bg-amber-100 text-amber-800 border-amber-300',
  Speaker:  'bg-purple-100 text-purple-800 border-purple-300',
  Delegate: 'bg-blue-100 text-blue-800 border-blue-300',
  Staff:    'bg-gray-100 text-gray-700 border-gray-300',
  Press:    'bg-green-100 text-green-800 border-green-300',
  regular:  'bg-gray-100 text-gray-700 border-gray-300',
  standard: 'bg-gray-100 text-gray-700 border-gray-300',
};

type Tab = 'guests' | 'registrations';

export default function GuestsPage() {
  const [tab, setTab] = useState<Tab>('guests');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; phone: string; category: Guest['category'] }>({ name: '', email: '', phone: '', category: 'regular' });
  const [exporting, setExporting] = useState(false);

  const { data: guestsData, isLoading } = useGuests({ search });
  const guests = guestsData?.data ?? [];

  const { data: registrationsData } = useQuery<Registration[]>({
    queryKey: ['registrations'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Registration[] }>('/registrations?limit=100');
      return res.data?.data ?? [];
    },
  });
  const registrations = registrationsData ?? [];

  const create = useCreateGuest();
  const update = useUpdateGuest();
  const remove = useDeleteGuest();

  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', category: 'regular' });
    setDialogOpen(true);
  }

  function openEdit(g: Guest) {
    setEditing(g);
    setForm({ name: g.name, email: g.email, phone: g.phone ?? '', category: g.category ?? 'regular' });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const guestId = editing?.id ?? editing?.PK?.replace('GUEST#', '');
    if (editing && guestId) {
      update.mutate({ id: guestId, data: form }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(form, { onSuccess: () => setDialogOpen(false) });
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await guestService.exportGuests();
      if ((res as any).downloadUrl) window.open((res as any).downloadUrl, '_blank');
    } finally {
      setExporting(false);
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Guests</h1>
          <p className="text-sm text-muted-foreground">CRM — guest management</p>
        </div>
        {tab === 'guests' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Guest
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['guests', 'registrations'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Guests tab ── */}
      {tab === 'guests' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">{guests.length} guests</p>
          </div>

          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Checked In</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      Loading guests…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && guests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No guests found.
                    </TableCell>
                  </TableRow>
                )}
                {guests.map((g) => {
                  const gId = g.id ?? g.PK?.replace('GUEST#', '') ?? '';
                  return (
                    <TableRow key={gId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {g.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{g.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {g.createdAt ? formatDate(g.createdAt) : ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm truncate max-w-[160px]">{g.email}</p>
                        <p className="text-xs text-muted-foreground">{g.phone}</p>
                      </TableCell>
                      <TableCell>
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', CATEGORY_COLORS[g.category] ?? CATEGORY_COLORS.regular)}>
                          {g.category}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={g.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={g.checkedIn ? 'default' : 'outline'}>
                          {g.checkedIn ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(g)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive"
                            onClick={() => remove.mutate(gId)}
                            disabled={remove.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ── Registrations tab ── */}
      {tab === 'registrations' && (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Total',     value: registrations.length },
              { label: 'Confirmed', value: registrations.filter((r) => r.status === 'confirmed').length },
              { label: 'Pending',   value: registrations.filter((r) => r.status === 'pending').length },
              { label: 'Paid',      value: registrations.filter((r) => r.paymentStatus === 'paid').length },
            ].map((s) => (
              <div key={s.label} className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No registrations found.</TableCell>
                  </TableRow>
                )}
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <div className="font-medium">{reg.guestName}</div>
                      <div className="text-xs text-muted-foreground">{reg.guestEmail}</div>
                    </TableCell>
                    <TableCell className="text-sm">{reg.event}</TableCell>
                    <TableCell><Badge variant="outline">{reg.category}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{formatDate(reg.registrationDate)}</TableCell>
                    <TableCell><StatusBadge status={reg.status} /></TableCell>
                    <TableCell>
                      <Badge variant={reg.paymentStatus === 'paid' ? 'default' : 'secondary'}>{reg.paymentStatus}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Create / Edit Guest Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Guest' : 'Add Guest'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof f.category }))}
              >
                {['regular', 'VIP', 'Speaker', 'Delegate', 'Staff', 'Press'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.name}>
              {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Guest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Add Customer Dialog ────────────────────────────────────────────────────

