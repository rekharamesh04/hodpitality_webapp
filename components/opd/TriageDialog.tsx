'use client';

import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PriorityPicker } from '@/components/opd/PriorityPicker';
import { BP_PATTERN, VITAL_LIMITS, visitPriorityOf } from '@/constants/opd';
import { useRecordTriage } from '@/hooks/useOpd';
import { useAuthStore } from '@/store';
import type { Appointment, Triage, VisitPriority } from '@/types';

type NumericVital = keyof typeof VITAL_LIMITS;

interface FormState {
  bp: string;
  pulse: string;
  temperature: string;
  spo2: string;
  weight: string;
  complaint: string;
  priority: VisitPriority;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function toForm(a: Appointment): FormState {
  const t = a.triage ?? {};
  const str = (v?: number) => (v === undefined || v === null ? '' : String(v));
  return {
    bp: t.bp ?? '',
    pulse: str(t.pulse),
    temperature: str(t.temperature),
    spo2: str(t.spo2),
    weight: str(t.weight),
    complaint: t.complaint ?? '',
    priority: visitPriorityOf(a),
  };
}

const NUMERIC_LABEL: Record<NumericVital, string> = {
  pulse: 'Pulse', temperature: 'Temperature', spo2: 'SpO₂', weight: 'Weight',
};

/** Blank means "not measured" and is allowed; anything typed must be a plausible reading. */
function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (form.bp.trim() && !BP_PATTERN.test(form.bp.trim())) errors.bp = 'Write it as systolic/diastolic, e.g. 120/80';
  for (const key of Object.keys(VITAL_LIMITS) as NumericVital[]) {
    const raw = form[key].trim();
    if (!raw) continue;
    const n = Number(raw);
    const { min, max, unit } = VITAL_LIMITS[key];
    if (!Number.isFinite(n) || n < min || n > max) {
      errors[key] = `${NUMERIC_LABEL[key]} should be between ${min} and ${max} ${unit}`;
    }
  }
  return errors;
}

function toTriage(form: FormState, recordedBy: string): Triage {
  const num = (v: string) => (v.trim() ? Number(v) : undefined);
  return {
    bp: form.bp.trim() ? form.bp.replace(/\s+/g, '') : undefined,
    pulse: num(form.pulse),
    temperature: num(form.temperature),
    spo2: num(form.spo2),
    weight: num(form.weight),
    complaint: form.complaint.trim() || undefined,
    recordedAt: new Date().toISOString(),
    recordedBy,
  };
}

/**
 * Triage: the nurse's vitals and the visit's priority, before the doctor.
 *
 * Every vital is optional — a busy OPD often takes only BP and temperature — and
 * priority is the one decision that changes the queue: Emergency jumps it.
 */
export function TriageDialog({
  open, onOpenChange, appointment, token,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  token?: number;
}) {
  const recordTriage = useRecordTriage();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open && appointment) {
      setForm(toForm(appointment));
      setErrors({});
    }
    // Read once per opening, so a background refetch cannot wipe what is being typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id]);

  if (!appointment || !form) return null;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !appointment || recordTriage.isPending) return;
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    recordTriage.mutate(
      { id: appointment.id, triage: toTriage(form, user?.name || user?.email || ''), visitPriority: form.priority },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const vital = (key: NumericVital, label: string, placeholder: string, step = '1') => (
    <div className="space-y-1.5">
      <Label htmlFor={`triage-${key}`}>{label}</Label>
      <Input
        id={`triage-${key}`}
        inputMode="decimal"
        type="number"
        step={step}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
        aria-invalid={!!errors[key]}
        disabled={recordTriage.isPending}
      />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !recordTriage.isPending && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Triage{token ? ` · Token ${token}` : ''}</DialogTitle>
            <DialogDescription>
              {appointment.customerName || appointment.guestName}
              {appointment.staffName ? ` · for ${appointment.staffName}` : ''}. Leave anything not measured blank.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="triage-priority">Priority</Label>
              <PriorityPicker
                id="triage-priority"
                value={form.priority}
                onChange={(p) => update('priority', p)}
                disabled={recordTriage.isPending}
              />
              {form.priority === 'emergency' && (
                <p className="text-xs text-red-700 dark:text-red-400">Goes to the front of the queue.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="triage-bp">Blood pressure</Label>
                <Input
                  id="triage-bp"
                  placeholder="120/80"
                  value={form.bp}
                  onChange={(e) => update('bp', e.target.value)}
                  aria-invalid={!!errors.bp}
                  disabled={recordTriage.isPending}
                />
                {errors.bp && <p className="text-xs text-destructive">{errors.bp}</p>}
              </div>
              {vital('pulse', 'Pulse (bpm)', '72')}
              {vital('temperature', 'Temperature (°F)', '98.6', '0.1')}
              {vital('spo2', 'SpO₂ (%)', '98')}
              {vital('weight', 'Weight (kg)', '65', '0.1')}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="triage-complaint">Complaint</Label>
              <Textarea
                id="triage-complaint"
                rows={2}
                placeholder="In the patient's words — fever for three days, chest pain…"
                value={form.complaint}
                onChange={(e) => update('complaint', e.target.value)}
                disabled={recordTriage.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={recordTriage.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={recordTriage.isPending}>Save triage</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
