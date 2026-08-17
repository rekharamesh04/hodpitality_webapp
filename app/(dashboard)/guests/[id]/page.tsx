'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ArrowLeft, Phone, Mail, MessageSquare, CalendarPlus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SpaAppointment, Guest } from '@/types';
import NewAppointmentDialog from '@/components/dialogs/NewAppointmentDialog';
import { guestService } from '@/services/guest.service';
import { appointmentService } from '@/services/appointment.service';

const TIER_COLORS: Record<string, string> = {
  Founding:  'bg-amber-100 text-amber-800 border-amber-300',
  Signature: 'bg-purple-100 text-purple-800 border-purple-300',
  Standard:  'bg-gray-100 text-gray-700 border-gray-300',
};

const OUTCOME_COLORS: Record<string, string> = {
  Completed: 'text-green-700 bg-green-50 border-green-200',
  Cancelled: 'text-red-600 bg-red-50 border-red-200',
  'No-show': 'text-orange-700 bg-orange-50 border-orange-200',
};

const TODAY = '2026-08-06';

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [customer, setCustomer] = useState<(Guest & Record<string, any>) | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [appointments, setAppointments] = useState<SpaAppointment[]>([]);
  const visitHistory: Array<{ date: string; service: string; staff: string; duration: number; outcome: string; notes?: string }> = [];

  useEffect(() => {
    guestService.getGuest(id).then(setCustomer).catch(console.error);
    appointmentService.getAppointments({ limit: 100 }).then(res => setAppointments((Array.isArray(res) ? res : []) as unknown as SpaAppointment[])).catch(console.error);
  }, [id]);

  const upcomingAppts = useMemo(
    () =>
      appointments.filter(
        (a) => a.customerId === id && ['scheduled', 'checked_in'].includes(a.status)
      ),
    [appointments, id]
  );


  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
    );
  }

  function handleCancelAppt(apptId: string) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId ? { ...a, status: 'cancelled' as const, cancelledTime: new Date().toTimeString().slice(0, 5) } : a
      )
    );
  }

  function handleAddAppointment(appt: Omit<SpaAppointment, 'id'>) {
    setAppointments((prev) => [...prev, { ...appt, id: `a${Date.now()}` }]);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back nav */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All customers
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
          {/* Avatar / photo */}
          <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-card">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {customer.initials}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs px-2 h-7">Replace</Button>
              <Button size="sm" variant="outline" className="text-xs px-2 h-7">
                <Pencil className="h-3 w-3 mr-1" />Edit
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row lg:flex-col gap-2">
            <Button size="sm" onClick={() => setBookOpen(true)}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book appointment
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message customer
            </Button>
          </div>

          {/* Contact info */}
          <Card>
            <CardContent className="p-4 space-y-3 text-sm">
              <InfoRow label="Email"           value={customer.email} />
              <InfoRow label="Phone"           value={customer.phone} />
              <InfoRow label="Preferred contact" value={customer.preferredContact} />
              <InfoRow label="Preferences"     value={customer.preferences} />
              <InfoRow label="Home location"   value={customer.homeLocation} />
              <InfoRow label="Balance"         value={`$${customer.balance.toFixed(2)}`} />
              <InfoRow label="Customer ID"     value={customer.customerId} />
            </CardContent>
          </Card>
        </aside>

        {/* ─── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  TIER_COLORS[customer.tier] ?? ''
                }`}
              >
                {customer.tier}
              </span>
              {customer.hasAllergy && (
                <Badge variant="destructive" className="text-xs">
                  Allergy on file
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {customer.memberSince
                ? `Sixty-fourth visit coming up. Books the same slot most weeks.`
                : 'Welcome to Harbor Street.'}
            </p>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <StatBox value={String(customer.visits)} label="Visits" />
              <StatBox value={customer.memberSince} label="Member since" />
              <StatBox value={String(customer.upcomingCount)} label="Upcoming" />
              <StatBox value={String(customer.missedVisits)} label="Missed visits" />
            </div>
          </div>

          {/* Upcoming appointments */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Upcoming</h2>
            {upcomingAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.map((appt) => (
                  <UpcomingApptCard
                    key={appt.id}
                    appt={appt}
                    onCancel={() => handleCancelAppt(appt.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Notes */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {customer.notes || 'No notes.'}
            </p>
          </section>

          {/* Visit history */}
          <section>
            <h2 className="text-lg font-semibold mb-3">Visit history</h2>
            {visitHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visit history yet.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="hidden sm:table-cell">Staff</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitHistory.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{v.date}</TableCell>
                        <TableCell className="text-sm">{v.service}</TableCell>
                        <TableCell className="text-sm hidden sm:table-cell">{v.staff}</TableCell>
                        <TableCell className="text-sm hidden md:table-cell">{(v as any).location}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              OUTCOME_COLORS[v.outcome] ?? ''
                            }`}
                          >
                            {v.outcome}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* New appointment dialog */}
      <NewAppointmentDialog
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBook={handleAddAppointment}
        defaultDate={TODAY}
        preselectedCustomerId={customer.id}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function UpcomingApptCard({
  appt,
  onCancel,
}: {
  appt: SpaAppointment;
  onCancel: () => void;
}) {
  const [h, m] = appt.startTime.split(':').map(Number);
  const endMin = h * 60 + m + appt.duration;
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;
  const fmt = (hh: number, mm: number) => {
    const ampm = hh < 12 ? 'am' : 'pm';
    const d = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh;
    return `${d}:${String(mm).padStart(2, '0')} ${ampm}`;
  };

  const dateLabel =
    appt.date === TODAY ? 'Today' : new Date(appt.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="flex items-center justify-between border rounded-lg p-3 gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{dateLabel}</span>
          <span>·</span>
          <span>
            {fmt(h, m)} – {fmt(endH, endM)}
          </span>
        </div>
        <p className="text-sm font-medium mt-0.5">{appt.service}</p>
        <p className="text-xs text-muted-foreground">
          {appt.staffName} · {appt.duration} min · {appt.room}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">Scheduled</Badge>
        <Button size="sm" variant="ghost" className="text-xs h-7 px-2">Reschedule</Button>
        <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-destructive" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
