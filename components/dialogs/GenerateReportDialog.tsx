'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { reportService } from '@/services/report.service';
import { exportToCSV, getFriendlyErrorMessage, toLocalDateInput } from '@/lib/utils';

/**
 * POST /reports/export is a backend stub (always returns `{ downloadUrl: "mock-url" }`), so
 * reports are built in the browser from the reporting GET routes instead. Those routes take
 * no date range or filters — each covers the fixed window described below.
 */
const REPORTS = [
  {
    value: 'daily',
    label: 'Daily appointments',
    scope: 'Appointments per day, last 30 days',
    load: async () => (await reportService.getDailyReports()).map((r) => ({ Date: r.date, Appointments: r.count ?? 0 })),
  },
  {
    value: 'guest-arrivals',
    label: "Today's guest arrivals",
    scope: 'Check-ins per hour, today only',
    load: async () => (await reportService.getGuestArrivalsChart()).map((r) => ({ Hour: r.hour, Arrivals: r.arrivals ?? 0 })),
  },
  {
    value: 'monthly-events',
    label: 'Monthly events',
    scope: 'Events per month, last 12 months',
    load: async () => (await reportService.getMonthlyEventsChart()).map((r) => {
      const row = r as unknown as { month?: string; events?: number };
      return { Month: row.month ?? '', Events: row.events ?? 0 };
    }),
  },
  {
    value: 'revenue-trend',
    label: 'Revenue',
    scope: 'Paid revenue per day, last 30 days',
    load: async () => (await reportService.getRevenueTrendChart()).map((r) => ({ Date: r.date, Revenue: r.revenue ?? 0 })),
  },
] as const;

type ReportValue = (typeof REPORTS)[number]['value'];

interface GenerateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateReportDialog({ open, onOpenChange }: GenerateReportDialogProps) {
  const [type, setType] = useState<ReportValue>('daily');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (isGenerating) return;
    if (!next) setError(null);
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const report = REPORTS.find((r) => r.value === type)!;
    setIsGenerating(true);
    setError(null);
    try {
      const rows = await report.load();
      if (rows.length === 0) {
        setError('This report has no data yet for its time window.');
        return;
      }
      exportToCSV(rows, `${report.value}-report-${toLocalDateInput()}`);
      toast.success(`${report.label} report downloaded`);
      onOpenChange(false);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Unable to generate this report.'));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>Downloads a CSV file, which opens in Excel or Google Sheets.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Report</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as ReportValue)} className="grid gap-2">
              {REPORTS.map((r) => (
                <label
                  key={r.value}
                  htmlFor={`report-${r.value}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value={r.value} id={`report-${r.value}`} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.scope}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button type="submit" loading={isGenerating}>
              {isGenerating ? 'Generating…' : 'Download CSV'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
