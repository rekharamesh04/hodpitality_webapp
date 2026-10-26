'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { useAppointments } from '@/hooks/useAppointments';
import { useCheckIns } from '@/hooks/useCheckins';
import { useDeskCheckOut } from '@/hooks/useOpd';
import { useBillingSettings } from '@/hooks/usePharmacies';
import { useTerminology } from '@/hooks';
import { visitFee } from '@/constants/kiosk';
import { isOpenCheckIn, opdStageOf } from '@/constants/opd';
import { formatCurrency, formatDate, toLocalDateInput } from '@/lib/utils';
import type { Appointment } from '@/types';

const LIVE_REFRESH_MS = 15_000;

/**
 * Step 4 of the hospital's day: everyone the doctor has finished with today who has not left yet.
 * Each row shows the one thing still to do — take the fee, then check them out — so the desk
 * works down the list. A patient leaves the list once paid (or nothing owed) and checked out,
 * here or at the kiosk. Renders nothing when nobody is waiting to leave.
 */
export function CheckoutQueue() {
  const t = useTerminology();
  const { data: appointments } = useAppointments({ date: toLocalDateInput() }, { refetchInterval: LIVE_REFRESH_MS });
  const { data: checkIns } = useCheckIns({}, { refetchInterval: LIVE_REFRESH_MS });
  const { data: billing } = useBillingSettings();
  const checkOut = useDeskCheckOut();
  const [paying, setPaying] = useState<Appointment | null>(null);

  const onSite = useMemo(
    () => new Set((checkIns ?? []).filter(isOpenCheckIn).map((c) => c.guestId).filter(Boolean)),
    [checkIns],
  );

  const rows = useMemo(() => {
    const standard = billing?.standardVisitFee ?? 0;
    return (appointments ?? [])
      .filter((a) => opdStageOf(a) === 'done' && (a.status ?? '').toLowerCase() === 'completed')
      .map((a) => {
        const fee = visitFee(a, standard);
        const owes = a.paymentStatus !== 'paid' && a.paymentStatus !== 'waived' && fee.amount > 0;
        const personId = a.customerId || a.guestId || '';
        return { a, fee, owes, personId, here: !!personId && onSite.has(personId) };
      })
      .filter((r) => r.owes || r.here)
      .sort((x, y) => (x.a.sessionClosedAt ?? '').localeCompare(y.a.sessionClosedAt ?? ''));
  }, [appointments, billing, onSite]);

  if (rows.length === 0) return null;

  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <LogOut className="h-4 w-4 text-primary" aria-hidden="true" /> Ready for checkout
          <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">{rows.length}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Seen by the {t.practitioner.toLowerCase()} today. Take the fee, then check them out — or they can check out by face at the kiosk.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(({ a, fee, owes, personId, here }) => {
          const name = a.customerName || a.guestName || t.person.one;
          return (
            <div key={a.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.staffName ?? t.practitioner}
                  {a.sessionClosedAt ? ` · finished ${formatDate(a.sessionClosedAt, 'HH:mm')}` : ''}
                </p>
              </div>
              {owes ? (
                <>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(fee.amount)} to pay</span>
                  <Button size="sm" onClick={() => setPaying(a)}>
                    <CreditCard className="mr-2 h-4 w-4" /> Take payment
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="gap-1 border-green-300 text-green-700 dark:border-green-900 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {fee.amount > 0 ? 'Paid' : 'Nothing to pay'}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => checkOut.mutate({ personId, name })}
                    loading={checkOut.isPending && checkOut.variables?.personId === personId}
                    disabled={checkOut.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Check out
                  </Button>
                </>
              )}
              {owes && !here && <span className="text-xs text-muted-foreground">already left</span>}
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
