'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadService } from '@/services/upload.service';
import type { CreateVenuePayload, UpdateVenuePayload } from '@/services/venue.service';
import type { Venue } from '@/types';

interface FormState {
  name: string;
  capacity: string;
  type: string;
  location: string;
  status: string;
  amenities: string;
  image: string;
}

const EMPTY_FORM: FormState = { name: '', capacity: '', type: '', location: '', status: 'active', amenities: '', image: '' };

function toFormState(venue: Venue): FormState {
  return {
    name: venue.name ?? '',
    capacity: venue.capacity !== undefined ? String(venue.capacity) : '',
    type: venue.type ?? '',
    location: venue.location ?? '',
    status: venue.status ?? 'active',
    amenities: (venue.amenities ?? []).join(', '),
    image: venue.image ?? '',
  };
}

/** `isEditing` mirrors the pattern proven necessary for Guest/Customer edits: the backend's
 * UpdateItem call needs every free-text field it knows about present in the body, even blank,
 * or it can 500 on a missing DynamoDB expression attribute value. On create, blank optional
 * fields are omitted so the backend can apply its own defaults for a brand-new item. */
function toPayload(form: FormState, isEditing: boolean): CreateVenuePayload {
  const payload: CreateVenuePayload = {
    name: form.name.trim(),
    capacity: Number(form.capacity) || 0,
  };
  if (isEditing || form.type.trim())     payload.type = form.type.trim();
  if (isEditing || form.location.trim()) payload.location = form.location.trim();
  if (form.status)                       payload.status = form.status as Venue['status'];
  const amenities = form.amenities.split(',').map((a) => a.trim()).filter(Boolean);
  if (isEditing || amenities.length)     payload.amenities = amenities;
  if (form.image)                        payload.image = form.image;
  return payload;
}

type FieldErrors = Partial<Record<'name' | 'capacity', string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.capacity.trim()) errors.capacity = 'Capacity is required';
  else if (!Number.isFinite(Number(form.capacity)) || Number(form.capacity) <= 0) {
    errors.capacity = 'Enter a capacity greater than 0';
  }
  return errors;
}

interface VenueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue?: Venue | null;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (payload: CreateVenuePayload | UpdateVenuePayload) => void;
}

export function VenueFormDialog({
  open, onOpenChange, venue, isSubmitting, submitError, onSubmit,
}: VenueFormDialogProps) {
  const isEditing = !!venue;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (open) {
      setForm(venue ? toFormState(venue) : EMPTY_FORM);
      setFieldErrors({});
      setUploadState('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, venue?.id]);

  async function handleImageSelect(file: File | undefined) {
    if (!file) return;
    setUploadState('uploading');
    try {
      const fileUrl = await uploadService.uploadFile(file);
      update('image', fileUrl);
      setUploadState('success');
    } catch {
      setUploadState('error');
      toast.error('Image upload failed. Please try again.');
    }
  }

  function update<K extends keyof FormState>(key: K, value: string) {
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
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Venue' : 'Add Venue'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this venue’s details.' : 'Add a new venue record.'}
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
              <Label htmlFor="venue-name">Name *</Label>
              <Input
                id="venue-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Grand Ballroom"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'venue-name-error' : undefined}
              />
              {fieldErrors.name && <p id="venue-name-error" className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue-capacity">Capacity *</Label>
              <Input
                id="venue-capacity"
                type="number"
                min="1"
                step="1"
                value={form.capacity}
                onChange={(e) => update('capacity', e.target.value)}
                placeholder="500"
                aria-invalid={!!fieldErrors.capacity}
                aria-describedby={fieldErrors.capacity ? 'venue-capacity-error' : undefined}
              />
              {fieldErrors.capacity && <p id="venue-capacity-error" className="text-xs text-destructive">{fieldErrors.capacity}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger id="venue-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue-type">Type</Label>
              <Input id="venue-type" value={form.type} onChange={(e) => update('type', e.target.value)} placeholder="Ballroom, Meeting Room…" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue-location">Location</Label>
              <Input id="venue-location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Level 1" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="venue-amenities">Amenities</Label>
              <Input
                id="venue-amenities"
                value={form.amenities}
                onChange={(e) => update('amenities', e.target.value)}
                placeholder="AV Equipment, Stage, Catering (comma-separated)"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="venue-image">Photo</Label>
              <div className="flex items-center gap-3">
                {form.image ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-0.5 top-0.5 rounded-full bg-background/80 p-0.5"
                      onClick={() => { update('image', ''); setUploadState('idle'); }}
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                    {uploadState === 'uploading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="venue-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e.target.files?.[0])}
                    disabled={uploadState === 'uploading'}
                  />
                  {uploadState === 'error' && <p className="mt-1 text-xs text-destructive">Upload failed — try again.</p>}
                  {uploadState === 'success' && <p className="mt-1 text-xs text-success">Uploaded.</p>}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Venue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
