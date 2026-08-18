'use client';

import { useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompleteRegistrationDialog } from '@/components/dialogs/CompleteRegistrationDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Registration } from '@/types';

export default function RegistrationsPage() {
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const { data: regs, isLoading } = useQuery<Registration[]>({
    queryKey: ['registrations'],
    queryFn: async () => {
      const r = await api.get('/registrations?limit=50');
      const raw = r.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    },
  });
  const registrations = regs ?? [];
  const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
  const pending   = registrations.filter((r) => r.status === 'pending').length;
  const revenue   = registrations.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registrations</h1>
          <p className="text-muted-foreground">Track event registrations and payments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={() => setRegistrationDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Complete Registration
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue >= 1000 ? `${(revenue / 1000).toFixed(1)}K` : revenue}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration List</CardTitle>
          <CardDescription>All event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="font-medium">{reg.guestName}</div>
                    <div className="text-sm text-muted-foreground">{reg.guestEmail}</div>
                  </TableCell>
                  <TableCell>{reg.event}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reg.category}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(reg.registrationDate)}</TableCell>
                  <TableCell>
                    <StatusBadge status={reg.status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={reg.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                      {reg.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{reg.amount && formatCurrency(reg.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Complete Registration Dialog */}
      <CompleteRegistrationDialog
        open={registrationDialogOpen}
        onOpenChange={setRegistrationDialogOpen}
      />
    </div>
  );
}
