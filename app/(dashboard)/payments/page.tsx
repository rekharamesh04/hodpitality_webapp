'use client';

import { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard, TrendingUp, Clock, RefreshCw, DollarSign,
  MoreHorizontal, SlidersHorizontal, X, Plus, Download, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { RegistrationCombobox } from '@/components/common/RegistrationCombobox';
import { TableSkeleton, StatsCardSkeleton } from '@/components/common/SkeletonLoader';
import {
  usePayments, usePaymentStats, useRefundPayment, useUpdatePaymentStatus, useCreatePayment,
} from '@/hooks/usePayments';
import { useActionParam } from '@/hooks/useActionParam';
import { paymentService } from '@/services/payment.service';
import { formatDate, formatCurrency, getFriendlyErrorMessage, exportToCSV, toLocalDateInput } from '@/lib/utils';
import type { Payment, PaymentStatus, PaymentMethodType, Registration } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: PaymentStatus[] = [
  'pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded',
];

const METHOD_OPTIONS: PaymentMethodType[] = ['credit_card', 'cash', 'card', 'upi', 'bank_transfer', 'online', 'other'];

const METHOD_LABELS: Record<PaymentMethodType, string> = {
  credit_card: 'Credit Card', cash: 'Cash', card: 'Card', upi: 'UPI',
  bank_transfer: 'Bank Transfer', online: 'Online', other: 'Other',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RefundDialogProps {
  payment: Payment | null;
  onClose: () => void;
}

function RefundDialog({ payment, onClose }: RefundDialogProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const refund = useRefundPayment();

  if (!payment) return null;

  const maxRefundable = payment.amount - (payment.refundAmount ?? 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (refund.isPending) return;
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) {
      setFieldError('Enter a valid amount greater than 0');
      return;
    }
    if (val > maxRefundable) {
      setFieldError(`Maximum refundable amount is ${formatCurrency(maxRefundable, payment!.currency)}`);
      return;
    }
    setFieldError(null);
    refund.mutate(
      { id: payment!.id, data: { amount: val, reason: reason.trim() || undefined } },
      { onSuccess: onClose },
    );
  }

  const submitError = refund.error
    ? getFriendlyErrorMessage(refund.error, 'Unable to process refund.')
    : null;

  return (
    <Dialog open onOpenChange={(v) => !refund.isPending && !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Refund Payment</DialogTitle>
          <DialogDescription>
            {formatCurrency(payment.amount, payment.currency)} — {payment.paymentMethod?.toUpperCase()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {(submitError || fieldError) && (
              <Alert variant="destructive">
                <AlertDescription>{submitError || fieldError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="refund-amount">
                Refund Amount * <span className="text-xs text-muted-foreground">(max {formatCurrency(maxRefundable, payment?.currency)})</span>
              </Label>
              <Input
                id="refund-amount"
                type="number"
                min="0.01"
                step="0.01"
                max={maxRefundable}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={String(maxRefundable)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refund-reason">Reason (optional)</Label>
              <Input
                id="refund-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Customer request, duplicate charge…"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={refund.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" loading={refund.isPending}>
              {refund.isPending ? 'Refunding…' : 'Confirm Refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface StatusDialogProps {
  payment: Payment | null;
  onClose: () => void;
}

function StatusDialog({ payment, onClose }: StatusDialogProps) {
  const [status, setStatus] = useState<PaymentStatus>(payment?.status ?? 'pending');
  const update = useUpdatePaymentStatus();

  if (!payment) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    update.mutate({ id: payment!.id, status }, { onSuccess: onClose });
  }

  return (
    <Dialog open onOpenChange={(v) => !update.isPending && !v && onClose()}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
          <DialogDescription>Change the status for payment {payment.id.slice(-8)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="py-4">
            {update.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {getFriendlyErrorMessage(update.error, 'Failed to update status.')}
                </AlertDescription>
              </Alert>
            )}
            <Label htmlFor="new-status">New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
              <SelectTrigger id="new-status" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={update.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CreateStandalonePaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateStandalonePaymentDialog({ open, onClose }: CreateStandalonePaymentDialogProps) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [manualId, setManualId] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState<string>('credit_card');
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const createPayment = useCreatePayment();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (createPayment.isPending) return;
    if (!registrationId.trim()) {
      setFieldError('Select the registration this payment is for');
      return;
    }
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) {
      setFieldError('Enter a valid amount greater than 0');
      return;
    }
    setFieldError(null);
    createPayment.mutate(
      {
        registrationId: registrationId.trim(),
        amount: val,
        currency: currency.trim().toUpperCase() || 'USD',
        method,
        paymentMethod: method === 'credit_card' ? 'card' : (method as PaymentMethodType),
        transactionId: transactionId.trim() || undefined,
        status,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setRegistration(null);
          setManualId(false);
          setRegistrationId('');
          setAmount('');
          setCurrency('USD');
          setTransactionId('');
          setDescription('');
          onClose();
        },
      }
    );
  }

  const submitError = createPayment.error
    ? getFriendlyErrorMessage(createPayment.error, 'Unable to record payment.')
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !createPayment.isPending && !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Add a payment to the ledger for an existing registration. To mark a registration
            as paid, you can also use “Record Payment” on the Registrations page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-3.5 py-2">
            {(submitError || fieldError) && (
              <Alert variant="destructive">
                <AlertDescription>{submitError || fieldError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="create-payment-reg">Registration *</Label>
              {manualId ? (
                <Input
                  id="create-payment-reg"
                  value={registrationId}
                  onChange={(e) => setRegistrationId(e.target.value)}
                  placeholder="Registration ID"
                  required
                />
              ) : (
                <RegistrationCombobox
                  selected={registration}
                  disabled={createPayment.isPending}
                  onSelect={(r) => {
                    setRegistration(r);
                    setRegistrationId(r.id);
                    if (r.amount != null && !amount) setAmount(String(r.amount));
                  }}
                />
              )}
              <button
                type="button"
                className="rounded-sm text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => { setManualId((m) => !m); setRegistration(null); setRegistrationId(''); }}
              >
                {manualId ? 'Pick from the registration list' : 'Enter a registration ID manually'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-payment-amount">Amount *</Label>
                <Input
                  id="create-payment-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="150.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-payment-currency">Currency</Label>
                <Input
                  id="create-payment-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  maxLength={3}
                  placeholder="USD"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-payment-method">Payment Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id="create-payment-method"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-payment-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus)}>
                  <SelectTrigger id="create-payment-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-payment-txn">Transaction ID (optional)</Label>
              <Input
                id="create-payment-txn"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. ch_3M4abcd123"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-payment-desc">Description / Reference (optional)</Label>
              <Input
                id="create-payment-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Front desk walk-in, retail item, etc."
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={createPayment.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={createPayment.isPending}>
              {createPayment.isPending ? 'Recording…' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-6"><TableSkeleton rows={8} /></div>}>
      <PaymentsPageInner />
    </Suspense>
  );
}

function PaymentsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdFilter = searchParams.get('eventId') || '';

  const [search, setSearch] = useState('');
  // Bumped on "Clear" to remount the (uncontrolled) search box empty.
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [statusTarget, setStatusTarget] = useState<Payment | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useActionParam({ add: () => setCreateOpen(true) });

  async function handleExport() {
    setIsExporting(true);
    try {
      const rows = await paymentService.exportPayments();
      if (rows.length === 0) {
        toast.error('There are no payments to export.');
        return;
      }
      exportToCSV(
        rows.map((p) => ({
          'Payment ID': (p.id || '').replace('PAYMENT#', ''),
          Guest: p.guestName ?? '',
          Email: p.guestEmail ?? '',
          Type: p.type ?? (p.appointmentId ? 'consultation' : 'event'),
          'Event / Service': p.event ?? p.service ?? '',
          Amount: p.amount ?? 0,
          Currency: p.currency ?? '',
          Method: p.paymentMethod ?? p.method ?? '',
          Status: p.status ?? '',
          'Refunded Amount': p.refundAmount ?? '',
          'Transaction ID': p.transactionId ?? '',
          'Registration ID': p.registrationId ?? '',
          'Paid At': p.paidAt ?? p.createdAt ?? '',
        })),
        `payments-export-${toLocalDateInput()}`
      );
      toast.success(`Exported ${rows.length} payment${rows.length === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, 'Failed to export payments.'));
    } finally {
      setIsExporting(false);
    }
  }

  const { data: statsData, isLoading: statsLoading } = usePaymentStats();
  const {
    data, isLoading, isError, error, refetch,
  } = usePayments({
    status: (statusFilter || undefined) as PaymentStatus | undefined,
    paymentMethod: (methodFilter || undefined) as PaymentMethodType | undefined,
    search: search || undefined,
    limit: 50,
  });

  const payments: Payment[] = useMemo(() => {
    let items: Payment[] = [];
    if (!data) items = [];
    else if (Array.isArray(data)) items = data;
    else if (Array.isArray((data as any).data)) items = (data as any).data;
    else if (Array.isArray((data as any).items)) items = (data as any).items;
    // A payment with no guest, no registration, and no appointment/event is not attributable to
    // anyone — don't render it as an "unknown payer" row.
    items = items.filter((p) => !!(p.guestId || p.guestName || p.registrationId || p.appointmentId));
    if (eventIdFilter) items = items.filter((p) => p.eventId === eventIdFilter);
    return items;
  }, [data, eventIdFilter]);

  // Compute live summary stats from loaded payments list if backend stats are missing or incomplete
  const summaryStats = useMemo(() => {
    let successCount = 0;
    let pendingCount = 0;
    let refundedCount = 0;
    let failedCount = 0;
    let totalAmt = 0;
    let refundedAmt = 0;

    for (const p of payments) {
      const amt = Number(p.amount ?? 0) || 0;
      const ref = Number(p.refundAmount ?? 0) || 0;
      if (p.status === 'paid') {
        successCount++;
        totalAmt += amt;
      } else if (p.status === 'pending' || p.status === 'processing') {
        pendingCount++;
      } else if (p.status === 'failed' || p.status === 'cancelled') {
        failedCount++;
      } else if (p.status === 'refunded' || p.status === 'partially_refunded') {
        refundedCount++;
        refundedAmt += (ref > 0 ? ref : amt);
      }
    }

    const hasBackendStats = statsData && typeof statsData.totalPayments === 'number' && statsData.totalPayments > 0;

    return {
      totalPayments: hasBackendStats ? statsData.totalPayments : (statsData?.totalPayments ?? payments.length),
      successfulPayments: hasBackendStats ? statsData.successfulPayments : (statsData?.successfulPayments ?? successCount),
      pendingPayments: hasBackendStats ? statsData.pendingPayments : (statsData?.pendingPayments ?? pendingCount),
      failedPayments: hasBackendStats ? statsData.failedPayments : (statsData?.failedPayments ?? failedCount),
      refundedPayments: hasBackendStats ? statsData.refundedPayments : (statsData?.refundedPayments ?? refundedCount),
      totalAmount: hasBackendStats ? statsData.totalAmount : (statsData?.totalAmount ?? totalAmt),
      refundedAmount: hasBackendStats ? statsData.refundedAmount : (statsData?.refundedAmount ?? refundedAmt),
      netAmount: hasBackendStats ? statsData.netAmount : (statsData?.netAmount ?? (totalAmt - refundedAmt)),
    };
  }, [statsData, payments]);

  const hasActiveFilters = !!statusFilter || !!methodFilter || !!search;
  function clearFilters() { setStatusFilter(''); setMethodFilter(''); setSearch(''); setSearchResetKey((k) => k + 1); }
  function clearEventFilter() { router.push('/payments'); }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
          <p className="text-muted-foreground">Track revenue, manage refunds, and update payment statuses.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} loading={isExporting}>
            {!isExporting && <Download className="mr-2 h-4 w-4" aria-hidden="true" />}
            Export
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statsLoading && !payments.length ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard
              icon={DollarSign}
              label="Net Revenue"
              value={formatCurrency(summaryStats.netAmount ?? 0)}
              sub={`${summaryStats.totalPayments ?? 0} transactions`}
            />
            <StatsCard
              icon={TrendingUp}
              label="Successful"
              value={String(summaryStats.successfulPayments ?? 0)}
              sub={formatCurrency(summaryStats.totalAmount ?? 0) + ' collected'}
            />
            <StatsCard
              icon={Clock}
              label="Pending"
              value={String(summaryStats.pendingPayments ?? 0)}
              sub="awaiting confirmation"
            />
            <StatsCard
              icon={RefreshCw}
              label="Refunded"
              value={String(summaryStats.refundedPayments ?? 0)}
              sub={formatCurrency(summaryStats.refundedAmount ?? 0) + ' returned'}
            />
          </>
        )}
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          key={searchResetKey}
          placeholder="Search by guest, ID or transaction…"
          defaultValue={search}
          onSearch={setSearch}
          className="w-full sm:max-w-xs"
        />
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by payment status" id="payments-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter || 'all'} onValueChange={(v) => setMethodFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by payment method" id="payments-method-filter">
            <SelectValue placeholder="All methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {METHOD_OPTIONS.map((m) => (
              <SelectItem key={m} value={m}>{METHOD_LABELS[m]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
        {eventIdFilter && (
          <Badge variant="secondary" className="gap-1.5 py-1.5 pl-2.5 pr-1.5">
            Filtered by event
            <button type="button" onClick={clearEventFilter} aria-label="Clear event filter" className="rounded-full p-0.5 hover:bg-muted">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
      </div>

      {/* ─── Table ─── */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6"><TableSkeleton rows={8} /></div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState
                title="Unable to load payments"
                message={getFriendlyErrorMessage(error)}
                onRetry={() => refetch()}
              />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyState
                  icon={CreditCard}
                  title="No payments found"
                  description="Try adjusting your filters."
                  action={{ label: 'Clear filters', onClick: clearFilters }}
                />
              ) : (
                <EmptyState
                  icon={CreditCard}
                  title="No payments yet"
                  description="Payments will appear here once recorded from the Registrations tab or created above."
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden lg:table-cell">Payment ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Event / Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Paid At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const cleanId = (payment.id || payment.PK || '').replace('PAYMENT#', '');
                    const methodKey = payment.paymentMethod ?? (payment.method === 'credit_card' ? 'card' : payment.method) ?? 'card';
                    const methodLabel = METHOD_LABELS[methodKey as PaymentMethodType] ?? payment.method ?? payment.paymentMethod ?? 'Card';
                    const paidDate = payment.paidAt ?? payment.createdAt ?? payment.created_at;
                    const paymentType = payment.type ?? (payment.appointmentId ? 'consultation' : 'event');

                    return (
                      <TableRow key={cleanId || payment.id}>
                        <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                          {cleanId ? cleanId.slice(-12) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-[160px]">{payment.guestName || '—'}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[160px]">{payment.guestEmail || '—'}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="capitalize text-xs">{paymentType}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell truncate max-w-[160px]">
                          {paymentType === 'consultation'
                            ? [payment.service, payment.date ? formatDate(payment.date) : null].filter(Boolean).join(' — ') || '—'
                            : (payment.event || '—')}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold tabular-nums">{formatCurrency(payment.amount ?? 0, payment.currency)}</div>
                          <div className="text-xs text-muted-foreground">{(payment.currency || 'USD').toUpperCase()}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="capitalize text-xs">
                            {methodLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payment.status ?? 'paid'} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                          {paidDate ? formatDate(paidDate) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for payment ${cleanId.slice(-8)}`}
                                id={`payment-actions-${cleanId}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {payment.registrationId && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => router.push(`/registrations/${payment.registrationId}`)}
                                >
                                  <ClipboardList className="mr-2 h-4 w-4" />
                                  View Registration
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setStatusTarget(payment)}
                              >
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                Update Status
                              </DropdownMenuItem>
                              {payment.status === 'paid' || payment.status === 'partially_refunded' ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={() => setRefundTarget(payment)}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refund
                                  </DropdownMenuItem>
                                </>
                              ) : null}
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

      {/* ─── Dialogs ─── */}
      <CreateStandalonePaymentDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {/* Keyed by payment so each opening starts from that payment's current values. */}
      <RefundDialog key={refundTarget?.id ?? 'refund'} payment={refundTarget} onClose={() => setRefundTarget(null)} />
      <StatusDialog key={statusTarget?.id ?? 'status'} payment={statusTarget} onClose={() => setStatusTarget(null)} />
    </div>
  );
}

// ─── StatsCard helper ─────────────────────────────────────────────────────────

function StatsCard({
  icon: Icon, label, value, sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2 sm:p-5 sm:pb-2">
        <CardTitle className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{label}</CardTitle>
        <div className="shrink-0 rounded-lg bg-primary/10 p-1.5 sm:p-2">
          <Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
        <div data-stat className="truncate text-xl font-bold tracking-tight sm:text-2xl">{value}</div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
