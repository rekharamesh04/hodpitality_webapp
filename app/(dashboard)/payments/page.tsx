'use client';

import { useState } from 'react';
import {
  CreditCard, TrendingUp, Clock, RefreshCw, DollarSign,
  MoreHorizontal, Search, SlidersHorizontal, X, Plus,
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
import { TableSkeleton, StatsCardSkeleton } from '@/components/common/SkeletonLoader';
import {
  usePayments, usePaymentStats, useRefundPayment, useUpdatePaymentStatus, useCreatePayment,
} from '@/hooks/usePayments';
import { formatDate, formatCurrency, getFriendlyErrorMessage } from '@/lib/utils';
import type { Payment, PaymentStatus, PaymentMethodType } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: PaymentStatus[] = [
  'pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded',
];

const STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  refunded: 'bg-purple-100 text-purple-700 border-purple-200',
  partially_refunded: 'bg-orange-100 text-orange-700 border-orange-200',
};

const METHOD_OPTIONS: PaymentMethodType[] = ['credit_card', 'cash', 'card', 'upi', 'bank_transfer', 'online', 'other'];

const METHOD_LABELS: Record<PaymentMethodType, string> = {
  credit_card: 'Credit Card', cash: 'Cash', card: 'Card', upi: 'UPI',
  bank_transfer: 'Bank Transfer', online: 'Online', other: 'Other',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={`capitalize text-xs font-medium border ${STATUS_COLORS[status] ?? ''}`}
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}

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
      setFieldError(`Maximum refundable amount is ${formatCurrency(maxRefundable)}`);
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
            {formatCurrency(payment.amount)} {payment.currency} — {payment.paymentMethod?.toUpperCase()}
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
                Refund Amount * <span className="text-xs text-muted-foreground">(max {formatCurrency(maxRefundable)})</span>
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
                    {s.replace('_', ' ')}
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
  const [registrationId, setRegistrationId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [method, setMethod] = useState<string>('credit_card');
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const createPayment = useCreatePayment();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (createPayment.isPending) return;
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) {
      setFieldError('Enter a valid amount greater than 0');
      return;
    }
    setFieldError(null);
    createPayment.mutate(
      {
        registrationId: registrationId.trim() || undefined,
        amount: val,
        currency: currency.trim().toUpperCase() || 'INR',
        method,
        paymentMethod: method === 'credit_card' ? 'card' : (method as PaymentMethodType),
        transactionId: transactionId.trim() || undefined,
        status,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setRegistrationId('');
          setAmount('');
          setCurrency('INR');
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
            Record a payment transaction directly to the financial ledger (POST /payments).
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
              <Label htmlFor="create-payment-reg">Registration ID (optional)</Label>
              <Input
                id="create-payment-reg"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                placeholder="e.g. reg_123abc"
              />
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
                  placeholder="INR"
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [statusTarget, setStatusTarget] = useState<Payment | null>(null);

  const { data: statsData, isLoading: statsLoading } = usePaymentStats();
  const {
    data, isLoading, isError, error, refetch,
  } = usePayments({
    status: (statusFilter || undefined) as PaymentStatus | undefined,
    paymentMethod: (methodFilter || undefined) as PaymentMethodType | undefined,
    search: search || undefined,
    limit: 50,
  });

  const payments = data?.data ?? [];
  const hasActiveFilters = !!statusFilter || !!methodFilter || !!search;
  function clearFilters() { setStatusFilter(''); setMethodFilter(''); setSearch(''); }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
          <p className="text-muted-foreground">Track revenue, manage refunds, and update payment statuses.</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : statsData ? (
          <>
            <StatsCard
              icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
              label="Net Revenue"
              value={formatCurrency(statsData.netAmount ?? 0)}
              sub={`${statsData.totalPayments} transactions`}
              color="emerald"
            />
            <StatsCard
              icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
              label="Successful"
              value={String(statsData.successfulPayments)}
              sub={formatCurrency(statsData.totalAmount ?? 0) + ' collected'}
              color="blue"
            />
            <StatsCard
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              label="Pending"
              value={String(statsData.pendingPayments)}
              sub="awaiting confirmation"
              color="amber"
            />
            <StatsCard
              icon={<RefreshCw className="h-5 w-5 text-purple-600" />}
              label="Refunded"
              value={String(statsData.refundedPayments)}
              sub={formatCurrency(statsData.refundedAmount ?? 0) + ' returned'}
              color="purple"
            />
          </>
        ) : null}
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="payments-search"
            placeholder="Search by ID or transaction…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by payment status" id="payments-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
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
                  description="Payments will appear here once recorded from the Registrations tab."
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden lg:table-cell">Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Registration</TableHead>
                    <TableHead className="hidden md:table-cell">Paid At</TableHead>
                    <TableHead className="hidden lg:table-cell">Recorded By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">
                        {payment.id.slice(-12)}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                        <div className="text-xs text-muted-foreground">{payment.currency}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="capitalize text-xs">
                          {METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm font-mono text-muted-foreground truncate max-w-[120px] block">
                          {payment.registrationId ? payment.registrationId.slice(-10) : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                        {payment.paidAt ? formatDate(payment.paidAt) : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {payment.recordedBy ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for payment ${payment.id.slice(-8)}`}
                              id={`payment-actions-${payment.id}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Dialogs ─── */}
      <CreateStandalonePaymentDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <RefundDialog payment={refundTarget} onClose={() => setRefundTarget(null)} />
      <StatusDialog payment={statusTarget} onClose={() => setStatusTarget(null)} />
    </div>
  );
}

// ─── StatsCard helper ─────────────────────────────────────────────────────────

function StatsCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-50`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
