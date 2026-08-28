'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Staff } from '@/types';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function toScheduleForm(staff: Staff | null): Record<string, string> {
  const raw = (staff?.schedule ?? {}) as Record<string, unknown>;
  const form: Record<string, string> = {};
  DAYS.forEach((day) => { form[day] = typeof raw[day] === 'string' ? (raw[day] as string) : ''; });
  return form;
}

interface StaffScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff | null;
  isSubmitting?: boolean;
  onSubmit: (schedule: Record<string, string>) => void;
}

/** Sets the weekly schedule field the Staff record already supports (`schedule: Record<string, unknown>`,
 * confirmed on the type) via the existing PUT /staff/{id}/schedule endpoint. This is just editing that
 * field's day→hours entries — it doesn't lock or reserve anything; the appointment-booking backend owns
 * schedule-conflict locking based on staffId/date/startTime, and this dialog never touches that. */
export function StaffScheduleDialog({ open, onOpenChange, staff, isSubmitting, onSubmit }: StaffScheduleDialogProps) {
  const [schedule, setSchedule] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setSchedule(toScheduleForm(staff));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff?.id]);

  function handleSubmit() {
    const cleaned = Object.fromEntries(Object.entries(schedule).filter(([, v]) => v.trim() !== ''));
    onSubmit(cleaned);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Schedule</DialogTitle>
          <DialogDescription>{staff?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <Label htmlFor={`schedule-${day}`} className="w-10 shrink-0 capitalize">{day}</Label>
              <Input
                id={`schedule-${day}`}
                placeholder="HH:MM-HH:MM (blank = off)"
                value={schedule[day] ?? ''}
                onChange={(e) => setSchedule((p) => ({ ...p, [day]: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
