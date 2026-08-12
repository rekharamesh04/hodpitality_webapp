'use client';

import { useState } from 'react';
import { QrCode, UserCheck, Printer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  useCheckIns, useCheckInStats, useCheckIn, useQrCheckIn, usePrintBadge,
} from '@/hooks/useCheckins';

type CheckMode = 'quick' | 'qr' | null;

const METHOD_BADGE: Record<string, string> = {
  manual:             'bg-gray-100 text-gray-700',
  qr:                 'bg-blue-100 text-blue-800',
  qr_scan:            'bg-blue-100 text-blue-800',
  facial_recognition: 'bg-purple-100 text-purple-800',
  quick:              'bg-green-100 text-green-800',
};

export default function CheckInsPage() {
  const [checkMode, setCheckMode] = useState<CheckMode>(null);
  const [guestId, setGuestId]     = useState('');
  const [qrCode, setQrCode]       = useState('');

  const { data: checkInsData, isLoading, refetch } = useCheckIns();
  const { data: stats }                            = useCheckInStats();
  const checkIns = checkInsData?.data ?? [];

  const quickCheckIn = useCheckIn();
  const qrCheckIn    = useQrCheckIn();
  const printBadge   = usePrintBadge();

  function handleQuickCheckIn() {
    if (!guestId.trim()) return;
    quickCheckIn.mutate(
      { guestId: guestId.trim() },
      { onSuccess: () => { setCheckMode(null); setGuestId(''); } }
    );
  }

  function handleQrCheckIn() {
    if (!qrCode.trim()) return;
    qrCheckIn.mutate(
      { qrCode: qrCode.trim() },
      { onSuccess: () => { setCheckMode(null); setQrCode(''); } }
    );
  }

  const STAT_CARDS = [
    { label: 'Expected',  value: stats?.expected  ?? 0, color: 'text-blue-700'   },
    { label: 'Arrived',   value: stats?.arrived   ?? 0, color: 'text-teal-700'   },
    { label: 'On Site',   value: stats?.onSite    ?? 0, color: 'text-green-700'  },
    { label: 'Completed', value: stats?.completed ?? 0, color: 'text-gray-700'   },
    { label: 'No Shows',  value: stats?.noShows   ?? 0, color: 'text-orange-700' },
    { label: 'Cancelled', value: stats?.cancelled ?? 0, color: 'text-red-600'    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Check-ins</h1>
          <p className="text-sm text-muted-foreground">Live check-in management</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCheckMode('qr')}>
            <QrCode className="mr-2 h-4 w-4" />
            QR Scan
          </Button>
          <Button size="sm" onClick={() => setCheckMode('quick')}>
            <UserCheck className="mr-2 h-4 w-4" />
            Check In
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Check-in list */}
      <div className="border rounded-lg overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest ID</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="hidden sm:table-cell">Timestamp</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  Loading check-ins…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && checkIns.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                  No check-ins yet.
                </TableCell>
              </TableRow>
            )}
            {checkIns.map((ci) => {
              const ciId   = ci.id ?? ci.PK?.replace('CHECKIN#', '') ?? '';
              const method = ci.method ?? ci.checkInMethod ?? 'manual';
              const ts     = ci.timestamp ?? ci.checkInTime ?? '';
              return (
                <TableRow key={ciId}>
                  <TableCell className="font-mono text-sm">{ci.guestId}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${METHOD_BADGE[method] ?? METHOD_BADGE.manual}`}>
                      {method.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {ts ? new Date(ts).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => printBadge.mutate(ciId)}
                      disabled={printBadge.isPending}
                    >
                      <Printer className="mr-1 h-3 w-3" />
                      Badge
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Quick Check-in Dialog */}
      <Dialog open={checkMode === 'quick'} onOpenChange={(v) => !v && setCheckMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Quick Check-in</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Guest ID</Label>
              <Input
                value={guestId}
                onChange={(e) => setGuestId(e.target.value)}
                placeholder="Enter guest ID"
                onKeyDown={(e) => e.key === 'Enter' && handleQuickCheckIn()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckMode(null)}>Cancel</Button>
            <Button onClick={handleQuickCheckIn} disabled={quickCheckIn.isPending || !guestId.trim()}>
              {quickCheckIn.isPending ? 'Checking in…' : 'Check In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Check-in Dialog */}
      <Dialog open={checkMode === 'qr'} onOpenChange={(v) => !v && setCheckMode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>QR Code Check-in</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>QR Code</Label>
              <Input
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Scan or enter QR code"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleQrCheckIn()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckMode(null)}>Cancel</Button>
            <Button onClick={handleQrCheckIn} disabled={qrCheckIn.isPending || !qrCode.trim()}>
              {qrCheckIn.isPending ? 'Processing…' : 'Scan & Check In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

