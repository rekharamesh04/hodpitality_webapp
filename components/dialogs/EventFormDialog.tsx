'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { VenueCombobox } from '@/components/common/VenueCombobox';
import type { CreateEventPayload, UpdateEventPayload } from '@/services/event.service';
import type { Event, Venue } from '@/types';

function getVenueId(v: Venue): string {
  return v.id ?? (v.PK ? v.PK.replace('VENUE#', '') : '') ?? '';
}

interface FormState {
  title: string;
  startDate: string;
  endDate: string;
  venue: Venue | null;
  venueName: string;
  category: string;
  status: string;
  capacity: string;
  organizer: string;
  description: string;
}

function emptyForm(): FormState {
  return {
    title: '', startDate: '', endDate: '', venue: null, venueName: '',
    category: '', status: '', capacity: '', organizer: '', description: '',
  };
}

function toFormState(event: Event): FormState {
  return {
    title: event.title ?? '',
    startDate: (event.startDate ?? event.date ?? '').slice(0, 16),
    endDate: (event.endDate ?? '').slice(0, 16),
    venue: null,
    venueName: event.venue ?? '',
    category: event.category ?? '',
    status: event.status ?? '',
    capacity: event.capacity !== undefined ? String(event.capacity) : '',
    organizer: event.organizer ?? '',
    description: event.description ?? '',
  };
}

/** `isEditing` mirrors the pattern proven necessary for Guest/Customer/Venue edits: the
 * backend's UpdateItem call needs free-text fields present in the body even blank, or it can
 * 500 on a missing DynamoDB expression attribute value. Create omits blank optional fields so
 * the backend can default a brand-new item. */
function toPayload(form: FormState, isEditing: boolean): CreateEventPayload {
  const payload: CreateEventPayload = {
    title: form.title.trim(),
    startDate: form.startDate,
  };
  if (isEditing || form.endDate)              payload.endDate = form.endDate || undefined;
  const venueName = form.venue?.name ?? form.venueName;
  if (isEditing || venueName.trim())          payload.venue = venueName.trim();
  if (form.venue)                             payload.venueId = getVenueId(form.venue);
  if (isEditing || form.category.trim())      payload.category = form.category.trim();
  if (form.status)                            payload.status = form.status as Event['status'];
  if (form.capacity !== '')                   payload.capacity = Number(form.capacity);
  if (isEditing || form.organizer.trim())     payload.organizer = form.organizer.trim();
  if (isEditing || form.description.trim())   payload.description = form.description.trim();
  return payload;
}

type FieldErrors = Partial<Record<'title' | 'startDate' | 'endDate' | 'capacity', string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.startDate) errors.startDate = 'Start date is required';
  else if (isNaN(new Date(form.startDate).getTime())) errors.startDate = 'Enter a valid start date';
  if (form.endDate) {
    const start = new Date(form.startDate).getTime();
    const end = new Date(form.endDate).getTime();
    if (isNaN(end)) errors.endDate = 'Enter a valid end date';
    else if (!isNaN(start) && end < start) errors.endDate = 'End date cannot be before the start date';
  }
  if (form.capacity !== '' && (!Number.isFinite(Number(form.capacity)) || Number(form.capacity) <= 0)) {
    errors.capacity = 'Enter a capacity greater than 0';
  }
  return errors;
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  statusOptions: string[];
  categoryOptions: string[];
  onSubmit: (payload: CreateEventPayload | UpdateEventPayload) => void;
}

export function EventFormDialog({
  open, onOpenChange, event, isSubmitting, submitError, statusOptions, categoryOptions, onSubmit,
}: EventFormDialogProps) {
  const isEditing = !!event;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setForm(event ? toFormState(event) : emptyForm());
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key as keyof FieldErrors]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    onSubmit(toPayload(form, isEditing));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this event’s details.' : 'Schedule a new event.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {submitError && (
              <Alert variant="destructive" className="sm:col-span-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Annual Hospitality Summit"
                aria-invalid={!!fieldErrors.title}
                aria-describedby={fieldErrors.title ? 'event-title-error' : undefined}
              />
              {fieldErrors.title && <p id="event-title-error" className="text-xs text-destructive">{fieldErrors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-start">Start Date *</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => update('startDate', e.target.value)}
                aria-invalid={!!fieldErrors.startDate}
                aria-describedby={fieldErrors.startDate ? 'event-start-error' : undefined}
              />
              {fieldErrors.startDate && <p id="event-start-error" className="text-xs text-destructive">{fieldErrors.startDate}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-end">End Date</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => update('endDate', e.target.value)}
                aria-invalid={!!fieldErrors.endDate}
                aria-describedby={fieldErrors.endDate ? 'event-end-error' : undefined}
              />
              {fieldErrors.endDate && <p id="event-end-error" className="text-xs text-destructive">{fieldErrors.endDate}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Venue</Label>
              <VenueCombobox
                selected={form.venue}
                onSelectVenue={(v) => update('venue', v)}
                disabled={isSubmitting}
              />
              {!form.venue && form.venueName && (
                <p className="text-xs text-muted-foreground">Currently set to “{form.venueName}” (not linked to a Venue record) — pick one above to link it.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-category">Category</Label>
              <Input
                id="event-category"
                list="event-category-options"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                placeholder="Conference, Workshop…"
              />
              <datalist id="event-category-options">
                {categoryOptions.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-status">Status</Label>
              <Select value={form.status || undefined} onValueChange={(v) => update('status', v)}>
                <SelectTrigger id="event-status"><SelectValue placeholder="Backend default" /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-capacity">Capacity</Label>
              <Input
                id="event-capacity"
                type="number"
                min="1"
                step="1"
                value={form.capacity}
                onChange={(e) => update('capacity', e.target.value)}
                placeholder="500"
                aria-invalid={!!fieldErrors.capacity}
                aria-describedby={fieldErrors.capacity ? 'event-capacity-error' : undefined}
              />
              {fieldErrors.capacity && <p id="event-capacity-error" className="text-xs text-destructive">{fieldErrors.capacity}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-organizer">Organizer</Label>
              <Input id="event-organizer" value={form.organizer} onChange={(e) => update('organizer', e.target.value)} placeholder="EntryFlow Events" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea id="event-description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Short description" rows={3} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
