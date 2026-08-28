'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { getManualStatusActions, APPOINTMENT_STATUS_LABELS, type AppointmentStatusOption } from '@/constants/appointment';
import { cn } from '@/lib/utils';

interface AppointmentStatusMenuProps {
  appointmentId: string;
  currentStatus?: string;
  size?: 'sm' | 'default';
}

export function AppointmentStatusMenu({ appointmentId, currentStatus, size = 'sm' }: AppointmentStatusMenuProps) {
  const updateStatus = useUpdateAppointmentStatus();
  const [confirmAction, setConfirmAction] = useState<'cancelled' | 'no-show' | null>(null);

  const actions = getManualStatusActions(currentStatus);
  if (actions.length === 0) return null;

  function applyStatus(status: AppointmentStatusOption) {
    updateStatus.mutate({ id: appointmentId, status });
  }

  function handleSelect(status: AppointmentStatusOption) {
    if (status === 'cancelled' || status === 'no-show') {
      setConfirmAction(status);
    } else {
      applyStatus(status);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size}
            disabled={updateStatus.isPending}
            onClick={(e) => e.stopPropagation()}
          >
            {updateStatus.isPending ? 'Updating…' : 'Update Status'}
            <ChevronDown className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action}
              className={cn('cursor-pointer', (action === 'cancelled' || action === 'no-show') && 'text-destructive')}
              onClick={() => handleSelect(action)}
            >
              Mark as {APPOINTMENT_STATUS_LABELS[action] ?? action}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={confirmAction === 'cancelled' ? 'Cancel Appointment?' : 'Mark as No-show?'}
        description={
          confirmAction === 'cancelled'
            ? 'Are you sure you want to cancel this appointment? This action cannot be undone.'
            : 'Are you sure this customer did not show up for their appointment? This action cannot be undone.'
        }
        cancelLabel="Keep Appointment"
        confirmLabel={confirmAction === 'cancelled' ? 'Cancel Appointment' : 'Mark No-show'}
        confirmingLabel="Updating…"
        destructive
        isConfirming={updateStatus.isPending}
        onConfirm={() => {
          if (confirmAction) applyStatus(confirmAction);
          setConfirmAction(null);
        }}
      />
    </>
  );
}
