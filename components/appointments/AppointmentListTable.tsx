'use client';

import { CalendarOff } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { AppointmentStatusMenu } from '@/components/appointments/AppointmentStatusMenu';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TableSkeleton } from '@/components/common/SkeletonLoader';
import { cn, formatTimeLabel, addMinutesToTime, getFriendlyErrorMessage } from '@/lib/utils';
import { APPOINTMENT_STATUS_STYLES, APPOINTMENT_STATUS_LABELS } from '@/constants/appointment';
import type { Appointment } from '@/types';

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  refunded: 'bg-purple-100 text-purple-700 border-purple-200',
};

interface AppointmentListTableProps {
  appointments: Appointment[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onSelect?: (appointment: Appointment) => void;
}

export function AppointmentListTable({
  appointments, isLoading, isError, error, onRetry, onSelect,
}: AppointmentListTableProps) {
  if (isLoading) {
    return (
      <div className="p-4">
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load appointments"
          message={getFriendlyErrorMessage(error)}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={CalendarOff}
          title="No appointments scheduled"
          description="There are no appointments for this day."
        />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Service</TableHead>
          <TableHead className="hidden sm:table-cell">Staff</TableHead>
          <TableHead className="hidden md:table-cell">Time</TableHead>
          <TableHead className="hidden md:table-cell">Duration</TableHead>
          <TableHead className="hidden lg:table-cell">Room</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((a) => {
          const status = a.status ?? 'scheduled';
          const paymentStatus = a.paymentStatus ?? 'pending';
          const endTime = a.endTime ?? (a.startTime && a.duration ? addMinutesToTime(a.startTime, a.duration) : undefined);
          const id = a.id ?? a.PK ?? '';
          return (
            <TableRow
              key={id}
              className={onSelect ? 'cursor-pointer' : undefined}
              onClick={() => onSelect?.(a)}
            >
              <TableCell className="font-medium">{a.customerName ?? a.guestName ?? '—'}</TableCell>
              <TableCell>{a.serviceName ?? a.service ?? '—'}</TableCell>
              <TableCell className="hidden sm:table-cell">{a.staffName ?? '—'}</TableCell>
              <TableCell className="hidden md:table-cell">
                {formatTimeLabel(a.startTime)}{endTime ? `–${formatTimeLabel(endTime)}` : ''}
              </TableCell>
              <TableCell className="hidden md:table-cell">{a.duration ? `${a.duration} min` : '—'}</TableCell>
              <TableCell className="hidden lg:table-cell">{a.room ?? '—'}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                    APPOINTMENT_STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border-gray-300'
                  )}
                >
                  {APPOINTMENT_STATUS_LABELS[status] ?? status}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize',
                    PAYMENT_STATUS_STYLES[paymentStatus] ?? 'bg-gray-100 text-gray-700 border-gray-300'
                  )}
                >
                  {paymentStatus}
                </span>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <AppointmentStatusMenu appointmentId={id} currentStatus={a.status} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
