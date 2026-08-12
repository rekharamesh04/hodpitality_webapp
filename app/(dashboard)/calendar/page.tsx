'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SpaAppointment, AppointmentStatus, CalendarStaff } from '@/types';
import NewAppointmentDialog from '@/components/dialogs/NewAppointmentDialog';
import { appointmentService } from '@/services/appointment.service';
import { staffService } from '@/services/staff.service';

const REFERENCE_DATE = new Date('2026-08-06');
const HOUR_START = 8;
const HOUR_END = 18;
const SLOT_HEIGHT = 64;

const STATUS_STYLES: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  scheduled:  { bg: 'bg-blue-100 border-blue-400',   text: 'text-blue-800',  label: 'Scheduled' },
  checked_in: { bg: 'bg-green-100 border-green-400',  text: 'text-green-800', label: 'Checked in' },
  completed:  { bg: 'bg-gray-100 border-gray-400',    text: 'text-gray-600',  label: 'Completed' },
  cancelled:  { bg: 'bg-red-50 border-red-300',       text: 'text-red-600',   label: 'Cancelled' },
  no_show:    { bg: 'bg-orange-50 border-orange-300', text: 'text-orange-700', label: 'No-show' },
};

// Rooms derived from loaded appointments
const FALLBACK_ROOMS: string[] = [];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function timeToDecimal(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

function AppointmentBlock({ appt, onClick }: { appt: SpaAppointment; onClick: (a: SpaAppointment) => void }) {
  const style = STATUS_STYLES[appt.status];
  const top    = (timeToDecimal(appt.startTime) - HOUR_START) * SLOT_HEIGHT;
  const height = (appt.duration / 60) * SLOT_HEIGHT;
  return (
    <div
      className={`absolute left-1 right-1 rounded border-l-2 ${style.bg} ${style.text} px-2 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
      style={{ top: `${top}px`, height: `${Math.max(height, 28)}px` }}
      onClick={() => onClick(appt)}
    >
      <p className="text-xs font-semibold truncate leading-tight">{appt.customerName}</p>
      <p className="text-xs opacity-75 truncate leading-tight">{appt.service}</p>
      {height >= 40 && <p className="text-xs opacity-60 truncate">{appt.staffName}</p>}
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate]   = useState(REFERENCE_DATE);
  const [selectedRoom, setSelectedRoom] = useState<string>('All');
  const [selectedAppt, setSelectedAppt] = useState<SpaAppointment | null>(null);
  const [newApptOpen, setNewApptOpen]   = useState(false);
  const [appointments, setAppointments] = useState<SpaAppointment[]>([]);
  const [calendarStaff, setCalendarStaff] = useState<CalendarStaff[]>([]);

  useEffect(() => {
    appointmentService.getAppointments({ limit: 200 }).then((res) => {
      setAppointments((res.data as unknown as SpaAppointment[]) ?? []);
    }).catch(() => {});
    staffService.getStaff({ limit: 50 }).then((res) => {
      const mapped: CalendarStaff[] = (res.data ?? []).map((s) => ({
        id: s.id,
        shortName: s.name.split(' ')[0],
        rooms: (s as any).rooms ?? '',
      }));
      setCalendarStaff(mapped);
    }).catch(() => {});
  }, []);

  const ALL_ROOMS = Array.from(new Set(appointments.map((a) => a.room).filter(Boolean)));

  const dateKey = toISODate(currentDate);

  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.date === dateKey),
    [appointments, dateKey]
  );

  // Appointments filtered by room (or all)
  const visibleAppointments = useMemo(
    () => selectedRoom === 'All' ? dayAppointments : dayAppointments.filter((a) => a.room === selectedRoom),
    [dayAppointments, selectedRoom]
  );

  const onSiteCount = dayAppointments.filter((a) => a.status === 'checked_in').length;

  const goToday = () => setCurrentDate(REFERENCE_DATE);
  const goPrev  = () => setCurrentDate((d) => addDays(d, -1));
  const goNext  = () => setCurrentDate((d) => addDays(d, 1));

  function handleStatusChange(id: string, newStatus: AppointmentStatus) {
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
    setSelectedAppt(null);
  }

  function handleAddAppointment(appt: Omit<SpaAppointment, 'id'>) {
    setAppointments((prev) => [...prev, { ...appt, id: `a${Date.now()}` }]);
  }

  const totalHours = HOUR_END - HOUR_START;
  const hours      = Array.from({ length: totalHours }, (_, i) => HOUR_START + i);
  const gridHeight = totalHours * SLOT_HEIGHT;

  // Staff assigned to the selected room (for column header)
  const roomStaff = selectedRoom === 'All'
    ? null
    : calendarStaff.find((s) => s.rooms.includes(selectedRoom.replace('Room ', '')));

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate sm:text-2xl">{formatDate(currentDate)}</h1>
          <p className="text-sm text-muted-foreground">
            Harbor Street &middot; {visibleAppointments.length} appointment{visibleAppointments.length !== 1 ? 's' : ''} &middot; {onSiteCount} on site
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Day navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goPrev}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
            <Button variant="outline" size="icon" onClick={goNext}><ChevronRight className="h-4 w-4" /></Button>
          </div>

          {/* Room dropdown */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All rooms</option>
            {ALL_ROOMS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <Button size="sm" onClick={() => setNewApptOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New appointment
          </Button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {(Object.entries(STATUS_STYLES) as [AppointmentStatus, typeof STATUS_STYLES[AppointmentStatus]][]).map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm border ${s.bg}`} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Mobile: appointment list */}
      <div className="md:hidden space-y-3">
        {visibleAppointments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No appointments.</p>
        )}
        {[...visibleAppointments]
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .map((appt) => {
            const style = STATUS_STYLES[appt.status];
            const [h, m] = appt.startTime.split(':').map(Number);
            const ampm = h < 12 ? 'am' : 'pm';
            const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
            return (
              <div
                key={appt.id}
                className={`flex gap-3 rounded-lg border-l-4 border p-3 cursor-pointer ${style.bg}`}
                onClick={() => setSelectedAppt(appt)}
              >
                <div className="w-14 shrink-0 text-right">
                  <p className={`text-sm font-semibold ${style.text}`}>{dh}:{String(m).padStart(2,'0')}{ampm}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${style.text}`}>{appt.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{appt.service} · {appt.staffName} · {appt.room}</p>
                </div>
                <span className={`shrink-0 self-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
            );
          })}
      </div>

      {/* Desktop: time grid */}
      <div className="hidden md:block flex-1 overflow-auto border rounded-lg bg-background">
        {selectedRoom === 'All' ? (
          /* All rooms — one column per room */
          <div className="flex" style={{ minWidth: `${16 * 4 + ALL_ROOMS.length * 160}px` }}>
            <div className="w-16 shrink-0 border-r">
              <div className="h-10 border-b" />
              <div className="relative" style={{ height: `${gridHeight}px` }}>
                {hours.map((h) => (
                  <div key={h} className="absolute left-0 right-0 flex items-start justify-end pr-2"
                    style={{ top: `${(h - HOUR_START) * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}>
                    <span className="text-xs text-muted-foreground -translate-y-2">
                      {h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {ALL_ROOMS.map((room) => {
              const staff = calendarStaff.find((s) => s.rooms.includes(room.replace('Room ', '')));
              const roomAppts = dayAppointments.filter((a) => a.room === room);
              return (
                <div key={room} className="flex-1 border-r last:border-r-0 min-w-[160px]">
                  <div className="h-10 border-b flex flex-col items-center justify-center px-2">
                    <span className="text-xs font-semibold">{room}</span>
                    {staff && <span className="text-xs text-muted-foreground">{staff.shortName}</span>}
                  </div>
                  <div className="relative" style={{ height: `${gridHeight}px` }}>
                    {hours.map((h) => (
                      <div key={h} className="absolute left-0 right-0 border-t border-dashed border-gray-100"
                        style={{ top: `${(h - HOUR_START) * SLOT_HEIGHT}px` }} />
                    ))}
                    {roomAppts.map((appt) => (
                      <AppointmentBlock key={appt.id} appt={appt} onClick={setSelectedAppt} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single room selected */
          <div className="flex" style={{ minWidth: '400px' }}>
            <div className="w-16 shrink-0 border-r">
              <div className="h-10 border-b" />
              <div className="relative" style={{ height: `${gridHeight}px` }}>
                {hours.map((h) => (
                  <div key={h} className="absolute left-0 right-0 flex items-start justify-end pr-2"
                    style={{ top: `${(h - HOUR_START) * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }}>
                    <span className="text-xs text-muted-foreground -translate-y-2">
                      {h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="h-10 border-b flex flex-col items-center justify-center px-2">
                <span className="text-xs font-semibold">{selectedRoom}</span>
                {roomStaff && <span className="text-xs text-muted-foreground">{roomStaff.shortName}</span>}
              </div>
              <div className="relative" style={{ height: `${gridHeight}px` }}>
                {hours.map((h) => (
                  <div key={h} className="absolute left-0 right-0 border-t border-dashed border-gray-100"
                    style={{ top: `${(h - HOUR_START) * SLOT_HEIGHT}px` }} />
                ))}
                {visibleAppointments.map((appt) => (
                  <AppointmentBlock key={appt.id} appt={appt} onClick={setSelectedAppt} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedAppt && (
        <AppointmentDetailPanel
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      <NewAppointmentDialog
        open={newApptOpen}
        onClose={() => setNewApptOpen(false)}
        onBook={handleAddAppointment}
        defaultDate={dateKey}
      />
    </div>
  );
}
// ─── Appointment detail side-panel ──────────────────────────────────────────

interface PanelProps {
  appt: SpaAppointment;
  onClose: () => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

function AppointmentDetailPanel({ appt, onClose, onStatusChange }: PanelProps) {
  const style = STATUS_STYLES[appt.status];

  const [h, m] = appt.startTime.split(':').map(Number);
  const endMinutes = h * 60 + m + appt.duration;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  const fmtTime = (hh: number, mm: number) => {
    const ampm = hh < 12 ? 'am' : 'pm';
    const displayH = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
    return `${displayH}:${String(mm).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold">Appointment</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Customer */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {appt.customerInitials}
          </div>
          <div>
            <p className="font-medium">{appt.customerName}</p>
            <p className="text-xs text-muted-foreground">{appt.customerPhone}</p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">{appt.customerTier}</Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <Row label="Service" value={appt.service} />
          <Row label="Staff" value={appt.staffName} />
          <Row label="Room" value={appt.room} />
          <Row label="Time" value={`${fmtTime(h, m)} – ${fmtTime(endH, endM)}`} />
          <Row label="Duration" value={`${appt.duration} min`} />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {appt.status === 'scheduled' && (
            <>
              <Button
                className="w-full"
                size="sm"
                onClick={() => onStatusChange(appt.id, 'checked_in')}
              >
                Check in
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => onStatusChange(appt.id, 'cancelled')}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className="w-full text-orange-600"
                size="sm"
                onClick={() => onStatusChange(appt.id, 'no_show')}
              >
                Mark no-show
              </Button>
            </>
          )}
          {appt.status === 'checked_in' && (
            <Button
              className="w-full"
              size="sm"
              onClick={() => onStatusChange(appt.id, 'completed')}
            >
              Complete
            </Button>
          )}
          {(appt.status === 'cancelled' || appt.status === 'no_show') && (
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => onStatusChange(appt.id, 'scheduled')}
            >
              Undo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
