'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RecordAppointmentPaymentDialog } from '@/components/dialogs/RecordAppointmentPaymentDialog';
import { useUpdateAppointmentStatus } from '@/hooks/useAppointments';
import { getStatusMenuActions, APPOINTMENT_STATUS_LABELS, type StatusMenuAction } from '@/constants/appointment';
import { isOrgAdmin } from '@/constants/roles';
import { useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';

interface AppointmentStatusMenuProps {
  appointmentId: string;
  currentStatus?: string;
  /** Lets "End session…" open the End Session dialog (outcome + payment in one step). */
  appointment?: Appointment | null;
  size?: 'sm' | 'default';
}

const ACTION_LABELS: Record<StatusMenuAction, string> = {
  confirmed: `Mark as ${APPOINTMENT_STATUS_LABELS.confirmed}`,
  'end-session': 'End session…',
  cancelled: `Mark as ${APPOINTMENT_STATUS_LABELS.cancelled}`,
  'no-show': `Mark as ${APPOINTMENT_STATUS_LABELS['no-show']}`,
  reopen: 'Reopen session',
};

type ConfirmAction = 'cancelled' | 'no-show' | 'reopen';

export function AppointmentStatusMenu({ appointmentId, currentStatus, appointment, size = 'sm' }: AppointmentStatusMenuProps) {
  const updateStatus = useUpdateAppointmentStatus();
  const role = useAuthStore((s) => s.user?.role);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [endSessionOpen, setEndSessionOpen] = useState(false);

  // Only a company admin (or above) may reopen a closed session; the backend enforces the same.
  const actions = getStatusMenuActions(currentStatus, isOrgAdmin(role));
  if (actions.length === 0) return null;

  function handleSelect(action: StatusMenuAction) {
    if (action === 'cancelled' || action === 'no-show' || action === 'reopen') {
      setConfirmAction(action);
    } else if (action === 'end-session') {
      if (appointment) setEndSessionOpen(true);
      // Without the appointment there is no dialog to show, so close it the old way.
      else updateStatus.mutate({ id: appointmentId, status: 'completed' });
    } else {
      updateStatus.mutate({ id: appointmentId, status: action });
    }
  }

  function applyConfirmed() {
    if (confirmAction === 'reopen') {
      // Back to "arrived": the session happened, it just is not finished any more.
      updateStatus.mutate({ id: appointmentId, status: 'arrived' });
    } else if (confirmAction) {
      updateStatus.mutate({ id: appointmentId, status: confirmAction });
    }
    setConfirmAction(null);
  }

  const confirmCopy: Record<ConfirmAction, { title: string; description: string; confirm: string; destructive: boolean }> = {
    cancelled: {
      title: 'Cancel Appointment?',
      description: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
      confirm: 'Cancel Appointment',
      destructive: true,
    },
    'no-show': {
      title: 'Mark as No-show?',
      description: 'Are you sure this customer did not show up for their appointment? This action cannot be undone.',
      confirm: 'Mark No-show',
      destructive: true,
    },
    reopen: {
      title: 'Reopen this session?',
      description: 'It goes back to Arrived so it can be ended again with the right outcome. Payments already recorded are kept.',
      confirm: 'Reopen session',
      destructive: false,
    },
  };
  const copy = confirmAction ? confirmCopy[confirmAction] : null;

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
              {ACTION_LABELS[action]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title={copy?.title ?? ''}
        description={copy?.description ?? ''}
        cancelLabel="Keep as is"
        confirmLabel={copy?.confirm ?? 'Confirm'}
        confirmingLabel="Updating…"
        destructive={copy?.destructive}
        isConfirming={updateStatus.isPending}
        onConfirm={applyConfirmed}
      />

      {appointment && (
        <RecordAppointmentPaymentDialog
          open={endSessionOpen}
          onOpenChange={setEndSessionOpen}
          appointment={appointment}
          endSession
        />
      )}
    </>
  );
}
