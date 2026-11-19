'use client';

import { CheckCircle2, Circle, Hourglass } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReadinessItem } from '@/lib/zocdoc-readiness';

interface ZocdocPendingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** One sentence under the title, e.g. who this checklist is for. */
  description: string;
  items: readonly ReadinessItem[];
}

const ICON = {
  done: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />,
  todo: <Circle className="h-4 w-4 text-muted-foreground" aria-hidden />,
  pending: <Hourglass className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />,
} as const;

const STATE_LABEL = { done: 'Done', todo: 'To do', pending: 'Pending' } as const;

/**
 * The honest answer to "connect Zocdoc": it is not connected yet. Says what is
 * waiting on Zocdoc and what the clinic can already get ready, from real records.
 */
export function ZocdocPendingDialog({ open, onOpenChange, title, description, items }: ZocdocPendingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{title}</DialogTitle>
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              Pending
            </Badge>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">Zocdoc is not connected yet.</p>
          <p className="mt-1 text-xs">
            We are waiting for Zocdoc to approve our partner account. Until then nothing is sent to or
            received from Zocdoc, and no patient can book through it. You can get ready below.
          </p>
        </div>

        <ul className="space-y-3 py-1" aria-label="Zocdoc readiness">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{ICON[item.state]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span
                    className={cn(
                      'text-[11px] font-medium uppercase tracking-wide',
                      item.state === 'done' && 'text-emerald-700 dark:text-emerald-400',
                      item.state === 'todo' && 'text-muted-foreground',
                      item.state === 'pending' && 'text-amber-700 dark:text-amber-400',
                    )}
                  >
                    {STATE_LABEL[item.state]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
