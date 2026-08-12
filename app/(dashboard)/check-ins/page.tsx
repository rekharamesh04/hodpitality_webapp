'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SpaAppointment, AppointmentStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { appointmentService } from '@/services/appointment.service';

const TODAY_LABEL = 'Thursday 6 August';

type FilterTab = 'all' | 'scheduled' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'scheduled',  label: 'Expected' },
  { key: 'checked_in', label: 'On site' },
  { key: 'completed',  label: 'Completed' },
  { key: 'cancelled',  label: 'Cancelled' },
];

const STATUS_META: Record<AppointmentStatus, { label: string; badge: string }> = {
  scheduled:  { label: 'Scheduled', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  checked_in: { label: 'Checked in', badge: 'bg-green-100 text-green-800 border-green-300' },
  completed:  { label: 'Completed', badge: 'bg-gray-100 text-gray-600 border-gray-300' },
  cancelled:  { label: 'Cancelled', badge: 'bg-red-50 text-red-600 border-red-200' },
  no_show:    { label: 'No-show', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const TIER_COLORS: Record<string, string> = {
  Founding:  'bg-amber-100 text-amber-800',
  Signature: 'bg-purple-100 text-purple-800',
  Standard:  'bg-gray-100 text-gray-700',
};

function formatTime(t: string): string {
  const [hStr, m] = t.split(':');
  const h = Number(hStr);
  const ampm = h < 12 ? 'am' : 'pm';
  const d = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${d}:${m} ${ampm}`;
}

export default function CheckInsPage() {
  const [appointments, setAppointments] = useState<SpaAppointment[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    appointmentService.getAppointments({ limit: 100 }).then((res) => {
      setAppointments((res.data as unknown as SpaAppointment[]) ?? []);
    }).catch(() => {});
  }, []);

  const stats = useMemo(() => ({
    expected:  appointments.filter((a) => a.status === 'scheduled').length,
    onSite:    appointments.filter((a) => a.status === 'checked_in').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    noShows:   appointments.filter((a) => a.status === 'no_show').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }), [appointments]);

  const filtered = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (activeTab === 'all') return sorted;
    return sorted.filter((a) => a.status === activeTab);
  }, [appointments, activeTab]);

  function updateStatus(id: string, newStatus: AppointmentStatus) {
    const now = new Date().toTimeString().slice(0, 5);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: newStatus,
              checkInTime:   newStatus === 'checked_in' ? now : a.checkInTime,
              checkOutTime:  newStatus === 'completed'  ? now : a.checkOutTime,
              cancelledTime: newStatus === 'cancelled'  ? now : a.cancelledTime,
              noShowTime:    newStatus === 'no_show'    ? now : a.noShowTime,
            }
          : a
      )
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Check-ins</h1>
        <p className="text-sm text-muted-foreground">Harbor Street · {TODAY_LABEL}</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Expected"  value={stats.expected}  color="text-blue-700"   />
        <StatCard label="On site"   value={stats.onSite}    color="text-green-700"  />
        <StatCard label="Completed" value={stats.completed} color="text-gray-700"   />
        <StatCard label="No-shows"  value={stats.noShows}   color="text-orange-700" />
        <StatCard label="Cancelled" value={stats.cancelled} color="text-red-600"    />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b overflow-x-auto scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No appointments in this category.</p>
        )}
        {filtered.map((appt) => (
          <AppointmentRow
            key={appt.id}
            appt={appt}
            onCheckIn={()  => updateStatus(appt.id, 'checked_in')}
            onComplete={()  => updateStatus(appt.id, 'completed')}
            onCancel={()   => updateStatus(appt.id, 'cancelled')}
            onNoShow={()   => updateStatus(appt.id, 'no_show')}
            onUndo={()     => updateStatus(appt.id, 'scheduled')}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

interface RowProps {
  appt: SpaAppointment;
  onCheckIn: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onNoShow: () => void;
  onUndo: () => void;
}

function AppointmentRow({ appt, onCheckIn, onComplete, onCancel, onNoShow, onUndo }: RowProps) {
  const meta = STATUS_META[appt.status];
  const tierColor = TIER_COLORS[appt.customerTier] ?? '';

  const [h, m] = appt.startTime.split(':').map(Number);
  const endMin = h * 60 + m + appt.duration;
  const endH = Math.floor(endMin / 60);
  const endM = endMin % 60;

  const startLabel = formatTime(appt.startTime);
  const endLabel = `${endH > 12 ? endH - 12 : endH}:${String(endM).padStart(2, '0')} ${endH < 12 ? 'am' : 'pm'}`;

  const timestampLabel =
    appt.status === 'checked_in'  ? `In ${appt.checkInTime  ?? ''}` :
    appt.status === 'completed'   ? `Out ${appt.checkOutTime ?? ''}` :
    appt.status === 'no_show'     ? `Missed ${appt.noShowTime ?? ''}` :
    appt.status === 'cancelled'   ? `Cancelled ${appt.cancelledTime ?? ''}` :
    null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border bg-card p-3 sm:p-4">
      {/* Time + customer — always visible */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Time block */}
        <div className="w-16 shrink-0 text-right">
          <p className="text-sm font-semibold">{startLabel}</p>
          <p className="text-xs text-muted-foreground">{endLabel}</p>
        </div>

        {/* Avatar + name */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {appt.customerInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate">{appt.customerName}</span>
            <span className={`inline-flex items-center px-1.5 py-0 rounded-full text-xs font-medium ${tierColor}`}>
              {appt.customerTier}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{appt.customerPhone}</p>
          {/* Service info — always visible on mobile, duplicated in desktop column below */}
          <p className="text-xs text-muted-foreground sm:hidden">{appt.service} · {appt.staffName}</p>
        </div>
      </div>

      {/* Service info (desktop only) */}
      <div className="hidden sm:block w-48 shrink-0 min-w-0">
        <p className="text-sm font-medium truncate">{appt.service}</p>
        <p className="text-xs text-muted-foreground truncate">
          {appt.staffName} · {appt.duration} min · {appt.room}
        </p>
      </div>

      {/* Status + actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        <div className="flex flex-col items-start sm:items-end gap-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${meta.badge}`}>
            {meta.label}
          </span>
          {timestampLabel && (
            <span className="text-xs text-muted-foreground">{timestampLabel}</span>
          )}
        </div>

        {appt.status === 'scheduled' && (
          <div className="flex gap-1">
            <Button size="sm" className="h-7 text-xs px-2" onClick={onCheckIn}>Check in</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={onCancel}>Cancel</Button>
          </div>
        )}
        {appt.status === 'checked_in' && (
          <Button size="sm" className="h-7 text-xs px-2" onClick={onComplete}>Complete</Button>
        )}
        {(appt.status === 'no_show' || appt.status === 'cancelled') && (
          <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={onUndo}>Undo</Button>
        )}
      </div>
    </div>
  );
}
