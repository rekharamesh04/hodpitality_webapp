'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isConfirming?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmingLabel = 'Working…',
  cancelLabel = 'Cancel',
  destructive = false,
  isConfirming = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !isConfirming && onOpenChange(v)}>
      <DialogContent className="sm:max-w-sm" aria-describedby="confirm-dialog-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="confirm-dialog-description">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} loading={isConfirming}>
            {isConfirming ? confirmingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
