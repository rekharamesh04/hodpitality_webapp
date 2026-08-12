'use client';

import { useState } from 'react';
import { Calendar, Plus, MapPin, Users, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import {
  useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useUpcomingEvents,
} from '@/hooks/useEvents';
import type { Event } from '@/types';

type EventForm = {
  title: string; startDate: string; endDate: string;
  venue: string; capacity: string; description: string;
};
const EMPTY_FORM: EventForm = { title: '', startDate: '', endDate: '', venue: '', capacity: '', description: '' };

export default function EventsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Event | null>(null);
  const [form, setForm]             = useState<EventForm>(EMPTY_FORM);

  const { data, isLoading }       = useEvents();
  const { data: upcomingRaw }     = useUpcomingEvents();
  const events   = data?.data ?? [];
  const upcoming = Array.isArray(upcomingRaw) ? upcomingRaw : ((upcomingRaw as any)?.data ?? []);

  const create = useCreateEvent();
  const update = useUpdateEvent();
  const remove = useDeleteEvent();

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); }

  function openEdit(e: Event) {
    setEditing(e);
    setForm({
      title:       e.title ?? '',
      startDate:   (e.startDate ?? e.date ?? '').slice(0, 16),
      endDate:     (e.endDate ?? '').slice(0, 16),
      venue:       e.venue ?? '',
      capacity:    String(e.capacity ?? ''),
      description: e.description ?? '',
    });
    setDialogOpen(true);
  }

  function handleSubmit() {
    const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined };
    const eventId = editing?.id ?? editing?.PK?.replace('EVENT#', '');
    if (editing && eventId) {
      update.mutate({ id: eventId, data: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const isPending       = create.isPending || update.isPending;
  const totalAttendees  = events.reduce((acc, e) => acc + (e.attendees ?? e.registered ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage and schedule events</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Events',    value: events.length },
          { label: 'Active Events',   value: events.filter((e) => !e.is_deleted).length },
          { label: 'Upcoming',        value: upcoming.length },
          { label: 'Total Attendees', value: totalAttendees },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading && <p className="text-muted-foreground col-span-2">Loading events…</p>}
        {!isLoading && events.length === 0 && (
          <p className="text-muted-foreground col-span-2">No events found. Create one above.</p>
        )}
        {events.map((event) => {
          const eventId        = event.id ?? event.PK?.replace('EVENT#', '') ?? '';
          const attendees      = event.attendees ?? event.registered ?? 0;
          const capacity       = event.capacity ?? 0;
          const capacityPct    = capacity > 0 ? (attendees / capacity) * 100 : 0;
          const startDate      = event.startDate ?? event.date ?? '';
          return (
            <Card key={eventId} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="truncate">{event.title}</CardTitle>
                    {event.description && (
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {event.category && <Badge>{event.category}</Badge>}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(event)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => remove.mutate(eventId)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {startDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(startDate)}{event.endDate ? ` – ${formatDate(event.endDate)}` : ''}</span>
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue}</span>
                  </div>
                )}
                {capacity > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Capacity</span>
                      </div>
                      <span className="font-medium">{attendees} / {capacity}</span>
                    </div>
                    <Progress value={capacityPct} />
                  </div>
                ) : attendees > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{attendees} registered</span>
                  </div>
                ) : null}
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                  <Button size="sm" className="flex-1">Manage</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Event' : 'Create Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>End Date</Label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Venue</Label>
                <Input value={form.venue} onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))} placeholder="Venue name" />
              </div>
              <div className="space-y-1">
                <Label>Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="500" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !form.title}>
              {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
