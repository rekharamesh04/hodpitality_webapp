'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import { useGuests } from '@/hooks/use-guests';
import apiClient from '@/lib/axios';
import type { Customer, MembershipTier, Registration } from '@/types';
import NewAppointmentDialog from '@/components/dialogs/NewAppointmentDialog';
import { CompleteRegistrationDialog } from '@/components/dialogs/CompleteRegistrationDialog';

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
type Tab = 'customers' | 'registrations';

export default function CustomersPage() {
  const router = useRouter();
  const { data: guestsData } = useGuests();
  const { data: registrationsData } = useQuery<Registration[]>({
    queryKey: ['registrations'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Registration[] }>('/registrations?limit=100');
      return res.data?.data ?? [];
    },
  });
  const registrations = registrationsData ?? [];
  const [tab, setTab] = useState<Tab>('customers');

  // customers state
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<MembershipTier | 'All'>('All');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookTarget, setBookTarget] = useState<Customer | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // registrations state
  const [regOpen, setRegOpen] = useState(false);

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
          <p className="text-sm text-muted-foreground">Harbor Street</p>
        </div>
        {tab === 'customers' ? (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add customer
          </Button>
        ) : (
          <Button size="sm" onClick={() => setRegOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New registration
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['customers', 'registrations'] as Tab[]).map((t) => (
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

      {/* ── Customers tab ── */}
      {tab === 'customers' && (
        <>
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

          <p className="text-xs text-muted-foreground">{filtered.length} of {customers.length} customers</p>

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
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">No customers found.</TableCell>
                  </TableRow>
                )}
                {filtered.map((customer) => (
                  <TableRow key={customer.id}>
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
                    <TableCell className="hidden sm:table-cell">
                      <p className="text-sm truncate max-w-[160px]">{customer.email}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border', TIER_BADGE[customer.tier])}>
                        {customer.tier}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium hidden sm:table-cell">{customer.visits}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{customer.lastVisit ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{customer.nextAppointment ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setBookTarget(customer)}>
                          <CalendarPlus className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Book</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => router.push(`/guests/${customer.id}`)}>
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
        </>
      )}

      {/* ── Registrations tab ── */}
      {tab === 'registrations' && (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Total', value: '1,400' },
              { label: 'Confirmed', value: '1,247' },
              { label: 'Pending', value: '153' },
              { label: 'Revenue', value: '$487K' },
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
                  <TableHead className="hidden sm:table-cell">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
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
                    <TableCell className="hidden sm:table-cell">{reg.amount && formatCurrency(reg.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* ── Dialogs ── */}
      <CompleteRegistrationDialog open={regOpen} onOpenChange={setRegOpen} />

      {bookTarget && (
        <NewAppointmentDialog
          open={!!bookTarget}
          onClose={() => setBookTarget(null)}
          onBook={(appt) => {
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
