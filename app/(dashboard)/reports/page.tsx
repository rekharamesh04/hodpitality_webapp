'use client';

import { useState } from 'react';
import { BarChart2, Download, FileText, TrendingUp, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useDashboardStats, useDailyReports, useExportReport } from '@/hooks/useReports';

const REPORT_TYPES = [
  { id: 'daily',   name: 'Daily Check-in',    description: 'Guest check-in activity',   icon: Users      },
  { id: 'guest',   name: 'Guest Arrivals',     description: 'Arrival flow breakdown',    icon: TrendingUp },
  { id: 'monthly', name: 'Monthly Events',     description: 'Event attendance by month', icon: Calendar   },
  { id: 'revenue', name: 'Revenue Trend',      description: 'Revenue trend over time',   icon: BarChart2  },
];

export default function ReportsPage() {
  const [exportDialog, setExportDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('daily');
  const [format, setFormat]             = useState<'pdf' | 'excel'>('pdf');

  const { data: stats }    = useDashboardStats();
  const { data: dailyRaw } = useDailyReports(7);
  const exportReport       = useExportReport();

  const daily = Array.isArray(dailyRaw) ? dailyRaw : (dailyRaw as any)?.data ?? [];

  function handleExport() {
    exportReport.mutate(
      { type: selectedType, format },
      { onSuccess: () => setExportDialog(false) }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and download detailed reports</p>
        </div>
        <Button size="sm" onClick={() => setExportDialog(true)}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Live stats from GET /reports/dashboard-stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Today's Check-ins",  value: stats?.todayCheckIns      ?? '—' },
          { label: 'Total Guests',       value: stats?.totalGuests         ?? '—' },
          { label: 'Total Events',       value: stats?.totalEvents         ?? '—' },
          { label: 'Venue Occupancy',    value: stats?.venueOccupancy != null ? `${stats.venueOccupancy}%` : '—' },
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

      {/* Report types */}
      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
          <CardDescription>Click Generate to export any report as PDF or Excel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {REPORT_TYPES.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="card-hover cursor-pointer">
                  <CardContent className="flex items-start gap-3 pt-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-tight">{report.name}</h3>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => {
                          setSelectedType(report.id);
                          setExportDialog(true);
                        }}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily report data from GET /reports/daily */}
      {daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Reports (Last 7 Days)</CardTitle>
            <CardDescription>Check-ins and registrations per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {daily.map((d: any, i: number) => (
                <div key={d.date ?? i} className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <p className="font-medium text-sm">{d.date}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Check-ins: <span className="font-medium text-foreground">{d.checkIns ?? 0}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Registrations: <span className="font-medium text-foreground">{d.registrations ?? 0}</span>
                    </span>
                    {d.revenue != null && (
                      <span className="text-muted-foreground">
                        Revenue: <span className="font-medium text-foreground">${d.revenue}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialog} onOpenChange={setExportDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Report Type</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Format</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                value={format}
                onChange={(e) => setFormat(e.target.value as 'pdf' | 'excel')}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialog(false)}>Cancel</Button>
            <Button onClick={handleExport} disabled={exportReport.isPending}>
              {exportReport.isPending ? 'Generating…' : 'Export'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}