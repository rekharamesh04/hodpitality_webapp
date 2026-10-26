'use client';

import { useMemo, useState } from 'react';
import { CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { useAppointments } from '@/hooks/useAppointments';
import { useBillingSettings } from '@/hooks/usePharmacies';
import { useTerminology } from '@/hooks';
import { visitFee } from '@/constants/kiosk';
import { opdStageOf } from '@/constants/opd';
import { formatCurrency, formatDate, toLocalDateInput } from '@/lib/utils';
import type { Appointment } from '@/types';

const LIVE_REFRESH_MS = 15_000;

/**
 * Step 4 of the hospital's day: everyone the doctor has finished with today who still owes the
 * visit fee, oldest first, each one click from taking payment. Before this the desk had to find
 * them on the OPD board's "seen" lists. Renders nothing when nobody is waiting to pay.
 */
export function CheckoutQueue() {
  const t = useTerminology();
  const { data: appointments } = useAppointments({ date: toLocalDateInput() }, { refetchInterval: LIVE_REFRESH_MS });
  const { data: billing } = useBillingSettings();
  const [paying, setPaying] = useState<Appointment | null>(null);

  const ready = useMemo(() => {
    const standard = billing?.standardVisitFee ?? 0;
    return (appointments ?? [])
      .filter((a) => opdStageOf(a) === 'done' && (a.status ?? '').toLowerCase() === 'completed')
      .filter((a) => a.paymentStatus !== 'paid' && a.paymentStatus !== 'waived' && visitFee(a, standard).amount > 0)
      .sort((x, y) => (x.sessionClosedAt ?? '').localeCompare(y.sessionClosedAt ?? ''));
  }, [appointments, billing]);

  if (ready.length === 0) return null;

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <LogOut className="h-4 w-4 text-primary" aria-hidden="true" /> Ready for checkout
          <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">{ready.length}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Seen by the {t.practitioner.toLowerCase()} today, fee still to collect. Oldest first.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {ready.map((a) => {
          const fee = visitFee(a, billing?.standardVisitFee ?? 0);
          return (
            <div key={a.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.customerName || a.guestName || t.person.one}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.staffName ?? t.practitioner}
                  {a.sessionClosedAt ? ` · finished ${formatDate(a.sessionClosedAt, 'HH:mm')}` : ''}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(fee.amount)}</span>
              <Button size="sm" onClick={() => setPaying(a)}>
                <CreditCard className="mr-2 h-4 w-4" /> Take payment
              </Button>
            </div>
          );
        })}
      </CardContent>
      <RecordAppointmentPaymentDialog
        open={!!paying}
        onOpenChange={(open) => !open && setPaying(null)}
        appointment={paying}
      />
    </Card>
  );
}
