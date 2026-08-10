'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { mockCustomers } from '@/constants/mock-data';
import type { Customer, MembershipTier } from '@/types';
import NewAppointmentDialog from '@/components/dialogs/NewAppointmentDialog';

const TIER_TABS: { key: MembershipTier | 'All'; label: string }[] = [
  { key: 'All',       label: 'All' },
  { key: 'Founding',  label: 'Founding' },
  { key: 'Signature', label: 'Signature' },
  { key: 'Standard',  label: 'Standard' },
];

const TIER_BADGE: Record<MembershipTier, string> = {
  Founding:  'bg-amber-100 text-amber-800 border-amber-300',
  Signature: 'bg-purple-100 text-purple-800 border-purple-300',
  Standard:  'bg-gray-100 text-gray-700 border-gray-300',
};

const TODAY = '2026-08-06';

export default function CustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<MembershipTier | 'All'>('All');
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [bookTarget, setBookTarget] = useState<Customer | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesTier = tierFilter === 'All' || c.tier === tierFilter;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      return matchesTier && matchesSearch;
    });
  }, [customers, tierFilter, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Harbor Street · {filtered.length} of {customers.length} customers
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add customer
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tier filter tabs */}
        <div className="flex gap-1 border rounded-md overflow-x-auto scrollbar-none shrink-0">
          {TIER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTierFilter(t.key as MembershipTier | 'All')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                tierFilter === t.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden sm:table-cell">Contact</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Visits</TableHead>
              <TableHead className="hidden lg:table-cell">Last visit</TableHead>
              <TableHead className="hidden lg:table-cell">Next appointment</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((customer) => (
              <TableRow key={customer.id}>
                {/* Customer */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {customer.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">Since {customer.memberSince}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Contact */}
                <TableCell className="hidden sm:table-cell">
                  <p className="text-sm truncate max-w-[160px]">{customer.email}</p>
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                </TableCell>

                {/* Tier */}
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                      TIER_BADGE[customer.tier]
                    )}
                  >
                    {customer.tier}
                  </span>
                </TableCell>

                {/* Visits */}
                <TableCell className="text-center text-sm font-medium hidden sm:table-cell">{customer.visits}</TableCell>

                {/* Last visit */}
                <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                  {customer.lastVisit ?? '—'}
                </TableCell>

                {/* Next appointment */}
                <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                  {customer.nextAppointment ?? '—'}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      onClick={() => setBookTarget(customer)}
                    >
                      <CalendarPlus className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Book</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2"
                      onClick={() => router.push(`/guests/${customer.id}`)}
                    >
                      <span className="hidden sm:inline">Profile</span>
                      <span className="sm:hidden">→</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* New appointment dialog triggered from Book button */}
      {bookTarget && (
        <NewAppointmentDialog
          open={!!bookTarget}
          onClose={() => setBookTarget(null)}
          onBook={(appt) => {
            // update nextAppointment display on customer row
            setCustomers((prev) =>
              prev.map((c) =>
                c.id === bookTarget.id
                  ? { ...c, nextAppointment: `${appt.date} ${appt.startTime}`, upcomingCount: c.upcomingCount + 1 }
                  : c
              )
            );
          }}
          defaultDate={TODAY}
          preselectedCustomerId={bookTarget.id}
        />
      )}

      {/* Add customer dialog (simple inline form) */}
      {addOpen && (
        <AddCustomerDialog
          onClose={() => setAddOpen(false)}
          onAdd={(c) => setCustomers((prev) => [...prev, c])}
        />
      )}
    </div>
  );
}

// ─── Add Customer Dialog ────────────────────────────────────────────────────

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

function AddCustomerDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (c: Customer) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<MembershipTier>('Standard');

  function handleSubmit() {
    if (!name.trim()) return;
    const initials = name
      .split(' ')
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2);
    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: name.trim(),
      initials,
      email,
      phone,
      preferredContact: 'SMS',
      preferences: '',
      homeLocation: 'Harbor Street',
      balance: 0,
      tier,
      memberSince: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      visits: 0,
      upcomingCount: 0,
      missedVisits: 0,
      notes: '',
      customerId: `C${Date.now()}-L1`,
    };
    onAdd(newCustomer);
    onClose();
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(415) 555-0000" />
          </div>
          <div className="space-y-1">
            <Label>Tier</Label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              value={tier}
              onChange={(e) => setTier(e.target.value as MembershipTier)}
            >
              <option value="Standard">Standard</option>
              <option value="Signature">Signature</option>
              <option value="Founding">Founding</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Add customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
