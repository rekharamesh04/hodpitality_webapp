'use client';

import Link from 'next/link';
import { ArrowRight, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTerminology } from '@/hooks';
import { formatCurrency, getFriendlyErrorMessage, getRelativeTime } from '@/lib/utils';
import type { Payment } from '@/types';

interface RecentPaymentsProps {
  payments: Payment[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

function paidAt(p: Payment): string | undefined {
  return p.paidAt ?? p.createdAt ?? p.created_at;
}

/** The latest payment records, so the end of the flow is visible from the start of the day. */
export function RecentPayments({ payments, isLoading, isError, error, onRetry }: RecentPaymentsProps) {
  const t = useTerminology();
  const latest = [...payments]
    .sort((a, b) => new Date(paidAt(b) ?? 0).getTime() - new Date(paidAt(a) ?? 0).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent payments</CardTitle>
        <Link href="/payments">
          <Button variant="ghost" size="sm">
            All payment records
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : isError ? (
          <ErrorState title="Unable to load payments" message={getFriendlyErrorMessage(error)} onRetry={onRetry} />
        ) : latest.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description={`Payments recorded against a ${t.visit.one.toLowerCase()} appear here.`}
          />
        ) : (
          <ul className="divide-y">
            {latest.map((p) => {
              const when = paidAt(p);
              return (
                <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.guestName || p.customerName || 'Unknown payer'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[p.service || p.event || p.description, when && getRelativeTime(when)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(Number(p.amount ?? 0), p.currency || 'USD')}
                  </span>
                  <StatusBadge status={p.status} className="shrink-0" />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
