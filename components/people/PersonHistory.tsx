'use client';

import { useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentDetailDialog } from '@/components/appointments/AppointmentDetailDialog';
import { PersonDocumentsPanel } from '@/components/people/PersonDocumentsPanel';
import { useAppointments } from '@/hooks/useAppointments';
import { useCheckIns } from '@/hooks/useCheckins';
import { usePayments } from '@/hooks/usePayments';
import { useTerminology } from '@/hooks';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_STYLES } from '@/constants/appointment';
import { cn, formatCurrency, formatDate, formatTimeLabel, getStatusColor, toLocalDateInput } from '@/lib/utils';
import type { Appointment } from '@/types';
import type { PersonEntity } from '@/services/document.service';

const NEUTRAL_BADGE = 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';

interface PersonHistoryProps {
  entity: PersonEntity;
  personId: string;
  onBook?: () => void;
}

function byDateTime(a: Appointment, b: Appointment): number {
  return `${a.date ?? ''} ${a.startTime ?? ''}`.localeCompare(`${b.date ?? ''} ${b.startTime ?? ''}`);
}

/**
 * Everything the desk needs about one person in one place: today's session, what is coming
 * up, what has happened (with how each session ended and whether it was paid), their visits,
 * their payments, and their reports.
 */
export function PersonHistory({ entity, personId, onBook }: PersonHistoryProps) {
  const t = useTerminology();
  const [selected, setSelected] = useState<Appointment | null>(null);

  const appointmentsQuery = useAppointments({ guestId: personId }, { enabled: !!personId });
  const visitsQuery = useCheckIns({ guestId: personId });
  const paymentsQuery = usePayments({ guestId: personId, limit: 200 }, { enabled: !!personId && t.has('payments') });

  const { today, upcoming, past } = useMemo(() => {
    const day = toLocalDateInput();
    const all = appointmentsQuery.data ?? [];
    return {
      today: all.filter((a) => a.date === day).sort(byDateTime),
      upcoming: all.filter((a) => (a.date ?? '') > day).sort(byDateTime),
      past: all.filter((a) => !!a.date && a.date < day).sort(byDateTime).reverse(),
    };
  }, [appointmentsQuery.data]);

  // The list endpoint is shared with the Check-ins page; keep only this person's rows even if
  // an older backend ignores the filter.
  const visits = (visitsQuery.data ?? []).filter((c) => c.guestId === personId);
  const payments = (paymentsQuery.data?.data ?? []).filter((p) => (p.guestId ?? p.customerId) === personId);
  const totalPaid = payments
    .filter((p) => String(p.status).toLowerCase() === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Keep the dialog in step with refetched data, so ending a session updates it in place.
  const selectedLive = selected ? (appointmentsQuery.data ?? []).find((a) => a.id === selected.id) ?? selected : null;

  function appointmentList(items: Appointment[], empty: string) {
    if (appointmentsQuery.isLoading) return <ListSkeleton />;
    if (items.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
    return (
      <ul className="space-y-2">
        {items.map((a) => {
          const status = a.status ?? 'scheduled';
          const pay = a.paymentStatus ?? 'pending';
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelected(a)}
                className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.serviceName ?? a.service ?? t.visit.one}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.date ? formatDate(a.date, 'MMM dd, yyyy') : '—'}
                    {a.startTime ? ` · ${formatTimeLabel(a.startTime)}` : ''}
                    {a.staffName ? ` · ${a.staffName}` : ''}
                  </p>
                  {a.sessionNote && <p className="mt-0.5 truncate text-xs text-muted-foreground">“{a.sessionNote}”</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  {a.amount != null && Number(a.amount) > 0 && (
                    <span className="text-xs text-muted-foreground">{formatCurrency(Number(a.amount))}</span>
                  )}
                  <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold', APPOINTMENT_STATUS_STYLES[status] ?? NEUTRAL_BADGE)}>
                    {APPOINTMENT_STATUS_LABELS[status] ?? status}
                  </span>
                  <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', getStatusColor(pay))}>
                    {pay === 'waived' ? 'No charge' : pay}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">History</CardTitle>
        {onBook && (
          <Button size="sm" variant="outline" onClick={onBook}>
            <CalendarPlus className="mr-2 h-4 w-4" /> Book {t.visit.one.toLowerCase()}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={today.length > 0 ? 'today' : 'upcoming'}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="today">Today ({today.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="visits">Visits ({visits.length})</TabsTrigger>
            {t.has('payments') && <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>}
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="pt-3">
            {appointmentList(today, `No ${t.visit.many.toLowerCase()} today.`)}
          </TabsContent>
          <TabsContent value="upcoming" className="pt-3">
            {appointmentList(upcoming, `No upcoming ${t.visit.many.toLowerCase()}.`)}
          </TabsContent>
          <TabsContent value="past" className="pt-3">
            {appointmentList(past, `No past ${t.visit.many.toLowerCase()}.`)}
          </TabsContent>

          <TabsContent value="visits" className="pt-3">
            {visitsQuery.isLoading ? <ListSkeleton /> : visits.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No check-ins yet.</p>
            ) : (
              <ul className="space-y-2">
                {visits.map((c) => {
                  const when = c.timestamp ?? c.checkInTime;
                  const method = (c.method ?? c.checkInMethod ?? '').toString().replace(/_/g, ' ');
                  return (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium">{when ? formatDate(when, 'MMM dd, yyyy HH:mm') : '—'}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {method || 'manual'}{c.venue ? ` · ${c.venue}` : ''}{c.event ? ` · ${c.event}` : ''}
                        </p>
                      </div>
                      {c.status && (
                        <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', getStatusColor(c.status))}>
                          {c.status === 'completed' ? 'checked out' : c.status}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>

          {t.has('payments') && (
            <TabsContent value="payments" className="pt-3">
              {paymentsQuery.isLoading ? <ListSkeleton /> : payments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No payments yet.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total paid: <span className="font-semibold text-foreground">{formatCurrency(totalPaid)}</span></p>
                  <ul className="space-y-2">
                    {payments.map((p) => {
                      const when = p.paidAt ?? p.created_at ?? p.createdAt ?? p.date;
                      return (
                        <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                          <div className="min-w-0">
                            <p className="font-medium">{formatCurrency(Number(p.amount) || 0)} · <span className="capitalize">{(p.method ?? p.paymentMethod ?? '').toString().replace(/_/g, ' ')}</span></p>
                            <p className="text-xs text-muted-foreground">
                              {when ? formatDate(when, 'MMM dd, yyyy') : '—'}
                              {p.service ? ` · ${p.service}` : p.event ? ` · ${p.event}` : ''}
                              {p.transactionId ? ` · Ref ${p.transactionId}` : ''}
                            </p>
                          </div>
                          <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', getStatusColor(String(p.status)))}>
                            {String(p.status)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="reports" className="pt-3">
            <PersonDocumentsPanel entity={entity} personId={personId} />
          </TabsContent>
        </Tabs>
      </CardContent>

      <AppointmentDetailDialog
        appointment={selectedLive}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
